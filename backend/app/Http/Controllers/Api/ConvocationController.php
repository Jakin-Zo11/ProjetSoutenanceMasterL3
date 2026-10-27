<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soutenance;
use App\Services\ConvocationService;
use DomainException;
use Illuminate\Http\Request;

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
            'success'      => true,
            'convocation'  => $convocation,
            'soutenance'   => $soutenance,
            'diffusee'      => $convocationService->estDiffusee($soutenance, $convocation),
        ]);
    }

    /**
     * Diffuse la convocation d'une soutenance (etudiant + jury).
     * Route : POST /api/soutenances/{soutenance}/convocation/diffuser  (?renvoyer=1 pour forcer un nouvel envoi)
     */
    public function diffuser(Request $request, Soutenance $soutenance, ConvocationService $convocationService)
    {
        try {
            $resultat = $convocationService->diffuser(
                $soutenance,
                $request->user(),
                $request->boolean('renvoyer')
            );
        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json(['success' => true] + $resultat);
    }

    /**
     * Diffuse toutes les convocations des soutenances validees pas encore diffusees.
     * Route : POST /api/planning/convocations/diffuser
     */
    public function diffuserTout(Request $request, ConvocationService $convocationService)
    {
        return response()->json(
            ['success' => true] + $convocationService->diffuserTout($request->user())
        );
    }
}
