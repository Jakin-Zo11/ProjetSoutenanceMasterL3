<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        // Anciens noms encore utilises par les modules Etudiant / Evaluation / PV
        // (voir "PONT DE COMPATIBILITE" plus bas) : ils sont rediriges vers les nouvelles colonnes.
        'status',
        'date',
        'room_id',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin'   => 'datetime',
        'valide_le'  => 'datetime',
    ];

    protected static function booted(): void
    {
        // Un ancien code peut creer une soutenance avec seulement depot_id : on retrouve l'etudiant via le depot.
        static::creating(function (Soutenance $s) {
            if (!$s->etudiant_id && $s->depot_id) {
                $s->etudiant_id = Depot::whereKey($s->depot_id)->value('etudiant_id');
            }
        });

        // Un ancien code peut n'ecrire que la date de debut : on deduit la fin avec la duree standard.
        static::saving(function (Soutenance $s) {
            if ($s->date_debut && !$s->date_fin) {
                $s->date_fin = $s->date_debut->copy()
                    ->addMinutes((int) ParametrePlanification::actuel()->duree_minutes);
            }
        });

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

    // --- PONT DE COMPATIBILITE (ancien schema : status, date, room_id, room, sessionSoutenance) ---
    // Les modules Etudiant, Evaluation et PV lisent encore ces noms. On les relie aux colonnes
    // du module Planification (statut, date_debut, salle_id) pour que tout le monde partage la meme donnee.

    public function room(): BelongsTo
    {
        return $this->salle();
    }

    public function sessionSoutenance(): BelongsTo
    {
        // Pas de colonne session_soutenance_id dans ce schema : la relation reste vide (null).
        return $this->belongsTo(SessionSoutenance::class, 'session_soutenance_id');
    }

    public function getStatusAttribute()
    {
        return $this->attributes['statut'] ?? null;
    }

    public function setStatusAttribute($value): void
    {
        $this->attributes['statut'] = $value;
    }

    public function getDateAttribute()
    {
        return $this->date_debut;
    }

    public function setDateAttribute($value): void
    {
        $this->date_debut = $value;
    }

    public function getRoomIdAttribute()
    {
        return $this->attributes['salle_id'] ?? null;
    }

    public function setRoomIdAttribute($value): void
    {
        $this->attributes['salle_id'] = $value;
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
