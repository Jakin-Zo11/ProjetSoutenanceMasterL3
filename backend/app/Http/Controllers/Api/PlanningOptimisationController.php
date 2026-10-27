<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PlanningOptimisationService;
use Illuminate\Http\Request;

class PlanningOptimisationController extends Controller
{
    /**
     * Propose (ou applique) une optimisation du planning existant.
     * Route : POST /api/planning/optimiser   body : { "appliquer": false|true }
     */
    public function optimiser(Request $request, PlanningOptimisationService $service)
    {
        $validated = $request->validate([
            'appliquer' => 'sometimes|boolean',
        ]);

        return response()->json($service->optimiser((bool) ($validated['appliquer'] ?? false)));
    }
}
