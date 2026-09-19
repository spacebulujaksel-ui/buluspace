<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->time('last_order_time')->nullable()->after('duration_minutes');
        });

        DB::table('services')->where('name', 'Full Legs')->update(['last_order_time' => '17:30:00']);
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('last_order_time');
        });
    }
};