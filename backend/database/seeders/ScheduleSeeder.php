<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $therapists = [1, 2, 4, 5];

        foreach ($therapists as $tId) {
            foreach (range(0, 6) as $dayOffset) {
                $date = $now->copy()->addDays($dayOffset)->toDateString();
                foreach (['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] as $slot) {
                    $h = (int) explode(':', $slot)[0];
                    Schedule::create([
                        'therapist_id' => $tId,
                        'schedule_date' => $date,
                        'start_time' => $slot,
                        'end_time' => ($h + 1) . ':00',
                        'status' => $dayOffset < 1 && $h < 12 ? 'Not Available' : 'Available',
                    ]);
                }
            }
        }
    }
}