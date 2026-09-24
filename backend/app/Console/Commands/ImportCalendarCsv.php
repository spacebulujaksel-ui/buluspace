<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ImportCalendarCsv extends Command
{
    protected $signature = 'app:import-calendar-csv
        {--file= : Path file CSV (SUMMARY,DTSTART,DTEND,DESCRIPTION,STATUS)}
        {--branch= : Nama cabang untuk semua baris (mis. "Jakarta Selatan")}
        {--date-from= : Hanya import mulai tanggal ini (Y-m-d), default hari ini}
        {--wipe : Hapus dulu semua booking cabang tanpa review sebelum import}
        {--dry-run : Pratinjau tanpa mengubah data}';

    protected $description = 'Import booking dari ekspor Google Calendar (CSV) ke appointments.';

    private array $serviceHashes = [];

    public function handle(): int
    {
        $file = $this->option('file');
        $branchName = $this->option('branch');
        $dateFrom = $this->option('date-from') ?? now('Asia/Jakarta')->toDateString();

        if (!$file || !is_file($file)) {
            $this->error("File tidak ditemukan: {$file}");

            return 1;
        }

        $branch = Branch::where('name', $branchName)->first();
        if (!$branch) {
            $this->error("Cabang tidak ditemukan: {$branchName}");

            return 1;
        }

        $dry = (bool) $this->option('dry-run');
        $wipe = (bool) $this->option('wipe');

        if ($wipe) {
            $toWipe = Appointment::where('location', $branch->name)->whereDoesntHave('reviews')->get();
            $this->line("Wipe cabang {$branch->name}: {$toWipe->count()} booking (tanpa review) akan dihapus.");
            if (!$dry) {
                foreach ($toWipe as $apt) {
                    $apt->delete();
                }
            }
        }

        $rows = $this->readCsv($file);
        if (empty($rows)) {
            $this->error('File CSV kosong atau hanya berisi header.');

            return 1;
        }

        $format = array_key_exists('SUMMARY', $rows[0])
            ? 'calendar'
            : (array_key_exists('Waktu Mulai', $rows[0]) ? 'spreadsheet' : null);

        if ($format === null) {
            $this->error('Format CSV tidak dikenali (butuh kolom SUMMARY/DTSTART atau Waktu Mulai/Tanggal/Bulan/Tahun).');

            return 1;
        }

        $therapist = Therapist::where('branch_id', $branch->id)->where('status', 'Active')->first();

        if (!$therapist) {
            $this->error("Tidak ada terapis Active di cabang {$branch->name}.");

            return 1;
        }

        $services = Service::where('status', 'Active')->get();

        $created = 0;
        $skipped = 0;
        $rejected = 0;

        foreach ($rows as $i => $row) {
            $line = $i + 1;
            $n = $this->normalize($row, $format);

            if ($n === null) {
                $rejected++;

                continue;
            }

            $summary = $n['summary'];
            $description = $n['description'];

            if ($summary === '' || preg_match('/^(BREAK|LIBUR|TRAINING|OFF|KOSONG|CANCEL)/i', $summary)) {
                $skipped++;

                continue;
            }

            $start = $this->parseDate($n['start']);
            $end = $this->parseDate($n['end']);

            if (!$start || !$end) {
                $this->warn("baris {$line}: tanggal tidak valid, di-skip.");
                $rejected++;

                continue;
            }

            if ($start->toDateString() < $dateFrom) {
                $skipped++;

                continue;
            }

            if ($end->lte($start)) {
                $this->warn("baris {$line}: end <= start, di-skip.");
                $rejected++;

                continue;
            }

            $name = mb_substr($summary ?: 'Pelanggan', 0, 100);
            $hash = md5($branch->name.'|'.$start->toDateString().'|'.$start->format('H:i').'|'.$end->format('H:i').'|'.$name);

            if (Appointment::where('import_hash', $hash)->exists()) {
                $skipped++;

                continue;
            }

            $matched = $this->matchServices($services, $description.' '.$summary);

            $assignedTherapist = $therapist;
            $isAuto = true;
            $tName = $n['therapist'];

            if ($tName !== '') {
                $norm = strtolower(preg_replace('/^\s*(mba|mbak|kak|mas)\s+/i', '', $tName));
                $norm = preg_replace('/[^a-z]+/i', ' ', $norm);
                $found = $this->matchTherapist($norm, $branch->id);

                if ($found) {
                    $assignedTherapist = $found;
                    $isAuto = false;
                } else {
                    $this->warn("baris {$line}: terapis '{$tName}' tidak cocok di {$branch->name}, pakai Rekomendasi.");
                }
            }

            if ($dry) {
                $created++;

                $this->line(sprintf('  [rencana] %s | %s %s-%s | %s | terapis %s | Rp.%s',
                    $start->toDateString(),
                    $name,
                    $start->format('H:i'),
                    $end->format('H:i'),
                    $matched->count() ? $matched->pluck('name')->implode(', ') : '(tanpa treatment)',
                    $isAuto ? 'Rekomendasi' : $assignedTherapist->name,
                    number_format($matched->sum('price'), 0, ',', '.'),
                ));

                continue;
            }

            $booking = Appointment::create([
                'booking_code' => $this->generateCode(),
                'therapist_id' => $assignedTherapist->id,
                'appointment_date' => $start->toDateString(),
                'start_time' => $start->format('H:i'),
                'end_time' => $end->format('H:i'),
                'status' => 'Confirmed',
                'customer_name' => $name,
                'customer_phone' => '-',
                'location' => $branch->name,
                'total_price' => $matched->sum('price'),
                'is_auto_assign' => $isAuto,
                'import_hash' => $hash,
            ]);

            foreach ($matched as $service) {
                AppointmentDetail::create([
                    'appointment_id' => $booking->id,
                    'service_id' => $service->id,
                    'quantity' => 1,
                    'price' => $service->price,
                ]);
            }

            $created++;
        }

        $this->info(sprintf('Selesai. Dibuat: %d, di-skip: %d, ditolak: %d.', $created, $skipped, $rejected));

        return 0;
    }

    private function readCsv(string $file): array
    {
        $fh = fopen($file, 'r');
        $header = fgetcsv($fh);
        if (is_array($header)) {
            $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0] ?? '');
        }
        $map = array_flip(array_map('trim', $header ?: []));
        $rows = [];

        while (($line = fgetcsv($fh)) !== false) {
            if (!is_array($line) || count($line) === 0) {
                continue;
            }
            $row = [];
            foreach ($map as $col => $idx) {
                $row[$col] = isset($line[$idx]) ? trim($line[$idx]) : '';
            }
            $rows[] = $row;
        }
        fclose($fh);

        return $rows;
    }

    private function normalize(array $row, string $format): ?array
    {
        if ($format === 'calendar') {
            return [
                'summary' => trim($row['SUMMARY'] ?? ''),
                'description' => trim($row['DESCRIPTION'] ?? ''),
                'start' => trim($row['DTSTART'] ?? ''),
                'end' => trim($row['DTEND'] ?? ''),
                'therapist' => '',
            ];
        }

        $months = [
            'January' => 1, 'February' => 2, 'March' => 3, 'April' => 4,
            'May' => 5, 'June' => 6, 'July' => 7, 'August' => 8,
            'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12,
        ];
        $year = trim($row['Tahun'] ?? '');
        $month = $months[$row['Bulan'] ?? ''] ?? null;
        $day = trim($row['Tanggal'] ?? '');
        $startTime = trim($row['Waktu Mulai'] ?? '');
        $endTime = trim($row['Waktu Selesai'] ?? '');

        if ($month === null || !preg_match('/^\d{4}$/', $year) || !preg_match('/^\d{1,2}$/', $day)
            || !preg_match('/^\d{1,2}:\d{2}$/', $startTime) || !preg_match('/^\d{1,2}:\d{2}$/', $endTime)) {
            return null;
        }

        $compose = fn (string $time) => sprintf(
            '%04d%02d%02dT%02d%02d00',
            (int) $year,
            $month,
            (int) $day,
            (int) substr($time, 0, 2),
            (int) substr($time, 3, 2),
        );

        return [
            'summary' => trim($row['Nama Customer'] ?? ''),
            'description' => $this->extractTreatment($row),
            'start' => $compose($startTime),
            'end' => $compose($endTime),
            'therapist' => $this->extractTherapist($row),
        ];
    }

    private function extractTreatment(array $row): string
    {
        $direct = trim($row['Treatment'] ?? '');
        if ($direct !== '') {
            return $direct;
        }

        $catatan = trim($row['Catatan'] ?? '');
        if ($catatan === '' || !preg_match('/Treatment\s*:\s*([^\r\n]+?)(?:\s+Pax\s*:|\s+Cabang\s*:|\s+HP\s*:|\s+Booking\s+via\s*:|\s+Therapist\s*:|\s*$)/i', $catatan, $m)) {
            return '';
        }

        return trim($m[1]);
    }

    private function extractTherapist(array $row): string
    {
        $direct = trim($row['Therapist'] ?? '');
        if ($direct !== '') {
            return $direct;
        }

        $catatan = trim($row['Catatan'] ?? '');
        if ($catatan === '' || !preg_match('/Therapist\s*:\s*([^\s,;]+(?:\s+[^\s,;]+)*)/i', $catatan, $m)) {
            return '';
        }

        $name = $m[1];

        return preg_replace('/\s*(Pax|Cabang|HP|Booking)\s*:.*$/i', '', $name);
    }

    private function matchTherapist(string $normalized, int $branchId): ?Therapist
    {
        $norm = trim(strtolower(preg_replace('/\s+/', ' ', $normalized)));

        return Therapist::where('branch_id', $branchId)
            ->where('status', 'Active')
            ->get()
            ->first(fn (Therapist $t) => trim(strtolower($t->name)) === $norm);
    }

    private function parseDate(string $value): ?Carbon
    {
        if ($value === '') {
            return null;
        }
        if (substr($value, -1) === 'Z') {
            return Carbon::createFromFormat('Ymd\THis\Z', $value, 'UTC')->setTimezone('Asia/Jakarta');
        }

        return Carbon::createFromFormat('Ymd\THis', $value, 'Asia/Jakarta');
    }

    private function matchServices($services, string $text): \Illuminate\Support\Collection
    {
        $norm = strtolower(preg_replace('/[^a-z0-9 ]+/i', ' ', $text));

        $aliases = [
            'feel smooth' => 'Feel Smooth',
            'bali ready' => 'Bali Ready',
            'clean girl' => 'Clean Girl',
            'eyebrows' => 'Eyebrows',
            'upper lip' => 'Upper Lip',
            'upperlips' => 'Upper Lip',
            'underarms' => 'Underarms',
            'underarm' => 'Underarms',
            'forehead' => 'Forehead',
            'chin' => 'Chin',
            'cheek' => 'Cheek',
            'half arms' => 'Half Arms',
            'halfarms' => 'Half Arms',
            'full arms' => 'Full Arms',
            'fullarms' => 'Full Arms',
            'chest' => 'Chest',
            'stomach' => 'Stomach',
            'full front' => 'Full Front',
            'full back' => 'Full Back',
            'half legs' => 'Half Legs',
            'halflegs' => 'Half Legs',
            'full legs' => 'Full Legs',
            'fulllegs' => 'Full Legs',
            'basic bikini' => 'Basic Bikini',
            'brazillian' => 'Brazilian',
            'brazilian' => 'Brazilian',
            'brizillian' => 'Brazilian',
            'brazill' => 'Brazilian',
            'buttocks' => 'Buttocks',
            'buttock' => 'Buttocks',
        ];

        $hits = [];
        foreach ($aliases as $needle => $serviceName) {
            if (str_contains($norm, $needle) && !isset($hits[$serviceName])) {
                $hits[$serviceName] = true;
            }
        }

        return $services->filter(fn (Service $s) => isset($hits[$s->name]))->values();
    }

    private function generateCode(): string
    {
        do {
            $code = 'BS-'.str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        } while (Appointment::where('booking_code', $code)->exists());

        return $code;
    }
}