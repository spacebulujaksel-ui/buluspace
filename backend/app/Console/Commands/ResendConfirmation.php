<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Services\BookingMailer;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ResendConfirmation extends Command
{
    protected $signature = 'app:resend-confirmation
        {--date= : Filter tanggal pembuatan booking (Y-m-d)}
        {--from= : Awal rentang created_at (Y-m-d H:i)}
        {--to= : Akhir rentang created_at (Y-m-d H:i)}
        {--limit=100 : Maksimal email per eksekusi}
        {--delay=3 : Jeda detik antar email}
        {--dry-run : Tampilkan daftar saja tanpa mengirim}';

    protected $description = 'Kirim ulang email konfirmasi booking (mis. yang gagal karena rate limit SMTP).';

    public function handle(): int
    {
        $query = Appointment::with(['therapist', 'details.service'])
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->orderBy('id');

        if ($from = $this->option('from')) {
            $query->where('created_at', '>=', Carbon::parse($from));
        } elseif ($date = $this->option('date')) {
            $query->whereDate('created_at', $date);
        }

        if ($to = $this->option('to')) {
            $query->where('created_at', '<=', Carbon::parse($to));
        }

        $items = $query->limit(max(1, (int) $this->option('limit')))->get();

        if ($items->isEmpty()) {
            $this->info('Tidak ada booking yang cocok.');

            return 0;
        }

        $this->info(($this->option('dry-run') ? 'Akan kirim ulang ' : 'Mengirim ulang ')
            .$items->count().' konfirmasi.');

        foreach ($items as $appointment) {
            $this->line(sprintf(
                '%-12s %-18s %s %s-%s %s',
                $appointment->booking_code,
                substr($appointment->customer_name, 0, 18),
                $appointment->appointment_date?->format('d/m/Y'),
                substr($appointment->start_time, 0, 5),
                substr($appointment->end_time, 0, 5),
                $appointment->customer_email,
            ));

            if ($this->option('dry-run')) {
                continue;
            }

            if (!BookingMailer::toCustomer($appointment, 'booking_confirmation')) {
                $this->error('Gagal kirim di '.$appointment->booking_code.' — dihentikan agar tidak menabrak rate limit lagi.');

                return 1;
            }

            if ($delay = (int) $this->option('delay')) {
                sleep($delay);
            }
        }

        return 0;
    }
}
