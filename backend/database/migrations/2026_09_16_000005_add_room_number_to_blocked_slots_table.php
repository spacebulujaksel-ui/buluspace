<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blocked_slots', function (Blueprint $table) {
            $table->unsignedInteger('room_number')->nullable()->after('branch_id');
        });

        DB::table('blocked_slots')->update(['room_number' => 1]);
    }

    public function down(): void
    {
        Schema::table('blocked_slots', function (Blueprint $table) {
            $table->dropColumn('room_number');
        });
    }
};