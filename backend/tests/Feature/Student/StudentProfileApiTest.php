<?php

namespace Tests\Feature\Student;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentProfileApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::findOrCreate('etudiant', 'api');
        Role::findOrCreate('jury', 'api');
    }

    public function test_student_can_read_and_update_only_allowed_profile_fields(): void
    {
        $student = User::factory()->create([
            'name' => 'RAKOTO Jean',
            'matricule' => '001I24',
            'email' => 'student@example.com',
            'telephone' => '034000001',
        ]);
        $student->assignRole('etudiant');
        $token = $student->createToken('student_token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/student/profile?student_id=999')
            ->assertOk()
            ->assertJsonPath('student.id', $student->id)
            ->assertJsonPath('student.matricule', '001I24');

        $this->withToken($token)
            ->patchJson('/api/v1/student/profile', [
                'email' => 'updated@example.com',
                'telephone' => '034000002',
                'name' => 'OTHER PERSON',
                'matricule' => '002I24',
            ])
            ->assertOk()
            ->assertJsonPath('student.email', 'updated@example.com')
            ->assertJsonPath('student.telephone', '034000002')
            ->assertJsonPath('student.name', 'RAKOTO Jean')
            ->assertJsonPath('student.matricule', '001I24');

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'name' => 'RAKOTO Jean',
            'matricule' => '001I24',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_student_profile_requires_student_role_and_authentication(): void
    {
        $this->getJson('/api/v1/student/profile')->assertUnauthorized();

        $jury = User::factory()->create();
        $jury->assignRole('jury');
        $token = $jury->createToken('jury_token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/student/profile')
            ->assertForbidden();
    }
}