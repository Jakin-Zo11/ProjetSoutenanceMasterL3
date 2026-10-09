<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Depot;
use App\Models\Evaluation;
use App\Models\Soutenance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentSimulationController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        /** @var User $student */
        $student = $request->user();
        $depot = $this->latestDepot($student);
        $promotion = $depot?->promotion;

        return response()->json([
            'success' => true,
            'data' => [
                'name' => $student->name,
                'email' => $student->email,
                'matricule' => (string) $student->matricule,
                'formation' => $promotion?->formation?->name,
                'parcours' => $promotion?->mention,
                'niveau' => null,
                'promotion' => $promotion
                    ? trim($promotion->name . ' ' . $promotion->year)
                    : null,
            ],
        ]);
    }

    public function thesis(Request $request): JsonResponse
    {
        /** @var User $student */
        $student = $request->user();
        $depot = $this->latestDepot($student);

        if (! $depot) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Aucun dépôt de mémoire n’est associé à cet étudiant.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'titre' => $depot->title,
                'description' => null,
                'perimetre' => null,
                'statut_depot' => $this->submissionStatus($depot->status),
            ],
        ]);
    }

    public function defense(Request $request): JsonResponse
    {
        /** @var User $student */
        $student = $request->user();
        $depot = $this->latestDepot($student);
        $defense = $depot ? $this->latestDefense($depot) : null;

        if (! $defense) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Aucune soutenance n’est planifiée pour cet étudiant.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $defense->date?->format('Y-m-d'),
                'heure' => $defense->date?->format('H:i:s'),
                'salle' => $defense->room?->name,
                'jury' => [],
                'statut' => $defense->status,
            ],
        ]);
    }

    public function documents(Request $request): JsonResponse
    {
        /** @var User $student */
        $student = $request->user();
        $depot = $this->latestDepot($student);
        $defense = $depot ? $this->latestDefense($depot) : null;
        $validatedEvaluations = $defense
            ? Evaluation::query()
                ->where('soutenance_id', $defense->id)
                ->where('status', 'valide')
            : null;
        $finalScore = $validatedEvaluations?->avg('note_finale');
        $isPvAvailable = $defense?->status === 'terminee'
            && $finalScore !== null;

        return response()->json([
            'success' => true,
            'data' => [
                'convocation' => [
                    'statut' => $defense && $defense->status !== 'annulee'
                        ? 'Disponible'
                        : 'En attente',
                ],
                'resultat_final' => $isPvAvailable
                    ? number_format((float) $finalScore, 2, '.', '') . ' / 20'
                    : 'En attente',
                'pv' => [
                    'statut' => $isPvAvailable ? 'Disponible' : 'En attente',
                ],
            ],
        ]);
    }

    private function latestDepot(User $student): ?Depot
    {
        return $student->depots()
            ->with('promotion.formation')
            ->latest('submitted_at')
            ->latest('id')
            ->first();
    }

    private function latestDefense(Depot $depot): ?Soutenance
    {
        return $depot->soutenances()
            ->with('room')
            ->orderByDesc('date')
            ->first();
    }

    private function submissionStatus(string $status): string
    {
        return match ($status) {
            'valide' => 'Validé',
            'rejete' => 'Rejeté',
            default => 'En attente',
        };
    }
}
