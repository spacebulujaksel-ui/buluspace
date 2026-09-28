<?php

use App\Models\Therapist;
use App\Models\TherapistLeave;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * app:sync-therapist-leave-status menulis cuti berdate ke kolom therapists.status
 * (global, tanpa tanggal) dan tidak pernah memulihkannya, sehingga satu hari cuti
 * membuat terapis terkunci permanen — booking tanggal berikutnya ditolak dengan
 * "Terapis sedang tidak aktif" walau cutinya sudah lewat.
 *
 * Booking pada tanggal di dalam rentang cuti sudah diblokir terpisah, per tanggal,
 * di BookingController ($leaveIds) dan PublicController::availability (on_leave_ids).
 * Jadi status cukup jadi saklar manual staf saja; di sini hanya dipulihkan.
 */
return new class extends Migration
{
    public function up(): void
    {
        $today = Carbon::now('Asia/Jakarta')->toDateString();

        $autoDisabledIds = TherapistLeave::whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->distinct()
            ->pluck('therapist_id');

        $reactivated = Therapist::where('status', 'Inactive')
            ->whereIn('id', $autoDisabledIds)
            ->get();

        if ($reactivated->isEmpty()) {
            return;
        }

        foreach ($reactivated as $therapist) {
            $therapist->update(['status' => 'Active']);
        }

        Log::info('Terapis dipulihkan ke Active: nonaktif otomatis oleh cuti, cuti hari ini sudah tidak menghalangi', [
            'therapists' => $reactivated->pluck('name')->all(),
        ]);
    }

    public function down(): void
    {
        // Tidak bisa dibedakan dari Inactive manual, jadi tidak dipulihkan.
    }
};
