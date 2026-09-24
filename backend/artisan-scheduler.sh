#!/bin/sh
cd /home/u536906329/domains/antiquewhite-oyster-416288.hostingersite.com/public_html
/usr/bin/php artisan app:send-hour-reminders >> storage/logs/schedule.log 2>&1
/usr/bin/php artisan app:send-h1-reminders >> storage/logs/schedule.log 2>&1
/usr/bin/php artisan app:sync-therapist-leave-status >> storage/logs/schedule.log 2>&1