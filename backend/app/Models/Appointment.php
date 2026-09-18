<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code', 'user_id', 'therapist_id', 'appointment_date',
        'start_time', 'end_time', 'status', 'customer_name', 'customer_phone',
        'customer_email', 'customer_gender', 'location', 'notes', 'cancel_reason', 'total_price',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'total_price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function therapist(): BelongsTo
    {
        return $this->belongsTo(Therapist::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(AppointmentDetail::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'appointment_details', 'appointment_id', 'service_id')
            ->withPivot(['quantity', 'price']);
    }

    public function canCancel(): bool
    {
        if (!in_array($this->status, ['Pending', 'Confirmed'])) {
            return false;
        }

        $start = Carbon::parse($this->appointment_date->format('Y-m-d').' '.$this->start_time);
        $cutoff = $start->copy()->subDay();

        return now()->lt($cutoff);
    }
}