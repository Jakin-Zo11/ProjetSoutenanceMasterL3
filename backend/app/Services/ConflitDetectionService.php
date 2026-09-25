<?php
// app/Services/ConflitDetectionService.php

namespace App\Services;

use App\Models\Soutenance;
use App\Models\Indisponibilite;
use App\Models\AffectationJury;
use Illuminate\Support\Carbon;

class ConflitDetectionService
{
    public function salleOccupee(int $salleId, Carbon $debut, Carbon $fin): bool
    {
        return Soutenance::where('salle_id', $salleId)
            ->where(function ($q) use ($debut, $fin) {
                $q->whereBetween('date_debut', [$debut, $fin])
                  ->orWhereBetween('date_fin', [$debut, $fin])
                  ->orWhere(function ($q2) use ($debut, $fin) {
                      $q2->where('date_debut', '<=', $debut)
                         ->where('date_fin', '>=', $fin);
                  });
            })
            ->exists();
    }

    public function enseignantIndisponible(int $enseignantId, Carbon $debut, Carbon $fin): bool
    {
        return Indisponibilite::where('enseignant_id', $enseignantId)
            ->where(function ($q) use ($debut, $fin) {
                $q->whereBetween('date_debut', [$debut, $fin])
                  ->orWhereBetween('date_fin', [$debut, $fin])
                  ->orWhere(function ($q2) use ($debut, $fin) {
                      $q2->where('date_debut', '<=', $debut)
                         ->where('date_fin', '>=', $fin);
                  });
            })
            ->exists();
    }

    public function enseignantDejaAffecte(int $enseignantId, Carbon $debut, Carbon $fin): bool
    {
        return AffectationJury::where('enseignant_id', $enseignantId)
            ->whereHas('soutenance', function ($q) use ($debut, $fin) {
                $q->where(function ($q2) use ($debut, $fin) {
                    $q2->whereBetween('date_debut', [$debut, $fin])
                       ->orWhereBetween('date_fin', [$debut, $fin])
                       ->orWhere(function ($q3) use ($debut, $fin) {
                           $q3->where('date_debut', '<=', $debut)
                              ->where('date_fin', '>=', $fin);
                       });
                });
            })
            ->exists();
    }
}