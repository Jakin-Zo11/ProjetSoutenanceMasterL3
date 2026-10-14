<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des promotions récupérée avec succès.',
            'data' => Promotion::with('formation')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'formation_id' => ['required', 'integer', 'exists:formations,id'],
            'year' => ['required', 'string', 'max:32'],
            'name' => ['required', 'string', 'max:255'],
            'mention' => ['required', 'string', 'max:255'],
        ]);

        $promotion = Promotion::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Promotion créée avec succès.',
            'data' => $promotion->load('formation'),
        ], 201);
    }

    public function show(Promotion $promotion): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Détails de la promotion récupérés avec succès.',
            'data' => $promotion->load('formation'),
        ]);
    }

    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $validated = $request->validate([
            'formation_id' => ['sometimes', 'required', 'integer', 'exists:formations,id'],
            'year' => ['sometimes', 'required', 'string', 'max:32'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'mention' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $promotion->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Promotion mise à jour avec succès.',
            'data' => $promotion->refresh()->load('formation'),
        ]);
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Promotion supprimée avec succès.',
        ]);
    }
}
