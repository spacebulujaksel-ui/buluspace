<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    private const CREDS = [
        ['from' => 'admin@buluspace.com', 'to' => 'adminjakbar@buluspace.com', 'pw' => 'adminjakbar123'],
        ['from' => 'citraut@gmail.com', 'to' => 'adminjaksel@buluspace.com', 'pw' => 'adminjaksel123'],
    ];

    public function up(): void
    {
        foreach (self::CREDS as $c) {
            DB::table('users')->where('email', $c['from'])->update([
                'email' => $c['to'],
                'password' => Hash::make($c['pw']),
            ]);
        }
    }

    public function down(): void
    {
        foreach (self::CREDS as $c) {
            DB::table('users')->where('email', $c['to'])->update([
                'email' => $c['from'],
                'password' => Hash::make($c['pw']),
            ]);
        }
    }
};