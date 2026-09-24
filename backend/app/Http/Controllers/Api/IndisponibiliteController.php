<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Indisponibilite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IndisponibiliteController extends Controller
{
    /**
     * Liste des indisponibilités d'un enseignant.
     * Route: GET /api/enseignants/{enseignantId}/indisponibilites
     */
    public function index($enseignantId): JsonResponse
    {
        $indisponibilites = Indisponibilite::where('enseignant_id', $enseignantId)
            ->orderBy('date', 'asc')
            ->orderBy('heure_debut', 'asc')
            ->get();

        return response()->json($indisponibilites, 200);
    }

    /**
     * Ajouter un créneau d'indisponibilité.
     * Route: POST /api/indisponibilites
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enseignant_id' => 'required|exists:enseignants,id',
            'date'          => 'required|date',
            'heure_debut'   => 'required|date_format:H:i',
            'heure_fin'     => 'required|date_format:H:i|after:heure_debut',
            'motif'         => 'nullable|string|max:255',
        ]);

        $indisponibilite = Indisponibilite::create($validated);

        return response()->json([
            'message' => 'Indisponibilité enregistrée avec succès.',
            'data'    => $indisponibilite
        ], 201);
    }

    /**
     * Supprimer un créneau d'indisponibilité.
     * Route: DELETE /api/indisponibilites/{id}
     */
    public function destroy($id): JsonResponse
    {
        $indisponibilite = Indisponibilite::find($id);

        if (!$indisponibilite) {
            return response()->json(['message' => 'Créneau non trouvé.'], 404);
        }

        $indisponibilite->delete();

        return response()->json(['message' => 'Créneau supprimé avec succès.'], 200);
    }
}