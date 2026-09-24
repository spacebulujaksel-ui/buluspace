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

    public const AUTO_THERAPIST_LABEL = 'Rekomendasi Bulu Space';

    protected $fillable = [
        'booking_code', 'user_id', 'therapist_id', 'appointment_date',
        'start_time', 'end_time', 'status', 'customer_name', 'customer_phone',
        'customer_email', 'customer_gender', 'location', 'notes', 'cancel_reason',
        'reminder_1_sent_at', 'reminder_2_sent_at', 'total_price',
        'is_auto_assign', 'import_hash',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'total_price' => 'decimal:2',
            'is_auto_assign' => 'boolean',
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

    /** Nama terapis yang AMAN ditampilkan ke customer/semua permukaan. */
    public function getTherapistDisplayAttribute(): ?string
    {
        return $this->is_auto_assign
            ? self::AUTO_THERAPIST_LABEL
            : $this->therapist?->name;
    }

    /**
     * Satu titik anonimisasi: SEMUA operasi Eloquent yang meng-serialize
     * appointment (website, admin, board, email) otomatis memakai label
     * "Rekomendasi Bulu Space" utk auto-assign, tanpa ubah controller/frontend.
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        if ($this->is_auto_assign && isset($array['therapist']) && is_array($array['therapist'])) {
            $array['therapist'] = [
                'id' => $array['therapist']['id'] ?? null,
                'name' => self::AUTO_THERAPIST_LABEL,
            ];
        }

        return $array;
    }

    public function canCancel(): bool
    {
        return in_array($this->status, ['Pending', 'Confirmed']);
    }
}
