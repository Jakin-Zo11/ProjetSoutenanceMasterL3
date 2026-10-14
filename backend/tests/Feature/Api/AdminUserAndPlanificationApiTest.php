<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserAndPlanificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lists_require_sanctum_authentication(): void
    {
        $this->getJson('/api/admin/students')->assertUnauthorized();
        $this->getJson('/api/admin/teachers')->assertUnauthorized();
        $this->getJson('/api/simulation/planifications')->assertUnauthorized();
    }

    public function test_authenticated_user_can_list_students_and_teachers_by_role(): void
    {
        User::factory()->create(['name' => 'Student One', 'role' => 'student']);
        User::factory()->create(['name' => 'Etudiant Two', 'role' => 'etudiant']);
        User::factory()->create(['name' => 'Teacher One', 'role' => 'teacher']);
        User::factory()->create(['name' => 'Enseignant Two', 'role' => 'enseignant']);
        User::factory()->create(['name' => 'Admin User', 'role' => 'admin_scolarite']);

        $token = User::factory()->create(['role' => 'admin_scolarite'])
            ->createToken('test')
            ->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/students')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');

        $this->withToken($token)->getJson('/api/admin/teachers')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_authenticated_user_can_get_simulated_planifications(): void
    {
        $token = User::factory()->create()->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/simulation/planifications')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.date', '2026-11-11')
            ->assertJsonPath('data.0.student.matricule', '001I24');
    }
}
