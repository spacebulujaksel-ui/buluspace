<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Services\BookingMailer;
use Illuminate\Console\Command;

class SendH1Reminders extends Command
{
    protected $signature = 'app:send-h1-reminders';

    protected $description = 'Kirim email pengingat H-1 untuk booking besok (sekali per booking).';

    public function handle(): int
    {
        $items = Appointment::with(['therapist', 'details.service'])
            ->whereDate('appointment_date', now()->addDay()->toDateString())
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereNull('reminder_1_sent_at')
            ->get();

        foreach ($items as $appointment) {
            BookingMailer::toCustomer($appointment, 'reminder_h1');
            $appointment->update(['reminder_1_sent_at' => now()]);
        }

        $this->info('Reminder H-1 diproses untuk '.$items->count().' booking.');

        return 0;
    }
}