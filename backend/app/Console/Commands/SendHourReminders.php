<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Services\BookingMailer;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendHourReminders extends Command
{
    protected $signature = 'app:send-hour-reminders';

    protected $description = 'Kirim email pengingat untuk booking yang mulai dalam 30 menit (sekali per booking).';

    public function handle(): int
    {
        $now = now();

        $items = Appointment::with(['therapist', 'details.service'])
            ->whereDate('appointment_date', $now->toDateString())
            ->whereNull('reminder_2_sent_at')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->get()
            ->filter(function (Appointment $appointment) use ($now) {
                $start = Carbon::parse($appointment->appointment_date->format('Y-m-d').' '.$appointment->start_time);

                return $now->gte($start->copy()->subMinutes(30)) && $now->lt($start);
            });

        foreach ($items as $appointment) {
            BookingMailer::toCustomer($appointment, 'reminder_hours');
            $appointment->update(['reminder_2_sent_at' => now()]);
        }

        $this->info('Reminder 30 menit diproses untuk '.$items->count().' booking.');

        return 0;
    }
}