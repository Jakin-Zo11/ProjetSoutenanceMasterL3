<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Profil étudiant connecté.
 *
 * GET   /api/v1/student/profile  → retourne le profil
 * PATCH /api/v1/student/profile  → met à jour uniquement email et telephone
 *
 * Champs VERROUILLÉS (jamais modifiables par l'étudiant) :
 *   matricule, name, promotion_id
 */
class StudentProfileController extends Controller
{
    /**
     * Retourner le profil de l'étudiant connecté.
     */
    public function show(Request $request): JsonResponse
    {
        $student = $request->user()->load(['promotion.formation']);

        return response()->json([
            'success' => true,
            'student' => StudentAuthController::formatStudent($student),
        ]);
    }

    /**
     * Mettre à jour les informations modifiables.
     *
     * Seuls email et telephone sont acceptés.
     * Toute tentative de modifier matricule, name ou promotion_id est silencieusement ignorée.
     */
    public function update(Request $request): JsonResponse
    {
        $student = $request->user();

        // Validation — uniquement les champs autorisés
        $validated = $request->validate([
            'email'     => 'sometimes|email|unique:users,email,' . $student->id,
            'telephone' => 'sometimes|nullable|string|max:20',
        ], [
            'email.email'   => 'Adresse email invalide.',
            'email.unique'  => 'Cette adresse email est déjà utilisée.',
            'telephone.max' => 'Le numéro de téléphone ne doit pas dépasser 20 caractères.',
        ]);

        // Protection explicite : on n'extrait que les clés autorisées
        // même si le client envoie matricule / name / promotion_id
        $allowedKeys = ['email', 'telephone'];
        $safeData    = array_intersect_key($validated, array_flip($allowedKeys));

        if (empty($safeData)) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun champ modifiable fourni.',
            ], 422);
        }

        $student->update($safeData);
        $student->load(['promotion.formation']);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès.',
            'student' => StudentAuthController::formatStudent($student),
        ]);
    }
}
