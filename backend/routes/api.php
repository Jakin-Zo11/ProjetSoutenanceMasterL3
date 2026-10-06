<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\Api\Student\StudentAuthController;
use App\Http\Controllers\Api\Student\StudentProfileController;
use App\Http\Controllers\Api\PlanificationController;
use App\Http\Controllers\Api\IndisponibiliteController;
use App\Http\Controllers\Api\AffectationJuryController;
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

// Planification & convocations (Lauris)
Route::get('/enseignants/{enseignantId}/indisponibilites', [IndisponibiliteController::class, 'index']);
Route::post('/indisponibilites', [IndisponibiliteController::class, 'store']);
Route::delete('/indisponibilites/{id}', [IndisponibiliteController::class, 'destroy']);

Route::get('/planning', [PlanificationController::class, 'index']);
Route::post('/soutenances/{soutenance}/planifier', [PlanificationController::class, 'planifier']);

Route::get('/soutenances/{soutenance}/jurys', [AffectationJuryController::class, 'index']);
Route::post('/soutenances/{soutenance}/jurys', [AffectationJuryController::class, 'store']);
Route::delete('/affectation-jury/{affectation}', [AffectationJuryController::class, 'destroy']);

Route::get('/soutenances/{soutenance}/affectation-jury', [AffectationJuryController::class, 'index']);
Route::post('/soutenances/{soutenance}/affectation-jury', [AffectationJuryController::class, 'store']);

// Auth Routes (email + password — admin / jury)
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Student Routes (connexion par matricule)
Route::prefix('v1/student')->group(function () {
    Route::post('/login', [StudentAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [StudentProfileController::class, 'show']);
        Route::patch('/profile', [StudentProfileController::class, 'update']);
    });
});

// Admin Routes
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:admin_scolarite'])->group(function () {
    Route::apiResource('rooms', RoomController::class);
    Route::apiResource('formations', FormationController::class);
    Route::apiResource('promotions', PromotionController::class);
    Route::apiResource('sessions-soutenance', SessionSoutenanceController::class);
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/roles', [UserController::class, 'assignRole']);
    Route::apiResource('etudiants', EtudiantController::class);
    Route::apiResource('enseignants', EnseignantController::class);
    Route::get('depots', [DepotAdminController::class, 'index']);
    Route::patch('depots/{depot}/statut', [DepotAdminController::class, 'updateStatut']);
    Route::get('soutenances', [SoutenanceAdminController::class, 'index']);
    Route::patch('soutenances/{soutenance}/planning', [SoutenanceAdminController::class, 'updatePlanning']);
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('logs', [ActivityLogController::class, 'index']);
    Route::get('soutenances/{id}/pv', [PvSoutenanceController::class, 'getPv']);
    Route::post('soutenances/{id}/cloturer', [PvSoutenanceController::class, 'cloturer']);
});