<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParametrePlanification;
use Illuminate\Http\Request;

class ParametrePlanificationController extends Controller
{
    public function show()
    {
        return response()->json(ParametrePlanification::actuel());
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'heure_debut_journee' => 'required|date_format:H:i',
            'heure_fin_journee' => 'required|date_format:H:i|after:heure_debut_journee',
            'duree_minutes' => 'required|integer|min:15|max:240',
        ]);

        $params = ParametrePlanification::actuel();
        $params->update($validated);

        return response()->json(['success' => true, 'parametres' => $params]);
    }
}