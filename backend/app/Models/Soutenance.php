<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'valide_le',
        'valide_par',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin'   => 'datetime',
        'valide_le'  => 'datetime',
    ];

    protected static function booted(): void
    {
        // Changer le creneau ou la salle annule la validation du planning
        static::updating(function (Soutenance $s) {
            if ($s->isDirty(['date_debut', 'date_fin', 'salle_id']) && !$s->isDirty('valide_le')) {
                $s->valide_le = null;
                $s->valide_par = null;
            }
        });
    }

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

    public function validePar()
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    public function affectationsJury()
    {
        return $this->hasMany(AffectationJury::class);
    }

    public function convocation()
    {
        return $this->hasOne(Convocation::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    // --- RELATION JURY ---

    public function enseignants()
    {
        return $this->belongsToMany(User::class, 'affectation_jury', 'soutenance_id', 'enseignant_id')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // --- ACCESSEURS ---

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
