<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Authentification étudiant par matricule.
 *
 * POST /api/v1/student/login
 * Body : { "matricule": "001I24" }
 */
class StudentAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        // Validation : matricule obligatoire, format XXXIXX (3 chiffres + I + 2 chiffres)
        $request->validate([
            'matricule' => ['required', 'string', 'regex:/^\d{3}I\d{2}$/'],
        ], [
            'matricule.required' => 'Le matricule est obligatoire.',
            'matricule.regex'    => 'Format invalide. Exemple attendu : 001I24',
        ]);

        // Recherche exacte — le matricule est une chaîne, jamais converti en nombre
        $student = User::where('matricule', $request->matricule)
            ->with(['promotion.formation'])
            ->first();

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun étudiant trouvé avec ce matricule.',
            ], 404);
        }

        // Vérifier que l'utilisateur a bien le rôle étudiant
        if (! $student->hasRole('etudiant')) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        // Vérifier le statut actif
        if ($student->status !== 'actif') {
            return response()->json([
                'success' => false,
                'message' => 'Ce compte étudiant est désactivé. Contactez la scolarité.',
            ], 403);
        }

        // Révoquer les anciens tokens étudiant pour éviter l'accumulation
        $student->tokens()->where('name', 'student_token')->delete();

        // Créer un nouveau token Sanctum
        $token = $student->createToken('student_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'student' => $this->formatStudent($student),
        ]);
    }

    /**
     * Formate les données étudiant à retourner au mobile.
     * Le matricule est toujours retourné comme string.
     */
    public static function formatStudent(User $student): array
    {
        $promotionName  = $student->promotion?->name ?? '';
        $promotionYear  = $student->promotion?->year ?? '';
        $formationName  = $student->promotion?->formation?->name ?? '';

        return [
            'id'           => $student->id,
            'matricule'    => (string) $student->matricule,   // string, jamais int
            'name'         => $student->name,
            'email'        => $student->email ?? '',
            'telephone'    => $student->telephone ?? '',
            'formation'    => $formationName,
            'promotion'    => trim("$promotionName $promotionYear"),
            'status'       => $student->status,
            'promotion_id' => $student->promotion_id,
        ];
    }
}
