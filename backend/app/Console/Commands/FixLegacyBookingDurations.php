<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\BlockedSlot;
use App\Models\Branch;
use App\Services\BookingDuration;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class FixLegacyBookingDurations extends Command
{
    protected $signature = 'app:fix-legacy-booking-durations
        {--dry-run : Tampilkan rencana tanpa mengubah data}
        {--from= : Tanggal mulai (Y-m-d), default besok WIB}
        {--force : Perpanjang walau bentrok terapis atau kapasitas ruang}';

    protected $description = 'Hitung ulang durasi booking lama yang masih memakai aturan paket lama (paket menyerap tiap add-on) menjadi aturan sekarang: paket gratis SATU layanan 15 menit.';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');
        $from = (string) ($this->option('from') ?: Carbon::now('Asia/Jakarta')->addDay()->toDateString());
        $now = Carbon::now('Asia/Jakarta');

        $this->info(($dry ? 'MODE DRY-RUN (tidak ada data yang diubah).' : 'Menerapkan perbaikan durasi.')
            ." Booking Pending/Confirmed tanggal >= {$from} WIB.");

        $appointments = Appointment::with(['details.service'])
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('appointment_date', '>=', $from)
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();

        $fixed = [];
        $skipped = [];

        foreach ($appointments as $appointment) {
            $services = $appointment->details->pluck('service')->filter()->values();

            // Booking tanpa layanan bukan urusan command ini.
            if ($services->isEmpty()) {
                continue;
            }

            $startMin = BookingDuration::minutesOf($appointment->start_time);
            $stored = BookingDuration::minutesOf($appointment->end_time) - $startMin;
            $expected = BookingDuration::totalMinutes($services);

            // Hanya booking yang terlalu pendek. Booking yang lebih panjang
            // (staff sengaja memperpanjang) dibiarkan apa adanya.
            if ($stored >= $expected) {
                continue;
            }

            $newEndMin = $startMin + $expected;
            $newEndLabel = substr(BookingDuration::timeOf($newEndMin), 0, 5);
            $label = sprintf(
                '%s | %s | %s | %s-%s -> %s (+%d mnt)',
                $appointment->booking_code,
                $appointment->customer_name,
                $appointment->appointment_date->format('Y-m-d'),
                substr($appointment->start_time, 0, 5),
                substr($appointment->end_time, 0, 5),
                substr($appointment->start_time, 0, 5).'-'.$newEndLabel,
                $expected - $stored
            );

            // 1. Jangan sentuh booking yang sudah lewat atau sedang berjalan.
            if ($appointment->appointment_date->toDateString() === $now->toDateString()
                && $startMin <= $now->hour * 60 + $now->minute) {
                $skipped[] = [$label, 'sudah lewat / sedang berjalan'];

                continue;
            }

            // 2. Bentrok dengan booking lain di terapis yang sama.
            $clash = $this->therapistClash($appointment, $startMin, $newEndMin);
            if ($clash !== null && ! $force) {
                $skipped[] = [$label, 'bentrok terapis dengan '.$clash];

                continue;
            }

            // 3. Kapasitas ruang (ruang diblokir dikurangi, sama seperti BookingController).
            $capacity = $this->capacityIssue($appointment, $startMin, $newEndMin);
            if ($capacity !== null && ! $force) {
                $skipped[] = [$label, $capacity];

                continue;
            }

            if (! $dry) {
                $appointment->end_time = BookingDuration::timeOf($newEndMin);
                $appointment->saveQuietly();
            }

            $fixed[] = $label;
        }

        foreach ($fixed as $line) {
            $this->line('  OK      '.$line);
        }

        foreach ($skipped as $skippedLine) {
            $this->warn('  LEWATI  '.$skippedLine[0].' — '.$skippedLine[1]);
        }

        $this->info(sprintf(
            '%s. Booking diperpanjang: %d. Dilewati (butuh tindakan staf): %d.',
            $dry ? 'Rencana' : 'Selesai',
            count($fixed),
            count($skipped)
        ));

        return 0;
    }

    /** Kode booking lain milik terapis sama yang tumpang tindih, atau null kalau tidak ada. */
    private function therapistClash(Appointment $appointment, int $from, int $to): ?string
    {
        // Booking auto-assign ("Rekomendasi Bulu Space") tetap punya therapist_id
        // asli di DB (cuma namanya yang dimask), jadi bentroknya tetap dihitung.
        if (! $appointment->therapist_id) {
            return null;
        }

        $date = $appointment->appointment_date->toDateString();

        $clash = Appointment::where('therapist_id', $appointment->therapist_id)
            ->where('id', '<>', $appointment->getKey())
            ->whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->get()
            ->first(fn (Appointment $other) => BookingDuration::minutesOf($other->start_time) < $to
                && BookingDuration::minutesOf($other->end_time) > $from);

        return $clash ? $clash->booking_code : null;
    }

    /** Alasan tidak muat, atau null kalau aman diperpanjang. */
    private function capacityIssue(Appointment $appointment, int $from, int $to): ?string
    {
        $branch = Branch::where('name', $appointment->location)->first();

        if (! $branch) {
            return 'cabang tidak dikenal ('.($appointment->location ?? 'kosong').')';
        }

        $date = $appointment->appointment_date->toDateString();

        $others = Appointment::where('location', $branch->name)
            ->where('id', '<>', $appointment->getKey())
            ->whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->get();

        $blockedRooms = BlockedSlot::where('branch_id', $branch->id)
            ->whereDate('date', $date)
            ->get()
            ->filter(fn (BlockedSlot $slot) => BookingDuration::minutesOf($slot->start_time) < $to
                && BookingDuration::minutesOf($slot->end_time) > $from)
            ->pluck('room_number')
            ->unique()
            ->count();

        $available = $branch->rooms_count - $blockedRooms;

        if ($available <= 0) {
            return 'semua ruang diblokir ('.$branch->rooms_count.' ruang)';
        }

        $peak = BookingDuration::peakOccupancy($others, $from, $to);

        // Logika sama dengan BookingController: harus ada minimal 1 ruang kosong
        // sepanjang window baru.
        if ($peak >= $available) {
            return sprintf(
                'ruang penuh: butuh %d, tersedia %d (%s punya %d ruang)',
                $peak + 1,
                $available,
                $branch->name,
                $branch->rooms_count
            );
        }

        return null;
    }
}