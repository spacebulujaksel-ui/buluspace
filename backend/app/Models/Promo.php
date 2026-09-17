<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'tag', 'title', 'highlight_text', 'description', 'discount_badge',
        'valid_until', 'cta_text', 'promo_code', 'bg_gradient', 'accent_color',
        'image', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'valid_until' => 'date',
            'is_active' => 'boolean',
        ];
    }
}