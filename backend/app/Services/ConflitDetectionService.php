<?php

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
            ->where('date_debut', '<', $fin)
            ->where('date_fin', '>', $debut)
            ->exists();
    }

    public function enseignantIndisponible(int $enseignantId, Carbon $debut, Carbon $fin): bool
    {
        return Indisponibilite::where('enseignant_id', $enseignantId)
            ->where('date_debut', '<', $fin)
            ->where('date_fin', '>', $debut)
            ->exists();
    }

    public function enseignantDejaAffecte(int $enseignantId, Carbon $debut, Carbon $fin): bool
    {
        return AffectationJury::where('enseignant_id', $enseignantId)
            ->whereHas('soutenance', function ($q) use ($debut, $fin) {
                $q->where('date_debut', '<', $fin)
                  ->where('date_fin', '>', $debut);
            })
            ->exists();
    }
}
