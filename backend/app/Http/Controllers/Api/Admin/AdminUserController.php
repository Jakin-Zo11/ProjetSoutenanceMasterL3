<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminUserController extends Controller
{
    public function students(): JsonResponse
    {
        $students = User::query()
            ->where(function ($query) {
                $query->whereIn('role', ['student', 'etudiant'])
                    ->orWhereHas('roles', function ($roleQuery) {
                        $roleQuery->whereIn('name', ['student', 'etudiant']);
                    });
            })
            ->with(['roles', 'promotion'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    public function teachers(): JsonResponse
    {
        $teachers = User::query()
            ->where(function ($query) {
                $query->whereIn('role', ['teacher', 'enseignant', 'president_jury', 'rapporteur', 'examinateur'])
                    ->orWhereHas('roles', function ($roleQuery) {
                        $roleQuery->whereIn('name', ['teacher', 'enseignant', 'president_jury', 'rapporteur', 'examinateur']);
                    });
            })
            ->with('roles')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $teachers,
        ]);
    }
}
