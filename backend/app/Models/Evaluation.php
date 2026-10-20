<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'soutenance_id',
        'jury_user_id',
        'note_presentation',
        'note_manuscrit',
        'note_reponses',
        'note_finale',
        'note_generale',
        'remarques',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'note_presentation' => 'decimal:2',
        'note_manuscrit' => 'decimal:2',
        'note_reponses' => 'decimal:2',
        'note_finale' => 'decimal:2',
        'status' => 'string',
    ];

    /**
     * Relation avec la soutenance.
     *
     * @return BelongsTo
     */
    public function soutenance(): BelongsTo
    {
        return $this->belongsTo(Soutenance::class);
    }

    /**
     * Relation avec le membre du jury.
     *
     * @return BelongsTo
     */
    public function juryUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'jury_user_id');
    }

    /**
     * Calculer la note finale automatiquement.
     *
     * @return void
     */
    public function calculerNoteFinale()
    {
        $presentation = $this->note_presentation ?? 0;
        $manuscrit = $this->note_manuscrit ?? 0;
        $reponses = $this->note_reponses ?? 0;

        // Pondération : 40% présentation, 30% manuscrit, 30% réponses
        $this->note_finale = ($presentation * 0.4) + ($manuscrit * 0.3) + ($reponses * 0.3);
    }
}
