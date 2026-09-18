<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('therapists', function (Blueprint $table) {
            $table->dropColumn('room_number');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['room_number', 'room_type']);
        });
    }

    public function down(): void
    {
        Schema::table('therapists', function (Blueprint $table) {
            $table->unsignedInteger('room_number')->nullable()->after('experience_years');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->string('room_type', 30)->nullable()->after('location');
            $table->unsignedInteger('room_number')->nullable()->after('room_type');
        });
    }
};