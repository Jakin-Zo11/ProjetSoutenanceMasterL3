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

    public function enseignantIndisponible(
    int $enseignantId,
    Carbon $debut,
    Carbon $fin
): bool {
    return Indisponibilite::where('enseignant_id', $enseignantId)
        ->whereDate('date', $debut->toDateString())
        ->where('heure_debut', '<', $fin->format('H:i:s'))
        ->where('heure_fin', '>', $debut->format('H:i:s'))
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

    /**
     * Liste les raisons pour lesquelles une soutenance deja planifiee entre en conflit
     * avec le reste du planning (la soutenance elle-meme est exclue des comparaisons).
     * Tableau vide = aucun conflit.
     */
    public function conflitsPour(Soutenance $soutenance): array
    {
        $debut = $soutenance->date_debut;
        $fin = $soutenance->date_fin;

        if (!$debut || !$fin) {
            return [];
        }

        $raisons = [];

        if ($soutenance->salle_id && Soutenance::where('id', '!=', $soutenance->id)
            ->where('salle_id', $soutenance->salle_id)
            ->where('date_debut', '<', $fin)
            ->where('date_fin', '>', $debut)
            ->exists()) {
            $raisons[] = 'salle deja occupee sur ce creneau';
        }

        foreach ($soutenance->affectationsJury as $affectation) {
            $enseignantId = $affectation->enseignant_id;

            if ($this->enseignantIndisponible($enseignantId, $debut, $fin)) {
                $raisons[] = "enseignant #{$enseignantId} indisponible sur ce creneau";
            }

            $autreSoutenance = AffectationJury::where('enseignant_id', $enseignantId)
                ->where('soutenance_id', '!=', $soutenance->id)
                ->whereHas('soutenance', function ($q) use ($debut, $fin) {
                    $q->where('date_debut', '<', $fin)
                      ->where('date_fin', '>', $debut);
                })
                ->exists();

            if ($autreSoutenance) {
                $raisons[] = "enseignant #{$enseignantId} deja affecte a une autre soutenance sur ce creneau";
            }
        }

        return $raisons;
    }
}
