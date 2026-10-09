<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Depot extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'etudiant_id',
        'promotion_id',
        'type',
        'title',
        'file_path',
        'status',
        'remarque',
        'submitted_at',
        'validated_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'submitted_at' => 'datetime',
        'validated_at' => 'datetime',
        'status' => 'string',
    ];

    /**
     * Relation avec l'étudiant.
     *
     * @return BelongsTo
     */
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    /**
     * Relation avec la promotion.
     *
     * @return BelongsTo
     */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * Relation avec les soutenances.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function soutenances()
    {
        return $this->hasMany(Soutenance::class);
    }
}
