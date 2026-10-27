<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soutenance;
use App\Services\ConflitDetectionService;
use Illuminate\Http\Request;

class PlanningValidationController extends Controller
{
    // Responsable = president_mention. L'administrateur est aussi autorise (demo).
    private const ROLES_VALIDATEURS = ['president_mention', 'admin_scolarite'];

    public function statut()
    {
        $planifiees = Soutenance::where('statut', 'planifiee')->count();
        $validees = Soutenance::where('statut', 'planifiee')->whereNotNull('valide_le')->count();

        // Soutenances validees dont la convocation a ete diffusee apres la derniere validation
        $diffusees = Soutenance::where('statut', 'planifiee')
            ->whereNotNull('valide_le')
            ->whereHas('convocation', function ($q) {
                $q->whereNotNull('diffusee_le')
                  ->whereColumn('convocations.diffusee_le', '>=', 'soutenances.valide_le');
            })
            ->count();

        return response()->json([
            'planifiees' => $planifiees,
            'validees'   => $validees,
            'a_valider'  => $planifiees - $validees,
            'diffusees'  => $diffusees,
            'a_diffuser' => $validees - $diffusees,
        ]);
    }

    public function valider(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->hasAnyRole(self::ROLES_VALIDATEURS)) {
            return response()->json([
                'success' => false,
                'message' => 'Seul le responsable peut valider le planning.',
            ], 403);
        }

        $data = $request->validate([
            'ids'   => 'nullable|array',
            'ids.*' => 'integer|exists:soutenances,id',
        ]);

        $query = Soutenance::where('statut', 'planifiee')
            ->whereNull('valide_le')
            ->with('affectationsJury')
            ->withCount('affectationsJury');

        if (!empty($data['ids'])) {
            $query->whereIn('id', $data['ids']);
        }

        $conflitService = app(ConflitDetectionService::class);
        $aValider = [];
        $ignorees = [];

        foreach ($query->get() as $s) {
            if (!$s->date_debut || !$s->salle_id) {
                $ignorees[] = ['id' => $s->id, 'raison' => 'creneau ou salle manquant'];
            } elseif ($s->affectations_jury_count < 3) {
                $ignorees[] = ['id' => $s->id, 'raison' => 'jury incomplet'];
            } elseif ($raisons = $conflitService->conflitsPour($s)) {
                $ignorees[] = ['id' => $s->id, 'raison' => 'conflit : ' . implode(', ', $raisons)];
            } else {
                $aValider[] = $s->id;
            }
        }

        if ($aValider) {
            Soutenance::whereIn('id', $aValider)->update([
                'valide_le'  => now(),
                'valide_par' => $user->id,
            ]);
        }

        return response()->json([
            'success'  => true,
            'validees' => count($aValider),
            'ignorees' => $ignorees,
        ]);
    }
}
