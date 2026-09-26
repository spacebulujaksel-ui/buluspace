<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ponytail: ENUM ini MySQL-only. Di SQLite (khusus test) kolomnya sudah varchar, jadi lewati.
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('Pending','Confirmed','Completed','Cancelled','Rejected') DEFAULT 'Pending'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending'");
    }
};
