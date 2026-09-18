<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->timestamp('reminder_1_sent_at')->nullable()->after('cancel_reason');
            $table->timestamp('reminder_2_sent_at')->nullable()->after('reminder_1_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['reminder_1_sent_at', 'reminder_2_sent_at']);
        });
    }
};