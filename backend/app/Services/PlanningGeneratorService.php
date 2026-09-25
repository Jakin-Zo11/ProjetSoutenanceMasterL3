<?php

namespace App\Services;

use App\Models\Soutenance;
use App\Models\Salle;
use App\Models\Enseignant;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PlanningGeneratorService
{
    /**
     * Génère automatiquement le planning des soutenances.
     *
     * @param string $dateDebut Date de début (ex: '2026-10-15')
     * @param int $dureeMinutes Durée d'un créneau en minutes (ex: 60)
     * @param string $heureDebut Heure de début de la journée (ex: '08:00')
     * @param string $heureFin Heure de fin de la journée (ex: '17:00')
     */
    public function generate(string $dateDebut, int $dureeMinutes = 60, string $heureDebut = '08:00', string $heureFin = '17:00'): array
    {
        // 1. Récupérer les soutenances non encore planifiées
        $soutenances = Soutenance::whereNull('date_soutenance')->get();
        $salles = Salle::all();
        $enseignants = Enseignant::all();

        if ($soutenances->isEmpty()) {
            return ['status' => 'warning', 'message' => 'Toutes les soutenances sont déjà planifiées.'];
        }

        if ($salles->isEmpty()) {
            return ['status' => 'error', 'message' => 'Aucune salle disponible.'];
        }

        $currentDate = Carbon::parse($dateDebut);
        $totalPlanifiees = 0;

        foreach ($soutenances as $soutenance) {
            $assigned = false;

            while (!$assigned) {
                // Heures de travail pour la journée en cours
                $slotStart = $currentDate->copy()->setTimeFromTimeString($heureDebut);
                $dayEnd = $currentDate->copy()->setTimeFromTimeString($heureFin);

                while ($slotStart->lt($dayEnd)) {
                    $slotEnd = $slotStart->copy()->addMinutes($dureeMinutes);

                    // Parcourir les salles disponibles
                    foreach ($salles as $salle) {
                        
                        // Vérifier si la salle est disponible
                        if ($this->isSalleLibre($salle->id, $slotStart, $slotEnd)) {
                            
                            // Sélectionner un jury disponible sans conflit d'horaire
                            $jury = $this->trouverJuryDisponible($enseignants, $slotStart, $slotEnd, $soutenance);

                            if ($jury) {
                                // Assignation de la soutenance
                                $soutenance->update([
                                    'salle_id' => $salle->id,
                                    'president_id' => $jury['president']->id,
                                    'examinateur_id' => $jury['examinateur']->id,
                                    'rapporteur_id' => $jury['rapporteur']->id,
                                    'date_soutenance' => $slotStart->toDateString(),
                                    'heure_debut' => $slotStart->toTimeString(),
                                    'heure_fin' => $slotEnd->toTimeString(),
                                    'statut' => 'Planifiée'
                                ]);

                                $assigned = true;
                                $totalPlanifiees++;
                                break 2; // Créneau attribué, passer à la soutenance suivante
                            }
                        }
                    }

                    // Avancer au créneau suivant
                    $slotStart->addMinutes($dureeMinutes);
                }

                // Si aucun créneau libre aujourd'hui, passer au jour ouvré suivant
                if (!$assigned) {
                    $currentDate->addDay();
                    if ($currentDate->isWeekend()) {
                        $currentDate->next(Carbon::MONDAY);
                    }
                }
            }
        }

        return [
            'status' => 'success',
            'message' => "Planification terminée avec succès.",
            'total' => $totalPlanifiees
        ];
    }

    /**
     * Vérifie la disponibilité d'une salle sur un créneau précis.
     */
    private function isSalleLibre(int $salleId, Carbon $start, Carbon $end): bool
    {
        return !Soutenance::where('salle_id', $salleId)
            ->where('date_soutenance', $start->toDateString())
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('heure_debut', [$start->toTimeString(), $end->toTimeString()])
                      ->orWhereBetween('heure_fin', [$start->toTimeString(), $end->toTimeString()]);
            })
            ->exists();
    }

    /**
     * Trouve un trio de jury (Président, Examinateur, Rapporteur) disponible.
     */
    private function trouverJuryDisponible(Collection $enseignants, Carbon $start, Carbon $end, Soutenance $soutenance): ?array
{
    $dateStr = $start->toDateString();
    $heureDebutStr = $start->toTimeString();
    $heureFinStr = $end->toTimeString();

    // 1. Enseignants occupés par une AUTRE SOUTENANCE sur ce créneau
    $occupesParSoutenanceIds = Soutenance::where('date_soutenance', $dateStr)
        ->where(function ($q) use ($heureDebutStr, $heureFinStr) {
            $q->whereBetween('heure_debut', [$heureDebutStr, $heureFinStr])
              ->orWhereBetween('heure_fin', [$heureDebutStr, $heureFinStr])
              ->orWhere(function ($sub) use ($heureDebutStr, $heureFinStr) {
                  $sub->where('heure_debut', '<=', $heureDebutStr)
                      ->where('heure_fin', '>=', $heureFinStr);
              });
        })
        ->get(['president_id', 'examinateur_id', 'rapporteur_id'])
        ->flatMap(fn($s) => [$s->president_id, $s->examinateur_id, $s->rapporteur_id])
        ->filter()
        ->unique()
        ->toArray();

    // 2. Enseignants INDISPONIBLES déclarés dans la table indisponibilites
    $indisponiblesIds = Indisponibilite::where('date', $dateStr)
        ->where(function ($q) use ($heureDebutStr, $heureFinStr) {
            $q->whereBetween('heure_debut', [$heureDebutStr, $heureFinStr])
              ->orWhereBetween('heure_fin', [$heureDebutStr, $heureFinStr])
              ->orWhere(function ($sub) use ($heureDebutStr, $heureFinStr) {
                  $sub->where('heure_debut', '<=', $heureDebutStr)
                      ->where('heure_fin', '>=', $heureFinStr);
              });
        })
        ->pluck('enseignant_id')
        ->toArray();

    // Fusion des IDs à exclure (soutenances + indisponibilités)
    $idsAExclure = array_unique(array_merge($occupesParSoutenanceIds, $indisponiblesIds));

    // Filtrer la liste des enseignants
    $disponibles = $enseignants->reject(fn($e) => in_array($e->id, $idsAExclure));

    // Vérifier si au moins 3 enseignants sont complètement libres
    if ($disponibles->count() < 3) {
        return null;
    }

    $juryList = $disponibles->values();

    return [
        'president'   => $juryList[0],
        'examinateur' => $juryList[1],
        'rapporteur'  => $juryList[2],
    ];
}
}