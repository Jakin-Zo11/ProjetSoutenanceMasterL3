<?php

namespace App\Modules\Evaluation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\Soutenance;
use Illuminate\Http\Request;

class DefenseEvaluationController extends Controller
{
    /**
     * Liste des evaluations du jury connecte.
     */
    public function assigned(Request $request)
    {
        $evaluations = Evaluation::where(
            'jury_user_id',
            $request->user()->id
        )
            ->with([
                'soutenance.depot.etudiant',
                'soutenance.room',
            ])
            ->latest()
            ->get();

        return response()->json(
            $evaluations->map(function ($evaluation) {
                $soutenance = $evaluation->soutenance;
                $depot = $soutenance?->depot;

                return [
                    'id' => $evaluation->id,
                    'soutenance_id' => $evaluation->soutenance_id,
                    'student_name' => $depot?->etudiant?->name
                        ?? 'Etudiant inconnu',
                    'theme' => $depot?->title
                        ?? 'Theme inconnu',
                    'date' => $soutenance?->date
                        ? $soutenance->date->format('d/m/Y')
                        : 'Date non disponible',
                    'heure' => $soutenance?->date
                        ? $soutenance->date->format('H:i')
                        : 'Heure non disponible',
                    'salle' => $soutenance?->room?->name
                        ?? 'Salle non disponible',
                    'status' => $evaluation->status,
                    'note_generale' => $evaluation->note_finale,
                    'commentary' => $evaluation->remarques ?? '',
                ];
            })->values()
        );
    }

    /**
     * Creer une evaluation.
     */
    public function store(Request $request)
    {
        $this->requireJury($request);

        $data = $request->validate([
            'soutenance_id' => [
                'required',
                'integer',
                'exists:soutenances,id',
            ],
            'note_generale' => [
                'required',
                'numeric',
                'min:0',
                'max:20',
            ],
            'commentaire' => ['nullable', 'string'],
        ]);

        $evaluation = Evaluation::firstOrNew([
            'soutenance_id' => $data['soutenance_id'],
            'jury_user_id' => $request->user()->id,
        ]);

        $evaluation->note_finale = $data['note_generale'];
        $evaluation->remarques = $data['commentaire'] ?? null;
        $evaluation->status = 'brouillon';
        $evaluation->save();

        return response()->json([
            'id' => $evaluation->id,
            'soutenance_id' => $evaluation->soutenance_id,
            'note_generale' => $evaluation->note_finale,
            'commentaire' => $evaluation->remarques,
            'status' => $evaluation->status,
        ]);
    }

    /**
     * Afficher une evaluation.
     */
    public function show(Request $request, $id)
    {
        $evaluation = Evaluation::with([
            'soutenance.depot.etudiant',
            'soutenance.room',
        ])->findOrFail($id);

        abort_unless(
            (int) $evaluation->jury_user_id === (int) $request->user()->id,
            403,
            'Cette evaluation ne vous appartient pas.'
        );

        $soutenance = $evaluation->soutenance;
        $depot = $soutenance?->depot;

        return response()->json([
            'id' => $evaluation->id,
            'soutenance_id' => $evaluation->soutenance_id,
            'student_name' => $depot?->etudiant?->name
                ?? 'Etudiant inconnu',
            'theme' => $depot?->title ?? 'Theme inconnu',
            'date' => $soutenance?->date
                ? $soutenance->date->format('d/m/Y')
                : 'Date non disponible',
            'heure' => $soutenance?->date
                ? $soutenance->date->format('H:i')
                : 'Heure non disponible',
            'salle' => $soutenance?->room?->name
                ?? 'Salle non disponible',
            'note_generale' => $evaluation->note_finale,
            'commentary' => $evaluation->remarques ?? '',
            'status' => $evaluation->status,
        ]);
    }

    /**
     * Modifier la note et les remarques.
     */
    public function updateNote(Request $request, $id)
    {
        $evaluation = Evaluation::findOrFail($id);

        abort_unless(
            (int) $evaluation->jury_user_id === (int) $request->user()->id,
            403,
            'Cette evaluation ne vous appartient pas.'
        );

        $data = $request->validate([
            'note_generale' => [
                'required',
                'numeric',
                'min:0',
                'max:20',
            ],
            'commentaire' => ['nullable', 'string'],
        ]);

        $evaluation->note_finale = $data['note_generale'];
        $evaluation->remarques = $data['commentaire'] ?? null;
        $evaluation->save();

        return response()->json([
            'id' => $evaluation->id,
            'note_generale' => $evaluation->note_finale,
            'commentaire' => $evaluation->remarques,
            'status' => $evaluation->status,
        ]);
    }

    /**
     * Valider une evaluation.
     */
    public function validateDeliberation(Request $request, $id)
    {
        $this->requirePresidentOrAdmin($request);

        $evaluation = Evaluation::findOrFail($id);

        $data = $request->validate([
            'commentaire_deliberation' => ['nullable', 'string'],
        ]);

        if (!empty($data['commentaire_deliberation'])) {
            $evaluation->remarques = $data['commentaire_deliberation'];
        }

        $evaluation->status = 'valide';
        $evaluation->save();

        return response()->json([
            'id' => $evaluation->id,
            'status' => $evaluation->status,
            'commentaire' => $evaluation->remarques,
        ]);
    }

    private function requireJury(Request $request): void
    {
        $user = $request->user();

        $allowedRoles = [
            'enseignant',
            'president_jury',
            'rapporteur',
            'examinateur',
        ];

        $allowed = in_array($user->role, $allowedRoles, true)
            || $user->hasAnyRole($allowedRoles);

        abort_unless(
            $allowed,
            403,
            'Action reservee aux membres du jury.'
        );
    }

    private function requirePresidentOrAdmin(Request $request): void
    {
        $user = $request->user();

        $allowedRoles = [
            'admin_scolarite',
            'president_jury',
        ];

        $allowed = in_array($user->role, $allowedRoles, true)
            || $user->hasAnyRole($allowedRoles);

        abort_unless(
            $allowed,
            403,
            'Action reservee au president du jury ou a l administration.'
        );
    }
}
