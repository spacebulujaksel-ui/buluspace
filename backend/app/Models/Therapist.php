<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Therapist extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'phone', 'specialty', 'experience_years', 'branch_id', 'status'];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function leaves(): HasMany
    {
        return $this->hasMany(TherapistLeave::class);
    }
}