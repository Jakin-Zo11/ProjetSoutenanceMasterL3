<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Soutenance;
use Illuminate\Http\Request;

class SoutenanceAdminController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Soutenance::with(['depot.etudiant', 'depot.promotion', 'salle']);

            if ($request->has('statut')) {
                $query->where('statut', $request->statut);
            }

            if ($request->has('salle_id')) {
                $query->where('salle_id', $request->salle_id);
            }

            if ($request->has('date')) {
                $query->whereDate('date_debut', $request->date);
            }

            $soutenances = $query->orderBy('date_debut', 'asc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Liste des soutenances recuperee avec succes.',
                'data' => $soutenances
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recuperation des soutenances.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePlanning(Request $request, Soutenance $soutenance)
    {
        try {
            $validated = $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after:date_debut',
                'salle_id' => 'nullable|exists:rooms,id',
            ]);

            $soutenance->update($validated);
            $soutenance->load(['depot.etudiant', 'depot.promotion', 'salle']);

            return response()->json([
                'success' => true,
                'message' => 'Planning de la soutenance mis a jour avec succes.',
                'data' => $soutenance
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise a jour du planning.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Soutenance $soutenance)
    {
        try {
            $soutenance->load(['depot.etudiant', 'depot.promotion', 'salle']);

            return response()->json([
                'success' => true,
                'message' => 'Details de la soutenance recuperes avec succes.',
                'data' => $soutenance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recuperation de la soutenance.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
