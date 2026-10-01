<?php
// app/Http/Controllers/Api/AffectationJuryController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AffectationJury;
use App\Models\Soutenance;
use App\Services\ConflitDetectionService;
use Illuminate\Http\Request;

class AffectationJuryController extends Controller
{
    public function __construct(protected ConflitDetectionService $conflitService)
    {
    }

    /**
     * Liste les jurys deja affectes a une soutenance.
     */
    public function index(Soutenance $soutenance)
    {
        return response()->json(
            $soutenance->affectationsJury()->with('enseignant')->get()
        );
    }

    /**
     * Affecte manuellement un enseignant a une soutenance avec un role.
     */
    public function store(Request $request, Soutenance $soutenance)
    {
        $validated = $request->validate([
            'enseignant_id' => 'required|exists:enseignants,id',
            'role' => 'required|in:president,rapporteur,examinateur',
        ]);

        // Le role doit etre unique pour cette soutenance
        $rolePrisExists = $soutenance->affectationsJury()
            ->where('role', $validated['role'])
            ->exists();

        if ($rolePrisExists) {
            return response()->json([
                'success' => false,
                'message' => "Le role {$validated['role']} est deja attribue pour cette soutenance.",
            ], 422);
        }

        // Verifier les conflits d'horaire, uniquement si la soutenance a deja un creneau
        if ($soutenance->date_debut && $soutenance->date_fin) {
            $occupe = $this->conflitService->enseignantIndisponible(
                $validated['enseignant_id'],
                $soutenance->date_debut,
                $soutenance->date_fin
            ) || $this->conflitService->enseignantDejaAffecte(
                $validated['enseignant_id'],
                $soutenance->date_debut,
                $soutenance->date_fin
            );

            if ($occupe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet enseignant a un conflit d\'horaire sur ce creneau.',
                ], 409);
            }
        }

        $affectation = $soutenance->affectationsJury()->create($validated);

        return response()->json([
            'success' => true,
            'affectation' => $affectation->load('enseignant'),
        ], 201);
    }

    /**
     * Retire un enseignant du jury d'une soutenance.
     */
    public function destroy(AffectationJury $affectation)
    {
        $affectation->delete();

        return response()->json(['success' => true]);
    }
}