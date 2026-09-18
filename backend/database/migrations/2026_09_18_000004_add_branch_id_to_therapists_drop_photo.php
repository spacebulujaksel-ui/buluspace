<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('therapists', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('status')->constrained()->nullOnDelete();
        });

        Schema::table('therapists', function (Blueprint $table) {
            $table->dropColumn('photo');
        });
    }

    public function down(): void
    {
        Schema::table('therapists', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('phone');
        });

        Schema::table('therapists', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};