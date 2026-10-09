<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Soutenance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'depot_id',
        'session_soutenance_id',
        'room_id',
        'date',
        'status',
        'remarques',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'datetime',
        'status' => 'string',
    ];

    /**
     * Relation avec le dépôt.
     *
     * @return BelongsTo
     */
    public function depot(): BelongsTo
    {
        return $this->belongsTo(Depot::class);
    }

    /**
     * Relation avec la session de soutenance.
     *
     * @return BelongsTo
     */
    public function sessionSoutenance(): BelongsTo
    {
        return $this->belongsTo(SessionSoutenance::class, 'session_soutenance_id');
    }

    /**
     * Relation avec la salle.
     *
     * @return BelongsTo
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }
}
