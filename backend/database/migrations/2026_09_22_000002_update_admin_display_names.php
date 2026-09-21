<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const NAMES = [
        ['email' => 'adminjakbar@buluspace.com', 'name' => 'admin jakbar', 'old' => 'Admin Utama'],
        ['email' => 'adminjaksel@buluspace.com', 'name' => 'admin jaksel', 'old' => 'Citra'],
    ];

    public function up(): void
    {
        foreach (self::NAMES as $n) {
            DB::table('users')->where('email', $n['email'])->update(['name' => $n['name']]);
        }
    }

    public function down(): void
    {
        foreach (self::NAMES as $n) {
            DB::table('users')->where('email', $n['email'])->update(['name' => $n['old']]);
        }
    }
};