<?php

namespace App\Services;

use App\Models\Soutenance;
use App\Models\ParametrePlanification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PlanificationService
{
    protected function parametres(): ParametrePlanification
    {
        return ParametrePlanification::actuel();
    }

    /**
     * Planifie une soutenance : trouve un creneau, une salle et complete le jury
     * (les jurys deja affectes sont conserves, seuls les roles manquants sont attribues).
     */
    public function planifier(Soutenance $soutenance, Carbon $dateSouhaitee): array
    {
        $conflitService = app(ConflitDetectionService::class);

        $existants = $soutenance->affectationsJury()->get();
        $rolesPris = $existants->pluck('role')->map(fn ($r) => Str::ascii((string) $r))->all();
        $idsPris = $existants->pluck('enseignant_id')->all();
        $rolesManquants = array_values(array_diff(['president', 'rapporteur', 'examinateur'], $rolesPris));

        $creneaux = $this->genererCreneauxJournee($dateSouhaitee);

        foreach ($creneaux as [$debut, $fin]) {
            // Les jurys deja affectes doivent etre libres sur ce creneau
            $existantsLibres = collect($idsPris)->every(
                fn ($id) => !$conflitService->enseignantIndisponible($id, $debut, $fin)
                    && !$conflitService->enseignantDejaAffecte($id, $debut, $fin)
            );
            if (!$existantsLibres) {
                continue;
            }

            $salle = $this->trouverSalleLibre($debut, $fin, $conflitService);
            if (!$salle) {
                continue;
            }

            $nouveaux = $this->trouverJurysDisponibles(
    $debut,
    $fin,
    count($rolesManquants),
    $conflitService,
    $idsPris,
    $rolesManquants
);
            if (count($nouveaux) < count($rolesManquants)) {
    continue;
}

            return DB::transaction(function () use ($soutenance, $debut, $fin, $salle, $nouveaux, $rolesManquants) {
                $soutenance->update([
                    'salle_id'   => $salle->id,
                    'date_debut' => $debut,
                    'date_fin'   => $fin,
                    'statut'     => 'planifiee',
                ]);

                foreach ($nouveaux as $nouveau) {
    $soutenance->affectationsJury()->create([
        'enseignant_id' => $nouveau['enseignant']->id,
        'role' => $nouveau['role'],
    ]);
}

                $soutenance->load('affectationsJury.enseignant');

                return [
                    'success'    => true,
                    'salle'      => $salle,
                    'jurys'      => $soutenance->affectationsJury->pluck('enseignant'),
                    'date_debut' => $debut,
                    'date_fin'   => $fin,
                ];
            });
        }

        return [
            'success' => false,
            'message' => 'Aucun creneau disponible avec salle et jury libres pour cette date.',
        ];
    }

    /**
     * Replanifie une soutenance déjà planifiée.
     * Supprime l'ancienne configuration et relance la recherche.
     */
    public function replanifier(Soutenance $soutenance, Carbon $dateSouhaitee): array
    {
        try {
            return DB::transaction(function () use ($soutenance, $dateSouhaitee) {
                // 1. Supprimer les anciennes affectations de jury
                $soutenance->affectationsJury()->delete();

                // 2. Libérer la salle et réinitialiser les dates et le statut
                $soutenance->update([
                    'salle_id'   => null,
                    'date_debut' => null,
                    'date_fin'   => null,
                    'statut'     => 'en_attente',
                ]);

                // 3. Relancer la planification avec la nouvelle date
                $resultat = $this->planifier($soutenance->fresh(), $dateSouhaitee);

                if (!$resultat['success']) {
                    throw new \DomainException($resultat['message'] ?? 'Erreur lors de la replanification.');
                }

                // Indiquer que c'est une replanification dans le retour
                $resultat['replanification'] = true;
                return $resultat;
            });
        } catch (\DomainException $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

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

    protected function trouverSalleLibre(Carbon $debut, Carbon $fin, ConflitDetectionService $conflitService)
    {
        $salles = \App\Models\Room::where('is_active', true)->get();

        foreach ($salles as $salle) {
            if (!$conflitService->salleOccupee($salle->id, $debut, $fin)) {
                return $salle;
            }
        }

        return null;
    }

    
protected function trouverJurysDisponibles(
    Carbon $debut,
    Carbon $fin,
    int $nombre,
    ConflitDetectionService $conflitService,
    array $exclus = [],
    array $rolesManquants = []
): array {
    $correspondanceRoles = [
        'president' => ['president_jury', 'president_mention'],
        'rapporteur' => ['rapporteur'],
        'examinateur' => ['examinateur'],
    ];

    $selection = [];

    foreach ($rolesManquants as $rolePoste) {
        if (count($selection) >= $nombre) {
            break;
        }

        $rolesAutorises = $correspondanceRoles[$rolePoste] ?? [];

        $enseignants = \App\Models\User::role($rolesAutorises)
            ->where('status', 'actif')
            ->get();

        foreach ($enseignants as $enseignant) {
            if (in_array($enseignant->id, $exclus, true)) {
                continue;
            }

            if (in_array($enseignant->id, array_column($selection, 'id'), true)) {
                continue;
            }

            if ($conflitService->enseignantIndisponible(
                $enseignant->id, $debut, $fin
            )) {
                continue;
            }

            if ($conflitService->enseignantDejaAffecte(
                $enseignant->id, $debut, $fin
            )) {
                continue;
            }

            $selection[] = [
                'id' => $enseignant->id,
                'enseignant' => $enseignant,
                'role' => $rolePoste,
            ];

            break;
        }
    }

    return $selection;
}

}