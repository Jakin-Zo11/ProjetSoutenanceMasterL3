<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Indisponibilite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IndisponibiliteController extends Controller
{
    /** Roles qui peuvent gerer les indisponibilites de n'importe quel enseignant. */
    private const ROLES_ADMIN = ['admin_scolarite', 'president_mention'];

    /**
     * Un enseignant ne peut agir que sur ses propres indisponibilites ;
     * l'administration peut agir sur celles de tous.
     */
    private function peutGerer(?User $user, int $enseignantId): bool
    {
        if (!$user) {
            return false;
        }

        return $user->hasAnyRole(self::ROLES_ADMIN) || $user->id === $enseignantId;
    }

    private function refuser(): JsonResponse
    {
        return response()->json([
            'message' => "Vous ne pouvez gerer que vos propres indisponibilites.",
        ], 403);
    }

    /**
     * Liste des indisponibilités d'un enseignant.
     * Route: GET /api/enseignants/{enseignantId}/indisponibilites
     */
    public function index(Request $request, $enseignantId): JsonResponse
    {
        if (!$this->peutGerer($request->user(), (int) $enseignantId)) {
            return $this->refuser();
        }

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
            'enseignant_id' => 'required|integer|exists:users,id',
            'date'          => 'required|date',
            'heure_debut'   => 'required|date_format:H:i',
            'heure_fin'     => 'required|date_format:H:i|after:heure_debut',
            'motif'         => 'nullable|string|max:255',
        ]);

        if (!$this->peutGerer($request->user(), (int) $validated['enseignant_id'])) {
            return $this->refuser();
        }

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
    public function destroy(Request $request, $id): JsonResponse
    {
        $indisponibilite = Indisponibilite::find($id);

        if (!$indisponibilite) {
            return response()->json(['message' => 'Créneau non trouvé.'], 404);
        }

        if (!$this->peutGerer($request->user(), (int) $indisponibilite->enseignant_id)) {
            return $this->refuser();
        }

        $indisponibilite->delete();

        return response()->json(['message' => 'Créneau supprimé avec succès.'], 200);
    }
}