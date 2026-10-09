<?php
// app/Services/ConflitDetectionService.php

namespace App\Services;

use App\Models\Soutenance;
use App\Models\Indisponibilite;
use App\Models\AffectationJury;
use Illuminate\Support\Carbon;

class ConflitDetectionService
{
    /**
     * Vérifie si une salle est occupée
     * pendant le créneau demandé.
     */
    public function salleOccupee(
        int $salleId,
        Carbon $debut,
        Carbon $fin
    ): bool {
        return Soutenance::where('salle_id', $salleId)
            ->whereNotNull('date_debut')
            ->whereNotNull('date_fin')
            ->where('date_debut', '<', $fin)
            ->where('date_fin', '>', $debut)
            ->exists();
    }

    /**
     * Vérifie si un enseignant est indisponible
     * sur le créneau demandé.
     */
    public function enseignantIndisponible(
        int $enseignantId,
        Carbon $debut,
        Carbon $fin
    ): bool {
        return Indisponibilite::where(
            'enseignant_id',
            $enseignantId
        )
            ->whereDate(
                'date',
                $debut->toDateString()
            )
            ->where(
                'heure_debut',
                '<',
                $fin->format('H:i:s')
            )
            ->where(
                'heure_fin',
                '>',
                $debut->format('H:i:s')
            )
            ->exists();
    }

    /**
     * Vérifie si un enseignant est déjà affecté
     * à une autre soutenance sur le créneau.
     */
    public function enseignantDejaAffecte(
        int $enseignantId,
        Carbon $debut,
        Carbon $fin
    ): bool {
        return AffectationJury::where(
            'enseignant_id',
            $enseignantId
        )
            ->whereHas('soutenance', function ($q) use (
                $debut,
                $fin
            ) {
                $q->whereNotNull('date_debut')
                    ->whereNotNull('date_fin')
                    ->where(
                        'date_debut',
                        '<',
                        $fin
                    )
                    ->where(
                        'date_fin',
                        '>',
                        $debut
                    );
            })
            ->exists();
    }
}