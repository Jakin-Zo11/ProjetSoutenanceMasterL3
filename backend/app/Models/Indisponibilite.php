<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Indisponibilite extends Model
{
    protected $fillable = ['enseignant_id', 'date', 'heure_debut', 'heure_fin', 'motif'];

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(Enseignant::class);
    }
}