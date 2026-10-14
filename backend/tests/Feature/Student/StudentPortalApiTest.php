<?php

namespace Tests\Feature\Student;

use App\Models\Depot;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\Promotion;
use App\Models\Room;
use App\Models\SessionSoutenance;
use App\Models\Soutenance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentPortalApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::findOrCreate('etudiant', 'api');
        Storage::fake('local');
    }

    public function test_student_can_submit_theme_and_only_access_their_deposit(): void
    {
        [$student, $token] = $this->createStudent('001I24');
        [$otherStudent] = $this->createStudent('002I24');

        $response = $this->withToken($token)->postJson('/api/v1/student/theme', [
            'title' => 'Gestion numérique des soutenances',
            'file' => UploadedFile::fake()->create('theme.pdf', 200, 'application/pdf'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'en_attente')
            ->assertJsonPath('data.type', 'theme');

        $depositId = $response->json('data.id');
        $this->assertDatabaseHas('depots', [
            'id' => $depositId,
            'etudiant_id' => $student->id,
            'type' => 'theme',
        ]);

        $this->actingAs($otherStudent, 'sanctum')
            ->getJson("/api/v1/student/deposits/{$depositId}/file")
            ->assertNotFound();
        $this->actingAs($otherStudent, 'sanctum')
            ->getJson('/api/v1/student/theme')
            ->assertOk()
            ->assertJsonPath('data', null);
    }

    public function test_student_can_submit_thesis_and_duplicate_pending_deposit_is_rejected(): void
    {
        [, $token] = $this->createStudent('001I24');
        $payload = [
            'title' => 'Mémoire de fin d’études',
            'file' => UploadedFile::fake()->create('memoire.pdf', 500, 'application/pdf'),
        ];

        $this->withToken($token)->postJson('/api/v1/student/thesis', $payload)
            ->assertCreated()
            ->assertJsonPath('data.type', 'memoire');

        $this->withToken($token)->postJson('/api/v1/student/thesis', $payload)
            ->assertStatus(409);
    }

    public function test_student_can_read_only_published_result_and_related_notifications(): void
    {
        [$student] = $this->createStudent('001I24');
        [$otherStudent] = $this->createStudent('002I24');
        $defense = $this->createCompletedDefense($student);
        $this->createCompletedDefense($otherStudent);

        $this->actingAs($student, 'sanctum')->getJson('/api/v1/student/result')
            ->assertOk()
            ->assertJsonPath('data.average', 16.5)
            ->assertJsonPath('data.mention', 'Très Bien');

        $this->actingAs($otherStudent, 'sanctum')->getJson('/api/v1/student/result')
            ->assertOk()
            ->assertJsonPath('data.average', 16.5);

        $this->actingAs($student, 'sanctum')->getJson('/api/v1/student/pv')
            ->assertOk()
            ->assertJsonPath('data.etudiant.id', $student->id);

        $notifications = $this->actingAs($student, 'sanctum')->getJson('/api/v1/student/notifications')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'pv_disponible');

        $notificationId = $notifications->json('data.0.id');
        $this->actingAs($otherStudent, 'sanctum')
            ->patchJson("/api/v1/student/notifications/{$notificationId}/read")
            ->assertNotFound();

        $this->actingAs($student, 'sanctum')
            ->patchJson("/api/v1/student/notifications/{$notificationId}/read")
            ->assertOk();

        $this->assertSame($defense->id, Soutenance::first()->id);
    }

    public function test_student_with_no_planning_sees_empty_defense_and_convocation(): void
    {
        [, $token] = $this->createStudent('001I24');

        $this->withToken($token)->getJson('/api/v1/student/defense')
            ->assertOk()
            ->assertJsonPath('data', null);
        $this->withToken($token)->getJson('/api/v1/student/convocation')
            ->assertOk()
            ->assertJsonPath('data', null);
        $this->withToken($token)->getJson('/api/v1/student/result')
            ->assertOk()
            ->assertJsonPath('data', null);
        $this->withToken($token)->getJson('/api/v1/student/pv')
            ->assertOk()
            ->assertJsonPath('data', null);
    }

    private function createStudent(string $matricule): array
    {
        $formation = Formation::firstOrCreate(
            ['code' => 'TEST'],
            ['name' => 'Formation de test'],
        );
        $promotion = Promotion::firstOrCreate(
            ['formation_id' => $formation->id, 'year' => '2026'],
            ['name' => 'Promotion de test'],
        );
        $student = User::factory()->create([
            'matricule' => $matricule,
            'status' => 'actif',
            'promotion_id' => $promotion->id,
        ]);
        $student->assignRole('etudiant');

        return [$student, $student->createToken('student_token')->plainTextToken];
    }

    private function createCompletedDefense(User $student): Soutenance
    {
        $deposit = Depot::create([
            'etudiant_id' => $student->id,
            'promotion_id' => $student->promotion_id,
            'type' => 'memoire',
            'title' => 'Mémoire étudiant',
            'file_path' => "student-deposits/{$student->id}/memoire/test.pdf",
            'status' => 'valide',
            'submitted_at' => now(),
            'validated_at' => now(),
        ]);
        $session = SessionSoutenance::create([
            'title' => 'Session 2026',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'status' => 'terminee',
        ]);
        $room = Room::firstOrCreate(
            ['name' => 'A101'],
            ['building' => 'Bâtiment A', 'capacity' => 30],
        );
        $defense = Soutenance::create([
            'depot_id' => $deposit->id,
            'session_soutenance_id' => $session->id,
            'room_id' => $room->id,
            'date' => '2026-10-20 09:00:00',
            'status' => 'terminee',
        ]);
        $jury = User::factory()->create();
        Evaluation::create([
            'soutenance_id' => $defense->id,
            'jury_user_id' => $jury->id,
            'note_presentation' => 17,
            'note_manuscrit' => 16,
            'note_reponses' => 16,
            'note_finale' => 16.5,
            'status' => 'valide',
        ]);

        return $defense;
    }
}