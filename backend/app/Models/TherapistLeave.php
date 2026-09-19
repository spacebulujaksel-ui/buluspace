<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TherapistLeave extends Model
{
    protected $fillable = ['therapist_id', 'start_date', 'end_date'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function therapist(): BelongsTo
    {
        return $this->belongsTo(Therapist::class);
    }
}