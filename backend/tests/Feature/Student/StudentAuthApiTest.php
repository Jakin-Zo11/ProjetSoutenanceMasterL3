<?php

namespace Tests\Feature\Student;

use App\Models\Formation;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentAuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::findOrCreate('etudiant', 'api');
    }

    public function test_student_can_login_with_promotion_and_formation(): void
    {
        $formation = Formation::create([
            'code' => 'IG',
            'name' => 'Informatique de Gestion',
        ]);
        $promotion = Promotion::create([
            'formation_id' => $formation->id,
            'year' => '2024-2025',
            'name' => 'Promotion 14',
        ]);
        $student = User::factory()->create([
            'name' => 'RAKOTO Jean',
            'matricule' => '001I24',
            'status' => 'actif',
            'promotion_id' => $promotion->id,
        ]);
        $student->assignRole('etudiant');

        $this->postJson('/api/v1/student/login', ['matricule' => '001I24'])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('student.id', $student->id)
            ->assertJsonPath('student.promotion_id', $promotion->id)
            ->assertJsonPath('student.formation', 'Informatique de Gestion')
            ->assertJsonPath('student.promotion', 'Promotion 14 2024-2025')
            ->assertJsonStructure(['token']);
    }

    public function test_login_rejects_invalid_matricule_format(): void
    {
        $this->postJson('/api/v1/student/login', ['matricule' => 'MAT-2024-001'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('matricule');
    }

    public function test_login_rejects_unknown_matricule(): void
    {
        $this->postJson('/api/v1/student/login', ['matricule' => '002I24'])
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_login_rejects_users_without_student_role(): void
    {
        User::factory()->create([
            'matricule' => '002I24',
            'status' => 'actif',
        ]);

        $this->postJson('/api/v1/student/login', ['matricule' => '002I24'])
            ->assertForbidden();
    }

    public function test_student_can_revoke_their_token(): void
    {
        $student = User::factory()->create(['status' => 'actif']);
        $student->assignRole('etudiant');
        $token = $student->createToken('student_token')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/student/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withToken($token)
            ->getJson('/api/v1/student/profile')
            ->assertUnauthorized();
    }
}