<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')->where('name', 'Full Legs')->update(['last_order_time' => '18:00:00']);
    }

    public function down(): void
    {
        DB::table('services')->where('name', 'Full Legs')->update(['last_order_time' => '18:30:00']);
    }
};