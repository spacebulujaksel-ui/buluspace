<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('tag', 50);
            $table->string('title', 150);
            $table->string('highlight_text', 150)->nullable();
            $table->text('description')->nullable();
            $table->string('discount_badge', 50)->nullable();
            $table->date('valid_until')->nullable();
            $table->string('cta_text', 80)->default('BOOK NOW');
            $table->string('promo_code', 30)->nullable();
            $table->string('bg_gradient', 120)->nullable();
            $table->string('accent_color', 20)->default('#F472B6');
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};