<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_key',
        'type',
        'title',
        'message',
        'occurred_at',
        'read_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}