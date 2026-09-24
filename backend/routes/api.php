<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
<<<<<<< HEAD
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\FormationController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\SessionSoutenanceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\EtudiantController;
use App\Http\Controllers\Admin\EnseignantController;
use App\Http\Controllers\Admin\DepotAdminController;
use App\Http\Controllers\Admin\SoutenanceAdminController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\PvSoutenanceController;

=======
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlanningController;
use App\Http\Controllers\Api\IndisponibiliteController;
>>>>>>> 10ca56c (feat(planification): structure complete du module planification et convocations)
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::get('/enseignants/{enseignantId}/indisponibilites', [IndisponibiliteController::class, 'index']);
Route::post('/indisponibilites', [IndisponibiliteController::class, 'store']);
Route::delete('/indisponibilites/{id}', [IndisponibiliteController::class, 'destroy']);

<<<<<<< HEAD
// Auth Routes
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
=======
Route::get('/planning', [PlanningController::class, 'index']);
Route::post('/planning/generate', [PlanningController::class, 'generate']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
>>>>>>> 10ca56c (feat(planification): structure complete du module planification et convocations)
});

// Admin Routes
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:admin_scolarite'])->group(function () {
    // Salles & Infrastructure
    Route::apiResource('rooms', RoomController::class);

    // Structure académique
    Route::apiResource('formations', FormationController::class);
    Route::apiResource('promotions', PromotionController::class);
    Route::apiResource('sessions-soutenance', SessionSoutenanceController::class);

    // Utilisateurs et Acteurs
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/roles', [UserController::class, 'assignRole']);
    Route::apiResource('etudiants', EtudiantController::class);
    Route::apiResource('enseignants', EnseignantController::class);

    // Dépôts & Soutenances (Supervision)
    Route::get('depots', [DepotAdminController::class, 'index']);
    Route::patch('depots/{depot}/statut', [DepotAdminController::class, 'updateStatut']);
    Route::get('soutenances', [SoutenanceAdminController::class, 'index']);
    Route::patch('soutenances/{soutenance}/planning', [SoutenanceAdminController::class, 'updatePlanning']);

    // Tableau de bord & Logs
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('logs', [ActivityLogController::class, 'index']);
    
    // Procès-Verbal & Évaluations
    Route::get('soutenances/{id}/pv', [PvSoutenanceController::class, 'getPv']);
    Route::post('soutenances/{id}/cloturer', [PvSoutenanceController::class, 'cloturer']);
});