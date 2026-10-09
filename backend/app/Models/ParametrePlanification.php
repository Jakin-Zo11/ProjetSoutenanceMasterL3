<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametrePlanification extends Model
{
    protected $table = 'parametres_planification';

    protected $fillable = [
        'heure_debut_journee',
        'heure_fin_journee',
        'duree_minutes',
    ];

    public static function actuel(): self
    {
        return static::first() ?? static::create([]);
    }
}