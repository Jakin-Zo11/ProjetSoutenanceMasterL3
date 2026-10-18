<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Creneau;
use App\Http\Requests\StoreCreneauRequest;
use App\Http\Requests\UpdateCreneauRequest;
use Illuminate\Http\Request;

class CreneauController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des créneaux récupérée avec succès.',
            'data' => Creneau::all(),
        ]);
    }

    public function store(StoreCreneauRequest $request)
    {
        $validated = $request->validated();

        $creneau = Creneau::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Créneau créé avec succès.',
            'data' => $creneau,
        ], 201);
    }

    public function update(int $id, UpdateCreneauRequest $request)
    {
        $creneau = Creneau::findOrFail($id);

        $creneau->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Créneau mis à jour avec succès.',
            'data' => $creneau,
        ]);
    }

    public function updateStatut(int $id, Request $request)
    {
        $creneau = Creneau::findOrFail($id);

        $actif = $request->boolean('actif');

        $creneau->update(['actif' => $actif]);

        return response()->json([
            'success' => true,
            'message' => $actif ? 'Créneau activé.' : 'Créneau désactivé.',
            'data' => $creneau,
        ]);
    }

    public function destroy(int $id)
    {
        $creneau = Creneau::findOrFail($id);

        // Vérifier qu'aucune soutenance n'est associée
        if ($creneau->soutenances()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Ce créneau est associé à une soutenance et ne peut pas être supprimé.',
            ], 409);
        }

        $creneau->delete();

        return response()->json([
            'success' => true,
            'message' => 'Créneau supprimé avec succès.',
        ]);
    }
}