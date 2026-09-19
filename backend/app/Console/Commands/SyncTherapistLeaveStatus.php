<?php

namespace App\Console\Commands;

use App\Models\Therapist;
use Illuminate\Console\Command;

class SyncTherapistLeaveStatus extends Command
{
    protected $signature = 'app:sync-therapist-leave-status';

    protected $description = 'Set terapis menjadi Inactive jika sedang dalam rentang cuti (hanya maju).';

    public function handle(): int
    {
        $count = 0;

        foreach (Therapist::with('leaves')->get() as $therapist) {
            if ($therapist->status === 'Active' && $therapist->isOnLeaveOn(today())) {
                $therapist->update(['status' => 'Inactive']);
                $count++;
            }
        }

        $this->info("{$count} terapis dinonaktifkan otomatis karena cuti.");

        return 0;
    }
}