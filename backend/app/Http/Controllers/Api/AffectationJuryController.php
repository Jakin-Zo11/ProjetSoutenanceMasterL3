<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AffectationJury;
use App\Models\Soutenance;
use App\Models\User;
use App\Services\ConflitDetectionService;
use Illuminate\Http\Request;

class AffectationJuryController extends Controller
{
    public function __construct(protected ConflitDetectionService $conflitService)
    {
    }

    /**
     * Liste des membres du jury déjà affectés + liste des enseignants disponibles.
     */
    public function index(Soutenance $soutenance)
    {
        $affectations = $soutenance->affectationsJury()
            ->with('enseignant')
            ->get();

        // Récupère les enseignants enregistrés dans la table users
        $enseignantsDisponibles = User::where('role', 'enseignant')->get();

        return response()->json([
            'soutenance' => $soutenance->load(['etudiant', 'salle']),
            'affectations' => $affectations,
            'enseignants' => $enseignantsDisponibles,
        ]);
    }

    /**
     * Affecte manuellement un enseignant à une soutenance avec un rôle.
     */
    public function store(Request $request, Soutenance $soutenance)
    {
        $validated = $request->validate([
            'enseignant_id' => 'required|exists:users,id', // Pointe vers la table users
            'role'          => 'required|in:president,rapporteur,examinateur',
        ]);

        // 1. Vérifier si l'enseignant est déjà dans le jury de cette soutenance (tous rôles confondus)
        $enseignantExiste = $soutenance->affectationsJury()
            ->where('enseignant_id', $validated['enseignant_id'])
            ->exists();

        if ($enseignantExiste) {
            return response()->json([
                'success' => false,
                'message' => 'Cet enseignant fait déjà partie du jury de cette soutenance.',
            ], 422);
        }

        // 2. Le rôle doit être unique pour cette soutenance (1 seul président, 1 rapporteur, 1 examinateur)
        $rolePrisExists = $soutenance->affectationsJury()
            ->where('role', $validated['role'])
            ->exists();

        if ($rolePrisExists) {
            return response()->json([
                'success' => false,
                'message' => "Le rôle '{$validated['role']}' est déjà attribué pour cette soutenance.",
            ], 422);
        }

        // 3. Vérifier les conflits d'horaires
        if ($soutenance->date_debut && $soutenance->date_fin) {
            $indisponible = $this->conflitService->enseignantIndisponible(
                $validated['enseignant_id'],
                $soutenance->date_debut,
                $soutenance->date_fin
            );

            $dejaAffecte = $this->conflitService->enseignantDejaAffecte(
                $validated['enseignant_id'],
                $soutenance->date_debut,
                $soutenance->date_fin
            );

            if ($indisponible || $dejaAffecte) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet enseignant a un conflit d\'horaire sur ce créneau.',
                ], 409);
            }
        }

        // 4. Création de l'affectation
        $affectation = $soutenance->affectationsJury()->create([
            'enseignant_id' => $validated['enseignant_id'],
            'role'          => $validated['role'],
        ]);

        return response()->json([
            'success'     => true,
            'message'     => 'Membre du jury attribué avec succès.',
            'affectation' => $affectation->load('enseignant'),
        ], 201);
    }

    /**
     * Retire un enseignant du jury d'une soutenance.
     */
    public function destroy(AffectationJury $affectation)
    {
        $affectation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Enseignant retiré du jury avec succès.',
        ]);
    }
}