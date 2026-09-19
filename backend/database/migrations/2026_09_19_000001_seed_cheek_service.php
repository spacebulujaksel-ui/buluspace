<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')->updateOrInsert(
            ['name' => 'Cheek'],
            [
                'category' => 'face',
                'duration_minutes' => 10,
                'wax_type' => 'Gentle Film Hard Wax',
                'description' => 'Membersihkan bulu halus di area pipi untuk wajah glowing',
                'price' => 37000,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('services')->where('name', 'Cheek')->delete();
    }
};