<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('role')->constrained()->nullOnDelete();
        });

        $barat = DB::table('branches')->where('name', 'Jakarta Barat')->value('id');
        $selatan = DB::table('branches')->where('name', 'Jakarta Selatan')->value('id');

        if ($barat) {
            DB::table('users')->where('email', 'admin@buluspace.com')->update(['branch_id' => $barat]);
        }
        if ($selatan) {
            DB::table('users')->where('email', 'citraut@gmail.com')->update(['branch_id' => $selatan]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};