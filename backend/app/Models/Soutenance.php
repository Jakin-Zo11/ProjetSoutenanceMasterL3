<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soutenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'depot_id',
        'etudiant_id',
        'salle_id',
        'theme',
        'date_debut',
        'date_fin',
        'statut',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin'   => 'datetime',
    ];

    // --- RELATIONS DE BASE ---

    public function depot()
    {
        return $this->belongsTo(Depot::class);
    }

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function salle()
    {
        return $this->belongsTo(Room::class, 'salle_id');
    }

    public function affectationsJury()
    {
        return $this->hasMany(AffectationJury::class);
    }

    public function convocation()
    {
        return $this->hasOne(Convocation::class);
    }

    // --- RELATION JURY ---

    public function enseignants()
    {
        return $this->belongsToMany(User::class, 'affectation_jury', 'soutenance_id', 'enseignant_id')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // --- ACCESSEURS (En mémoire / Zero extra-query si 'enseignants' est chargé) ---

    public function getPresidentAttribute()
    {
        return $this->enseignants->firstWhere('pivot.role', 'president');
    }

    public function getRapporteurAttribute()
    {
        return $this->enseignants->firstWhere('pivot.role', 'rapporteur');
    }

    public function getExaminateurAttribute()
    {
        return $this->enseignants->firstWhere('pivot.role', 'examinateur');
    }
}