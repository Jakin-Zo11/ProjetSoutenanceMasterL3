<?php

namespace App\Http\Controllers\Api\Simulation;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PlanificationSimulationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'date' => '2026-11-11',
                    'time_start' => '08:00',
                    'time_end' => '09:30',
                    'room' => 'Salle 101',
                    'student' => [
                        'matricule' => '001I24',
                        'name' => 'Rakoto Andry',
                        'theme' => 'Conception d’une application de gestion de soutenances',
                    ],
                    'jury' => [
                        ['name' => 'Rabe Jean', 'role' => 'president'],
                        ['name' => 'Rasoanaivo Hanta', 'role' => 'rapporteur'],
                        ['name' => 'Randria Lova', 'role' => 'examiner'],
                    ],
                    'status' => 'scheduled',
                ],
                [
                    'id' => 2,
                    'date' => '2026-11-12',
                    'time_start' => '09:45',
                    'time_end' => '11:15',
                    'room' => 'Amphi A',
                    'student' => [
                        'matricule' => '002I24',
                        'name' => 'Ranaivo Miora',
                        'theme' => 'Mise en place d’une plateforme de suivi académique',
                    ],
                    'jury' => [],
                    'status' => 'jury_pending',
                ],
                [
                    'id' => 3,
                    'date' => '2026-11-14',
                    'time_start' => '14:00',
                    'time_end' => '15:30',
                    'room' => 'Salle 102',
                    'student' => [
                        'matricule' => '003I24',
                        'name' => 'Andriamampionona Tiana',
                        'theme' => 'Sécurisation des échanges dans une application web',
                    ],
                    'jury' => [
                        ['name' => 'Rakoto Paul', 'role' => 'president'],
                        ['name' => 'Raveloson Fara', 'role' => 'rapporteur'],
                        ['name' => 'Rajaonarivelo Solo', 'role' => 'examiner'],
                    ],
                    'status' => 'scheduled',
                ],
            ],
        ]);
    }
}
