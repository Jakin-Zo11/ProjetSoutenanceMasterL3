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
        return static::first() ?? static::create([
            'heure_debut_journee' => '08:00:00',
            'heure_fin_journee' => '17:00:00',
            'duree_minutes' => 60,
        ]);
    }
}
