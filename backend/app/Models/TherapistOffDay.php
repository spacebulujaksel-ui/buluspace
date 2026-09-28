<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TherapistOffDay extends Model
{
    protected $fillable = ['therapist_id', 'day_of_week_iso'];

    public function therapist(): BelongsTo
    {
        return $this->belongsTo(Therapist::class);
    }
}