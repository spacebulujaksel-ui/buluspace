<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockedSlot extends Model
{
    protected $fillable = ['branch_id', 'room_number', 'date', 'start_time', 'end_time', 'note'];

    protected $casts = [
        'room_number' => 'integer',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}