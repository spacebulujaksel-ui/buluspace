<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')->where('name', 'Clean Girl')->update([
            'description' => 'Threading Eyebrows + Upper Lip + Forehead',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('services')->where('name', 'Clean Girl')->update([
            'description' => 'Waxing Eyebrows + Upper Lip + Forehead',
            'updated_at' => now(),
        ]);
    }
};
