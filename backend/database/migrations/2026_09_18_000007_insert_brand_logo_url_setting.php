<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('email_settings')->updateOrInsert(
            ['type' => 'brand_logo_url'],
            [
                'subject' => '',
                'body' => 'https://greenyellow-gnat-454546.hostingersite.com/asset/img/logo-bulu.png',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('email_settings')->where('type', 'brand_logo_url')->delete();
    }
};