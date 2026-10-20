<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Creneau extends Model
{
    use HasFactory;

    protected $table = 'creneaux';

    protected $fillable = [
        'reference',
        'heure_debut',
        'heure_fin',
        'jours',
        'type',
        'capacite',
        'actif',
    ];

    protected $casts = [
        'jours' => 'array',
        'capacite' => 'integer',
        'actif' => 'boolean',
    ];
}