<?php
// app/Services/PlanificationService.php

namespace App\Services;

use App\Models\Soutenance;
use App\Models\Enseignant;
use App\Models\Indisponibilite;
use App\Http\Controllers\Api\Admin\RoomController; // pas utilise ici, juste reference
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PlanificationService
{
    // Duree fixe d'une soutenance (en minutes) - ajustable
    protected int $dureeMinutes = 60;

    // Plage horaire de travail par jour
    protected string $heureDebutJournee = '08:00';
    protected string $heureFinJournee = '17:00';

    /**
     * Tente de planifier une soutenance : trouve un creneau, une salle
     * et 3 enseignants disponibles (president, rapporteur, examinateur).
     */
    public function planifier(Soutenance $soutenance, Carbon $dateSouhaitee): array
    {
        $conflitService = app(ConflitDetectionService::class);

        // 1. Generer les creneaux possibles de la journee
        $creneaux = $this->genererCreneauxJournee($dateSouhaitee);

        foreach ($creneaux as [$debut, $fin]) {
            // 2. Chercher une salle libre sur ce creneau
            $salle = $this->trouverSalleLibre($debut, $fin, $conflitService);
            if (!$salle) {
                continue;
            }

            // 3. Chercher 3 enseignants disponibles sur ce creneau
            $jurys = $this->trouverJurysDisponibles($debut, $fin, 3, $conflitService);
            if (count($jurys) < 3) {
                continue;
            }

            // 4. Tout est trouve : on planifie
            return DB::transaction(function () use ($soutenance, $debut, $fin, $salle, $jurys) {
                $soutenance->update([
                    'salle_id'   => $salle->id,
                    'date_debut' => $debut,
                    'date_fin'   => $fin,
                    'statut'     => 'planifiee',
                ]);

                $roles = ['president', 'rapporteur', 'examinateur'];
                foreach ($jurys as $index => $enseignant) {
                    $soutenance->affectationsJury()->create([
                        'enseignant_id' => $enseignant->id,
                        'role'          => $roles[$index],
                    ]);
                }

                return [
                    'success'    => true,
                    'salle'      => $salle,
                    'jurys'      => $jurys,
                    'date_debut' => $debut,
                    'date_fin'   => $fin,
                ];
            });
        }

        return [
            'success' => false,
            'message' => 'Aucun creneau disponible avec salle et 3 jurys libres pour cette date.',
        ];
    }

    /**
     * Genere les creneaux de la journee selon la duree fixe.
     */
    protected function genererCreneauxJournee(Carbon $date): array
    {
        $creneaux = [];
        $debut = $date->copy()->setTimeFromTimeString($this->heureDebutJournee);
        $finJournee = $date->copy()->setTimeFromTimeString($this->heureFinJournee);

        while ($debut->copy()->addMinutes($this->dureeMinutes)->lte($finJournee)) {
            $fin = $debut->copy()->addMinutes($this->dureeMinutes);
            $creneaux[] = [$debut->copy(), $fin->copy()];
            $debut = $fin;
        }

        return $creneaux;
    }

    protected function trouverSalleLibre(Carbon $debut, Carbon $fin, ConflitDetectionService $conflitService)
    {
        $salles = \App\Models\Salle::where('is_active', true)->get();

        foreach ($salles as $salle) {
            if (!$conflitService->salleOccupee($salle->id, $debut, $fin)) {
                return $salle;
            }
        }

        return null;
    }

    protected function trouverJurysDisponibles(Carbon $debut, Carbon $fin, int $nombre, ConflitDetectionService $conflitService): array
    {
        $enseignants = Enseignant::all();
        $disponibles = [];

        foreach ($enseignants as $enseignant) {
            if (count($disponibles) >= $nombre) {
                break;
            }

            if ($conflitService->enseignantIndisponible($enseignant->id, $debut, $fin)) {
                continue;
            }

            if ($conflitService->enseignantDejaAffecte($enseignant->id, $debut, $fin)) {
                continue;
            }

            $disponibles[] = $enseignant;
        }

        return $disponibles;
    }
}