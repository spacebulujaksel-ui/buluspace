<?php

use App\Models\Branch;
use App\Models\Therapist;
use App\Models\TherapistOffDay;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Jadwal libur rutin mingguan — pola tetap per hari dalam seminggu, BEDA dari
 * cuti (rentang tanggal). day_of_week_iso = Carbon::parse()->dayOfWeekIso
 * (1=Senin .. 7=Minggu). Status terapis tidak diubah; hanya pemilihannya yang
 * diblokir di hari itu (guard di BookingController + off_day_ids di availability).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('therapist_off_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('therapist_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week_iso');
            $table->unique(['therapist_id', 'day_of_week_iso']);
            $table->timestamps();
        });

        $roster = [
            'Jakarta Selatan' => [
                1 => ['Ira'],
                2 => ['Siti', 'Anisha', 'Ros'],
                3 => ['Dwi', 'Kayla', 'Lya'],
                4 => ['Putri', 'Nazua'],
            ],
            'Jakarta Barat' => [
                1 => ['Silva'],
                2 => ['Silvia'],
                3 => ['Amanda'],
                4 => ['Diah'],
            ],
        ];

        foreach ($roster as $branchName => $days) {
            $branch = Branch::where('name', $branchName)->first();
            if (! $branch) {
                continue;
            }

            $ids = Therapist::where('branch_id', $branch->id)->get(['id', 'name'])
                ->pluck('id', 'name');

            foreach ($days as $iso => $names) {
                foreach ($names as $name) {
                    if (! isset($ids[$name])) {
                        continue;
                    }

                    TherapistOffDay::updateOrCreate(
                        ['therapist_id' => $ids[$name], 'day_of_week_iso' => $iso]
                    );
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('therapist_off_days');
    }
};