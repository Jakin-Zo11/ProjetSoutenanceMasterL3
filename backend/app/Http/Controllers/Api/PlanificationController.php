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
    public function __construct(protected PlanificationService $planificationService)
    {
    }

    /**
     * Tente de planifier une soutenance existante (statut "en_attente")
     * sur une date donnee.
     */
    public function planifier(Request $request, Soutenance $soutenance)
    {
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
            return response()->json($resultat, 409); // 409 Conflict : aucun creneau trouve
        }

        return response()->json([
            'success'    => true,
            'soutenance' => $soutenance->fresh(['affectationsJury.enseignant']),
            'salle'      => $resultat['salle'],
            'date_debut' => $resultat['date_debut'],
            'date_fin'   => $resultat['date_fin'],
        ]);
    }

    /**
     * Liste les soutenances planifiees (pour le PlanningDashboard du frontend).
     */
    public function index(Request $request)
{
    $query = Soutenance::with(['affectationsJury.enseignant']);

    if ($request->has('statut')) {
        $query->where('statut', $request->statut);
    }

    $soutenances = $query->orderBy('date_debut')->get();

    return response()->json($soutenances);
}

    public function conflits()
{
    $soutenances = Soutenance::whereNotNull('date_debut')
        ->whereNotNull('date_fin')
        ->with(['affectationsJury'])
        ->get();

    $conflits = [];

    foreach ($soutenances as $i => $a) {
        foreach ($soutenances as $j => $b) {
            if ($i >= $j) continue;

            $chevauchent = $a->date_debut < $b->date_fin && $b->date_debut < $a->date_fin;
            if (!$chevauchent) continue;

            if ($a->salle_id && $a->salle_id === $b->salle_id) {
                $conflits[] = [
                    'type' => 'salle',
                    'soutenance_a' => $a->id,
                    'soutenance_b' => $b->id,
                    'detail' => "Meme salle (#{$a->salle_id}) sur creneaux chevauchants",
                ];
            }

            $jurysA = $a->affectationsJury->pluck('enseignant_id');
            $jurysB = $b->affectationsJury->pluck('enseignant_id');
            $communs = $jurysA->intersect($jurysB);

            foreach ($communs as $enseignantId) {
                $conflits[] = [
                    'type' => 'jury',
                    'soutenance_a' => $a->id,
                    'soutenance_b' => $b->id,
                    'detail' => "Enseignant #{$enseignantId} affecte aux deux soutenances sur creneaux chevauchants",
                ];
            }
        }
    }

    return response()->json($conflits);
}
}