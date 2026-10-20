<?php

namespace App\Modules\Evaluation\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Soutenance;
use App\Http\Controllers\Controller;
use App\Modules\Evaluation\Models\EvaluationGrid;
use App\Modules\Evaluation\Models\EvaluationScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DefenseEvaluationController extends Controller
{
    public function assigned(Request $request)
    {
        // Nouveau flux : retourner les évaluations (notes globales) du jury connecté
        // en utilisant le modèle Evaluation (racine) qui a soutenance_id → soutenances.id
        $evaluations = Evaluation::where('jury_user_id', $request->user()->id)
            ->with('soutenance')
            ->latest()
            ->get();

        return $evaluations->map(function ($evaluation) {
            return [
                'id' => $evaluation->id,
                'soutenance_id' => $evaluation->soutenance_id,
                // Informations de la soutenance via la relation
                'student_name' => $evaluation->soutenance->etudiantNom ?? 'Étudiant inconnu',
                'theme' => $evaluation->soutenance->theme ?? 'Thème inconnu',
                'date' => $evaluation->soutenance->date ? $evaluation->soutenance->date->format('d/m/Y') : 'Date non disponible',
                'heure' => 'Heure non disponible',
                'salle' => $evaluation->soutenance->room ? $evaluation->soutenance->room->numero_salle ?? 'Salle non disponible' : 'Salle non disponible',
                'status' => $evaluation->status ?? 'draft',
                'note_generale' => $evaluation->note_generale ?? $evaluation->note_finale ?? 0,
                'commentary' => $evaluation->comment ?? '',
            ];
        })->values();
    }

    public function store(Request $request)
    {
        // Nouveau flux : créer une évaluation avec note globale seulement
        // Pas de grille, pas de critères
        $this->requireJury($request);

        $data = $request->validate([
            'soutenance_id' => ['required', 'integer', 'exists:soutenances,id'],
            'note_generale' => ['required', 'numeric', 'min:0', 'max:20'],
            'commentaire' => ['nullable', 'string'],
        ]);

        $evaluation = Evaluation::firstOrCreate(
            ['soutenance_id' => $data['soutenance_id'], 'jury_user_id' => $request->user()->id],
            [
                'note_generale' => $data['note_generale'],
                'commentaire' => $data['commentaire'],
                'status' => 'draft',
            ]
        );

        // Vérification que le jury connecté est bien l'auteur de l'évaluation
        if ($evaluation->jury_user_id !== $request->user()->id) {
            // Si ce n'est pas le cas, on vérifie si c'est un admin
            if (!in_array($request->user()->role, ['admin_scolarite', 'president_jury'], true)) {
                abort(403, 'Seul le jury concerné ou un administrateur peut créer une évaluation.');
            }
        }

        return response()->json([
            'id' => $evaluation->id,
            'soutenance_id' => $evaluation->soutenance_id,
            'note_generale' => $evaluation->note_generale,
            'commentaire' => $evaluation->commentaire,
            'status' => $evaluation->status,
        ]);
    }

    public function show(Request $request, $id)
    {
        // Nouveau flux : afficher une évaluation (note globale)
        $evaluation = Evaluation::with('soutenance')
            ->findOrFail($id);

        // Vérifier que le jury connecté en est bien l'auteur
        if ($evaluation->jury_user_id !== $request->user()->id) {
            abort(403, 'Cette évaluation ne vous appartient pas.');
        }

        return response()->json([
            'id' => $evaluation->id,
            'soutenance_id' => $evaluation->soutenance_id,
            'student_name' => $evaluation->soutenance->etudiantNom ?? 'Étudiant inconnu',
            'theme' => $evaluation->soutenance->theme ?? 'Thème inconnu',
            'date' => $evaluation->soutenance->date ? $evaluation->soutenance->date->format('d/m/Y') : 'Date non disponible',
            'heure' => 'Heure non disponible',
            'salle' => $evaluation->soutenance->room ? $evaluation->soutenance->room->numero_salle ?? 'Salle non disponible' : 'Salle non disponible',
            'note_generale' => $evaluation->note_generale ?? 0,
            'commentary' => $evaluation->commentaire ?? '',
            'status' => $evaluation->status,
        ]);
    }

    public function updateNote(Request $request, $id)
    {
        // Nouveau flux : mettre à jour la note globale d'un jury
        $evaluation = Evaluation::findOrFail($id);

        // Vérifier que le jury connecté en est l'auteur
        if ($evaluation->jury_user_id !== $request->user()->id) {
            abort(403, 'Cette évaluation ne vous appartient pas.');
        }

        $data = $request->validate([
            'note_generale' => ['required', 'numeric', 'min:0', 'max:20'],
            'commentaire' => ['nullable', 'string'],
        ]);

        $evaluation->note_generale = $data['note_generale'];
        $evaluation->commentaire = $data['commentaire'];
        $evaluation->save();

        return response()->json([
            'id' => $evaluation->id,
            'note_generale' => $evaluation->note_generale,
            'commentaire' => $evaluation->commentaire,
            'status' => $evaluation->status,
        ]);
    }

    public function validateDeliberation(Request $request, $id)
    {
        // Délibération : personne autorisée à valider le résultat
        // Vérification formelle du rôle admin_scolarite ou president_jury
        abort_unless(in_array($request->user()->role, ['admin_scolarite', 'president_jury'], true), 403, 'Seule l administration peut valider la délibération.');

        $evaluation = Evaluation::findOrFail($id);

        $data = $request->validate([
            'decision' => ['required', 'string'],
            'mention' => ['nullable', 'string'],
            'commentaire_deliberation' => ['nullable', 'string'],
        ]);

        $evaluation->status = 'validated';
        $evaluation->decision = $data['decision'];
        $evaluation->mention = $data['mention'] ?? null;
        $evaluation->commentaire_deliberation = $data['commentaire_deliberation'];
        $evaluation->validated_at = now();
        $evaluation->save();

        return response()->json([
            'id' => $evaluation->id,
            'status' => $evaluation->status,
            'decision' => $evaluation->decision,
            'mention' => $evaluation->mention,
            'commentaire_deliberation' => $evaluation->commentaire_deliberation,
            'validated_at' => $evaluation->validated_at,
        ]);
    }

    private function requireJury(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['jury', 'admin'], true), 403, 'Action réservée à un membre du jury.');
    }
}