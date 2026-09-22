<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const DESCRIPTIONS = [
        'Half Arms' => 'Waxing lengan bawah hingga ujung tangan',
        'Full Arms' => 'Waxing lengan menyeluruh dari bahu hingga ujung tangan',
    ];

    public function up(): void
    {
        foreach (self::DESCRIPTIONS as $name => $desc) {
            DB::table('services')->where('name', $name)->update(['description' => $desc]);
        }
    }

    public function down(): void
    {
        foreach (self::DESCRIPTIONS as $name => $desc) {
            DB::table('services')->where('name', $name)->update(['description' => $desc]);
        }
    }
};