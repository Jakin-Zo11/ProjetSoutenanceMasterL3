<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soutenance;
use App\Models\Convocation;

class ConvocationController extends Controller
{
    public function show(Soutenance $soutenance)
    {
        if (!$soutenance->date_debut || !$soutenance->salle_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cette soutenance n\'est pas encore planifiee (date/salle manquante).',
            ], 422);
        }

        $soutenance->load(['affectationsJury.enseignant', 'salle', 'etudiant']);

        $convocation = Convocation::firstOrCreate(
            ['soutenance_id' => $soutenance->id],
            ['generee_le' => now()]
        );

        return response()->json([
            'success' => true,
            'convocation' => $convocation,
            'soutenance' => $soutenance,
        ]);
    }
}