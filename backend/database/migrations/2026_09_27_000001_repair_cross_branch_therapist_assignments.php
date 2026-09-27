<?php

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Therapist;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Booking yang therapist_id-nya menunjuk terapis cabang lain (bug: situs tidak
 * reset pilihan terapis saat cabang diganti + backend tidak cek cabang).
 * Diperbaiki jadi auto-assign supaya tampil "Rekomendasi Bulu Space".
 */
return new class extends Migration
{
    public function up(): void
    {
        $branchIds = Branch::pluck('id', 'name');

        $wrong = Appointment::with('therapist')
            ->get()
            ->filter(function (Appointment $appointment) use ($branchIds) {
                $target = $branchIds[$appointment->location] ?? null;

                return $target !== null && $appointment->therapist && $appointment->therapist->branch_id !== $target;
            });

        foreach ($wrong as $appointment) {
            $target = $branchIds[$appointment->location];
            $replacement = $this->leastBusyTherapist($target, $appointment);

            if (! $replacement) {
                Log::warning('Repair terapis lintas cabang: tidak ada terapis Active di cabang tujuan', [
                    'booking' => $appointment->booking_code,
                    'cabang' => $appointment->location,
                ]);
            }

            $appointment->update([
                'therapist_id' => $replacement?->id,
                'is_auto_assign' => true,
            ]);
        }
    }

    /**
     * Terapis Active di cabang tujuan yang paling tidak overlap di tanggal + jam itu.
     * Sortby stabil (PHP 8), jadi seri tetap urut id.
     */
    private function leastBusyTherapist(int $branchId, Appointment $appointment): ?Therapist
    {
        $date = $appointment->appointment_date->format('Y-m-d');
        $start = Carbon::parse($date.' '.$appointment->start_time);
        $end = Carbon::parse($date.' '.$appointment->end_time);

        return Therapist::where('branch_id', $branchId)
            ->where('status', 'Active')
            ->orderBy('id')
            ->get()
            ->sortBy(fn (Therapist $therapist) => Appointment::where('therapist_id', $therapist->id)
                ->whereDate('appointment_date', $date)
                ->whereIn('status', ['Pending', 'Confirmed', 'Completed'])
                ->get()
                ->filter(function (Appointment $other) use ($date, $start, $end) {
                    $otherStart = Carbon::parse($date.' '.$other->start_time);
                    $otherEnd = Carbon::parse($date.' '.$other->end_time);

                    return $start->lt($otherEnd) && $end->gt($otherStart);
                })
                ->count())
            ->first();
    }

    public function down(): void
    {
        // Id terapis asli tidak disimpan, jadi tidak bisa dipulihkan.
    }
};
