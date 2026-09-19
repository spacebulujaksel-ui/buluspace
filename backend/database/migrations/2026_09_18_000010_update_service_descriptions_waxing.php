<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $updates = [
            'Forehead' => 'Waxing bulu halus area dahi',
            'Eyebrows' => 'Waxing bentuk alis. Untuk pertama kali bisa ±30 menit',
            'Chin' => 'Waxing bulu halus area dagu',
            'Upper Lip' => 'Waxing bulu halus area atas bibir',
            'Underarms' => 'Waxing bulu ketiak sepenuhnya',
            'Chest' => 'Waxing bulu area dada',
            'Stomach' => 'Waxing bulu area perut',
            'Full Back' => 'Waxing bulu area punggung',
            'Basic Bikini' => 'Waxing bulu area bikini line',
            'Buttocks' => 'Waxing bulu area bokong',
            'Clean Girl' => 'Waxing Eyebrows + Upper Lip + Forehead',
            'Feel Smooth' => 'Waxing Full Legs + Full Arms',
            'Bali Ready' => 'Waxing Underarms + Half Legs + Brazilian',
        ];

        foreach ($updates as $name => $description) {
            DB::table('services')->where('name', $name)->update(['description' => $description]);
        }
    }

    public function down(): void
    {
        $reverts = [
            'Forehead' => 'Membersihkan bulu halus area dahi',
            'Eyebrows' => 'Merapikan bentuk alis. Untuk pertama kali bisa ±30 menit',
            'Chin' => 'Membersihkan bulu halus area dagu',
            'Upper Lip' => 'Membersihkan bulu halus area atas bibir',
            'Underarms' => 'Membersihkan bulu ketiak sepenuhnya',
            'Chest' => 'Membersihkan bulu area dada',
            'Stomach' => 'Membersihkan bulu area perut',
            'Full Back' => 'Membersihkan bulu area punggung',
            'Basic Bikini' => 'Merapikan bulu area bikini line',
            'Buttocks' => 'Membersihkan bulu area bokong',
            'Clean Girl' => 'Eyebrows + Upper Lip + Forehead',
            'Feel Smooth' => 'Full Legs + Full Arms',
            'Bali Ready' => 'Underarms + Half Legs + Brazilian',
        ];

        foreach ($reverts as $name => $description) {
            DB::table('services')->where('name', $name)->update(['description' => $description]);
        }
    }
};