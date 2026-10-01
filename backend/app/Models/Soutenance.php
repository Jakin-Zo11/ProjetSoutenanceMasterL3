<?php
// app/Models/Soutenance.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soutenance extends Model
{
    use HasFactory;

    protected $fillable = [
    'depot_id', // <-- À ajouter
    'etudiant_id',
    'salle_id',
    'theme',
    'date_debut',
    'date_fin',
    'statut',
];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    public function depot()
{
    return $this->belongsTo(Depot::class);
}
    // Les 3 jurys assignes a cette soutenance
    public function affectationsJury()
    {
        return $this->hasMany(AffectationJury::class);
    }

    public function convocation()
    {
        return $this->hasOne(Convocation::class);
    }

    // TODO: activer une fois le modele Salle confirme (gere par Ntsoa)
    // public function salle()
    // {
    //     return $this->belongsTo(Salle::class);
    // }
}