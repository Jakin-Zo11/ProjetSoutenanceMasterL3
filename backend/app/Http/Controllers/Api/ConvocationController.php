<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soutenance;
use App\Services\ConvocationService;
use DomainException;

class ConvocationController extends Controller
{
    public function show(Soutenance $soutenance, ConvocationService $convocationService)
    {
        try {
            $convocation = $convocationService->generer($soutenance);
        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $soutenance->load(['affectationsJury.enseignant', 'salle', 'etudiant']);

        return response()->json([
            'success' => true,
            'convocation' => $convocation,
            'soutenance' => $soutenance,
        ]);
    }
}
