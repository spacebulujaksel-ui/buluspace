<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;

class CleanupTestData extends Command
{
    protected $signature = 'app:cleanup-test-data {--dry-run : Tampilkan rencana tanpa mengubah data}';

    protected $description = 'Hapus booking test Jakarta Selatan (email spacebulujaksel@gmail.com atau lama < 2026-09-24). Booking yang punya review tidak dihapus.';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $appointments = Appointment::query()
            ->where('location', 'Jakarta Selatan')
            ->where(fn ($q) => $q
                ->where('customer_email', 'spacebulujaksel@gmail.com')
                ->orWhereDate('appointment_date', '<', '2026-09-24'))
            ->whereDoesntHave('reviews')
            ->get();

        if ($dry) {
            $this->line("Booking Jakarta Selatan akan dihapus: {$appointments->count()}");
            foreach ($appointments as $appointment) {
                $this->line(sprintf('  - %s | %s | %s | %s', $appointment->id, $appointment->booking_code, $appointment->appointment_date->format('Y-m-d'), $appointment->customer_name));
            }

            return 0;
        }

        foreach ($appointments as $appointment) {
            $appointment->delete();
        }

        $this->info("Cleanup selesai. Booking Jakarta Selatan dihapus: {$appointments->count()}.");

        return 0;
    }
}