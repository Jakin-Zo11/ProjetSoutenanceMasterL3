<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PlanningGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlanningController extends Controller
{
    protected PlanningGeneratorService $generatorService;

    public function __construct(PlanningGeneratorService $generatorService)
    {
        $this->generatorService = $generatorService;
    }

    public function generate(Request $request): JsonResponse
    {
        try {
            $dateDebut = $request->input('date_debut', '2026-10-15');
            
            $res = $this->generatorService->generate($dateDebut);

            return response()->json($res, 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la génération : ' . $e->getMessage()
            ], 500);
        }
    }
}