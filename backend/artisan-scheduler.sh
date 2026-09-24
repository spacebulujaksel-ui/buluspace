#!/bin/sh
cd /home/u536906329/domains/antiquewhite-oyster-416288.hostingersite.com/public_html
/usr/bin/php artisan schedule:run >> storage/logs/schedule.log 2>&1