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
        $soutenances = Soutenance::with(['affectationsJury.enseignant'])
            ->whereIn('statut', ['planifiee', 'en_cours', 'terminee'])
            ->orderBy('date_debut')
            ->get();

        return response()->json($soutenances);
    }
}