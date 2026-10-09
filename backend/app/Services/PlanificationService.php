<?php
// app/Services/PlanificationService.php

namespace App\Services;

use App\Models\Soutenance;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PlanificationService
{
    protected function parametres(): \App\Models\ParametrePlanification
{
    return \App\Models\ParametrePlanification::actuel();
}

    /**
     * Planifie une soutenance en attente.
     */
    public function planifier(
        Soutenance $soutenance,
        Carbon $dateSouhaitee
    ): array {
        return $this->chercherEtPlanifier(
            $soutenance,
            $dateSouhaitee,
            false
        );
    }

    /**
     * Replanifie une soutenance déjà planifiée.
     *
     * L'ancienne salle, les anciennes dates
     * et les anciennes affectations du jury sont supprimées
     * avant la nouvelle recherche.
     */
    public function replanifier(
        Soutenance $soutenance,
        Carbon $dateSouhaitee
    ): array {
        return DB::transaction(function () use (
            $soutenance,
            $dateSouhaitee
        ) {
            // Supprimer les anciennes affectations du jury
            $soutenance->affectationsJury()->delete();

            // Remettre temporairement la soutenance en attente
            $soutenance->update([
                'salle_id' => null,
                'date_debut' => null,
                'date_fin' => null,
                'statut' => 'en_attente',
            ]);

            return $this->chercherEtPlanifier(
                $soutenance->fresh(),
                $dateSouhaitee,
                true
            );
        });
    }

    /**
     * Recherche un créneau et planifie la soutenance.
     */
    protected function chercherEtPlanifier(
        Soutenance $soutenance,
        Carbon $dateSouhaitee,
        bool $replanification = false
    ): array {
        $conflitService = app(ConflitDetectionService::class);

        $creneaux = $this->genererCreneauxJournee($dateSouhaitee);

        foreach ($creneaux as [$debut, $fin]) {

            // Chercher une salle libre
            $salle = $this->trouverSalleLibre(
                $debut,
                $fin,
                $conflitService
            );

            if (!$salle) {
                continue;
            }

            // Chercher les trois membres du jury
            $jurys = $this->trouverJurysDisponibles(
                $debut,
                $fin,
                $conflitService
            );

            if (!$jurys) {
                continue;
            }

            // Tout est disponible
            $soutenance->update([
                'salle_id' => $salle->id,
                'date_debut' => $debut,
                'date_fin' => $fin,
                'statut' => 'planifiee',
            ]);

            // Président
            $soutenance->affectationsJury()->create([
                'enseignant_id' => $jurys['president']->id,
                'role' => 'president',
            ]);

            // Rapporteur
            $soutenance->affectationsJury()->create([
                'enseignant_id' => $jurys['rapporteur']->id,
                'role' => 'rapporteur',
            ]);

            // Examinateur
            $soutenance->affectationsJury()->create([
                'enseignant_id' => $jurys['examinateur']->id,
                'role' => 'examinateur',
            ]);

            return [
                'success' => true,
                'salle' => $salle,
                'jurys' => [
                    'president' => $jurys['president'],
                    'rapporteur' => $jurys['rapporteur'],
                    'examinateur' => $jurys['examinateur'],
                ],
                'date_debut' => $debut,
                'date_fin' => $fin,
                'replanification' => $replanification,
            ];
        }

        return [
            'success' => false,
            'message' => 'Aucun créneau disponible avec salle et 3 jurys libres pour cette date.',
        ];
    }

    /**
     * Génère les créneaux :
     *
     * 08:00 - 09:00
     * 09:00 - 10:00
     * ...
     * 16:00 - 17:00
     */
    protected function genererCreneauxJournee(Carbon $date): array
{
    $params = $this->parametres();
    $dureeMinutes = $params->duree_minutes;

    $creneaux = [];
    $debut = $date->copy()->setTimeFromTimeString($params->heure_debut_journee);
    $finJournee = $date->copy()->setTimeFromTimeString($params->heure_fin_journee);

    while ($debut->copy()->addMinutes($dureeMinutes)->lte($finJournee)) {
        $fin = $debut->copy()->addMinutes($dureeMinutes);
        $creneaux[] = [$debut->copy(), $fin->copy()];
        $debut = $fin;
    }

    return $creneaux;
}

    /**
     * Trouve une salle active et libre.
     */
    protected function trouverSalleLibre(
        Carbon $debut,
        Carbon $fin,
        ConflitDetectionService $conflitService
    ) {
        $salles = \App\Models\Room::where(
            'is_active',
            true
        )->get();

        foreach ($salles as $salle) {

            if (
                !$conflitService->salleOccupee(
                    $salle->id,
                    $debut,
                    $fin
                )
            ) {
                return $salle;
            }
        }

        return null;
    }

    /**
     * Cherche :
     * - 1 président
     * - 1 rapporteur
     * - 1 examinateur
     */
    protected function trouverJurysDisponibles(
        Carbon $debut,
        Carbon $fin,
        ConflitDetectionService $conflitService
    ): ?array {

        // Président
        $president = $this->trouverEnseignantDisponibleParRole(
            'president_jury',
            $debut,
            $fin,
            $conflitService
        );

        if (!$president) {
            return null;
        }

        // Rapporteur
        $rapporteur = $this->trouverEnseignantDisponibleParRole(
            'rapporteur',
            $debut,
            $fin,
            $conflitService,
            [$president->id]
        );

        if (!$rapporteur) {
            return null;
        }

        // Examinateur
        $examinateur = $this->trouverEnseignantDisponibleParRole(
            'examinateur',
            $debut,
            $fin,
            $conflitService,
            [
                $president->id,
                $rapporteur->id
            ]
        );

        if (!$examinateur) {
            return null;
        }

        return [
            'president' => $president,
            'rapporteur' => $rapporteur,
            'examinateur' => $examinateur,
        ];
    }

    /**
     * Recherche un enseignant possédant le rôle demandé
     * et disponible sur le créneau.
     */
    protected function trouverEnseignantDisponibleParRole(
        string $role,
        Carbon $debut,
        Carbon $fin,
        ConflitDetectionService $conflitService,
        array $idsExclus = []
    ) {
        $enseignants = \App\Models\User::role($role)->get();

        foreach ($enseignants as $enseignant) {

            // Éviter le même enseignant plusieurs fois
            if (in_array($enseignant->id, $idsExclus)) {
                continue;
            }

            // Vérifier l'indisponibilité
            if (
                $conflitService->enseignantIndisponible(
                    $enseignant->id,
                    $debut,
                    $fin
                )
            ) {
                continue;
            }

            // Vérifier les autres soutenances
            if (
                $conflitService->enseignantDejaAffecte(
                    $enseignant->id,
                    $debut,
                    $fin
                )
            ) {
                continue;
            }

            return $enseignant;
        }

        return null;
    }
}