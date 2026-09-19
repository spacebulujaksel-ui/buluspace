<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:send-h1-reminders')->dailyAt('18:00');
Schedule::command('app:send-hour-reminders')->everyFifteenMinutes();
Schedule::command('app:sync-therapist-leave-status')->hourly();
