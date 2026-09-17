<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            BranchSeeder::class,
            UserSeeder::class,
            TherapistSeeder::class,
            ServiceSeeder::class,
            PromoSeeder::class,
            ScheduleSeeder::class,
            SampleBookingSeeder::class,
        ]);
    }
}