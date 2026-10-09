<?php
// app/Http/Controllers/Api/PlanificationController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soutenance;
use App\Services\PlanificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PlanificationController extends Controller
{
    public function __construct(
        protected PlanificationService $planificationService
    ) {
    }

    /**
     * Planification initiale.
     *
     * Une soutenance doit être en attente.
     */
    public function planifier(
        Request $request,
        Soutenance $soutenance
    ) {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        if ($soutenance->statut !== 'en_attente') {
            return response()->json([
                'success' => false,
                'message' => 'Cette soutenance n\'est pas en attente de planification.',
            ], 422);
        }

        $resultat = $this->planificationService->planifier(
            $soutenance,
            Carbon::parse($validated['date'])
        );

        if (!$resultat['success']) {
            return response()->json(
                $resultat,
                409
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Soutenance planifiée avec succès.',
            'soutenance' => $soutenance->fresh([
                'affectationsJury.enseignant'
            ]),
            'salle' => $resultat['salle'],
            'date_debut' => $resultat['date_debut'],
            'date_fin' => $resultat['date_fin'],
        ]);
    }

    /**
     * Replanification d'une soutenance déjà planifiée.
     */
    public function replanifier(
        Request $request,
        Soutenance $soutenance
    ) {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        if ($soutenance->statut !== 'planifiee') {
            return response()->json([
                'success' => false,
                'message' => 'Seule une soutenance planifiée peut être replanifiée.',
            ], 422);
        }

        $resultat = $this->planificationService->replanifier(
            $soutenance,
            Carbon::parse($validated['date'])
        );

        if (!$resultat['success']) {
            return response()->json(
                $resultat,
                409
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Soutenance replanifiée avec succès.',
            'soutenance' => $soutenance->fresh([
                'affectationsJury.enseignant'
            ]),
            'salle' => $resultat['salle'],
            'date_debut' => $resultat['date_debut'],
            'date_fin' => $resultat['date_fin'],
        ]);
    }

    /**
     * Planning des soutenances.
     */
    public function index(Request $request)
    {
        $query = Soutenance::with([
            'affectationsJury.enseignant'
        ]);

        if ($request->filled('statut')) {
            $query->where(
                'statut',
                $request->statut
            );
        }

        if ($request->filled('date')) {
            $query->whereDate(
                'date_debut',
                $request->date
            );
        }

        $soutenances = $query
            ->orderBy('date_debut')
            ->get();

        return response()->json(
            $soutenances
        );
    }

    /**
     * Détection des conflits existants.
     */
    public function conflits()
    {
        $soutenances = Soutenance::whereNotNull('date_debut')
            ->whereNotNull('date_fin')
            ->with([
                'affectationsJury'
            ])
            ->orderBy('date_debut')
            ->get();

        $conflits = [];

        foreach ($soutenances as $i => $a) {

            foreach ($soutenances as $j => $b) {

                // Éviter de comparer une soutenance
                // avec elle-même et éviter les doublons.
                if ($i >= $j) {
                    continue;
                }

                // Vérification réelle du chevauchement
                $chevauchent =
                    $a->date_debut < $b->date_fin
                    &&
                    $b->date_debut < $a->date_fin;

                if (!$chevauchent) {
                    continue;
                }

                // Conflit de salle
                if (
                    $a->salle_id
                    &&
                    $a->salle_id === $b->salle_id
                ) {
                    $conflits[] = [
                        'type' => 'salle',
                        'soutenance_a' => $a->id,
                        'soutenance_b' => $b->id,
                        'detail' =>
                            "Même salle (#{$a->salle_id}) sur des créneaux chevauchants.",
                    ];
                }

                // Conflit de jury
                $jurysA = $a->affectationsJury
                    ->pluck('enseignant_id');

                $jurysB = $b->affectationsJury
                    ->pluck('enseignant_id');

                $communs = $jurysA->intersect(
                    $jurysB
                );

                foreach ($communs as $enseignantId) {

                    $conflits[] = [
                        'type' => 'jury',
                        'soutenance_a' => $a->id,
                        'soutenance_b' => $b->id,
                        'enseignant_id' => $enseignantId,
                        'detail' =>
                            "Enseignant #{$enseignantId} affecté aux deux soutenances sur des créneaux chevauchants.",
                    ];
                }
            }
        }

        return response()->json(
            $conflits
        );
    }
}