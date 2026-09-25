<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')->where('name', 'Cheek')->update([
            'description' => 'Waxing bulu halus di area pipi',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('services')->where('name', 'Cheek')->update([
            'description' => 'Waxing bulu halus di area pipi untuk wajah glowing',
            'updated_at' => now(),
        ]);
    }
};
