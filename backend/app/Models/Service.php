<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'price', 'duration_minutes', 'last_order_time', 'image', 'category', 'wax_type', 'status'];

    protected $casts = [
        'last_order_time' => 'string',
    ];
}