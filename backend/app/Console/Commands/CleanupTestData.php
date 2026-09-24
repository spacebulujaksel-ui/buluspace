<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\ChatSession;
use App\Models\WalkIn;
use Illuminate\Console\Command;

class CleanupTestData extends Command
{
    protected $signature = 'app:cleanup-test-data {--dry-run : Tampilkan rencana tanpa mengubah data}';

    protected $description = 'Hapus booking lama/test, walk-in, dan sesi chat tertutup. Booking yang punya review tidak dihapus.';

    private const TEST_EMAILS = [
        'faadlikurniawan9@gmail.com',
        'lemuelrct45@gmail.com',
        'manjing040@gmail.com',
        'matthewpaniroy@gmail.com',
        'spacebulu@gmail.com',
        'ruthsafira18@gmail.com',
        'stellarpulse6@gmail.com',
    ];

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $appointments = Appointment::query()
            ->where(fn ($q) => $q
                ->whereDate('appointment_date', '<', '2026-09-24')
                ->orWhereIn('customer_email', self::TEST_EMAILS))
            ->whereDoesntHave('reviews')
            ->get();

        $closedChats = ChatSession::where('status', 'closed')->get();
        $walkIns = WalkIn::all();

        if ($dry) {
            $this->line("Booking akan dihapus: {$appointments->count()}");
            $this->line("Sesi chat tertutup akan dihapus: {$closedChats->count()}");
            $this->line("Walk-in akan dihapus: {$walkIns->count()}");

            return 0;
        }

        foreach ($appointments as $appointment) {
            $appointment->delete();
        }

        foreach ($closedChats as $chat) {
            $chat->delete();
        }

        foreach ($walkIns as $walkIn) {
            $walkIn->delete();
        }

        $this->info("Cleanup selesai. Booking dihapus: {$appointments->count()}, chat tertutup: {$closedChats->count()}, walk-in: {$walkIns->count()}.");

        return 0;
    }
}