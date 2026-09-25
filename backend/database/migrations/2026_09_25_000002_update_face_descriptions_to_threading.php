<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $descriptions = [
            'Cheek' => 'Threading bulu halus di area pipi',
            'Forehead' => 'Threading bulu halus area dahi',
            'Eyebrows' => 'Threading bentuk alis. Untuk pertama kali bisa ±30 menit',
            'Chin' => 'Threading bulu halus area dagu',
            'Upper Lip' => 'Threading bulu halus area atas bibir',
        ];

        foreach ($descriptions as $name => $description) {
            DB::table('services')->where('name', $name)->update([
                'description' => $description,
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        $descriptions = [
            'Cheek' => 'Waxing bulu halus di area pipi',
            'Forehead' => 'Membersihkan bulu halus area dahi',
            'Eyebrows' => 'Merapikan bentuk alis. Untuk pertama kali bisa ±30 menit',
            'Chin' => 'Waxing bulu halus area dagu',
            'Upper Lip' => 'Waxing bulu halus area atas bibir',
        ];

        foreach ($descriptions as $name => $description) {
            DB::table('services')->where('name', $name)->update([
                'description' => $description,
                'updated_at' => now(),
            ]);
        }
    }
};
