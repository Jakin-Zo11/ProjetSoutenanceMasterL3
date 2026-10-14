<?php

namespace Tests\Feature\Api;

use App\Models\Depot;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\Promotion;
use App\Models\Room;
use App\Models\SessionSoutenance;
use App\Models\Soutenance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentSimulationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_student_simulation_endpoints_require_authentication(): void
    {
        foreach (['profile', 'thesis', 'defense', 'documents'] as $endpoint) {
            $this->getJson("/api/v1/student/simulation/{$endpoint}")
                ->assertUnauthorized();
        }
    }

    public function test_authenticated_student_gets_profile_and_latest_depot_data(): void
    {
        $student = User::factory()->create([
            'matricule' => '001I24',
            'role' => 'etudiant',
            'name' => 'Étudiant Authentifié',
        ]);
        $student->assignRole('etudiant');
        $formation = Formation::create([
            'code' => 'IG',
            'name' => 'Informatique Générale',
        ]);
        $promotion = Promotion::create([
            'formation_id' => $formation->id,
            'year' => '2026',
            'name' => 'L3',
            'mention' => 'Informatique',
        ]);
        Depot::create([
            'etudiant_id' => $student->id,
            'promotion_id' => $promotion->id,
            'title' => 'Premier mémoire',
            'file_path' => 'depots/first.pdf',
            'status' => 'valide',
            'submitted_at' => now()->subDay(),
        ]);
        Depot::create([
            'etudiant_id' => $student->id,
            'promotion_id' => $promotion->id,
            'title' => 'Mémoire le plus récent',
            'file_path' => 'depots/latest.pdf',
            'status' => 'en_attente',
            'submitted_at' => now(),
        ]);
        $token = $student->createToken('student_token')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/student/simulation/profile')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Étudiant Authentifié')
            ->assertJsonPath('data.matricule', '001I24')
            ->assertJsonPath('data.formation', 'Informatique Générale')
            ->assertJsonPath('data.parcours', 'Informatique')
            ->assertJsonPath('data.promotion', 'L3 2026');

        $this->withToken($token)->getJson('/api/v1/student/simulation/thesis')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.titre', 'Mémoire le plus récent')
            ->assertJsonPath('data.statut_depot', 'En attente');
    }

    public function test_simulation_data_is_scoped_to_the_authenticated_student_and_returns_null_when_missing(): void
    {
        $student = User::factory()->create(['role' => 'etudiant', 'matricule' => '002I24']);
        $student->assignRole('etudiant');
        $otherStudent = User::factory()->create(['role' => 'etudiant', 'matricule' => '003I24']);
        $otherStudent->assignRole('etudiant');
        $formation = Formation::create(['code' => 'IG', 'name' => 'Informatique Générale']);
        $promotion = Promotion::create([
            'formation_id' => $formation->id,
            'year' => '2026',
            'name' => 'L3',
            'mention' => 'Informatique',
        ]);
        Depot::create([
            'etudiant_id' => $otherStudent->id,
            'promotion_id' => $promotion->id,
            'title' => 'Mémoire appartenant à un autre étudiant',
            'file_path' => 'depots/other.pdf',
            'status' => 'valide',
            'submitted_at' => now(),
        ]);
        $token = $student->createToken('student_token')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/student/simulation/defense')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', null);

        $this->withToken($token)->getJson('/api/v1/student/simulation/thesis')
            ->assertOk()
            ->assertJsonPath('data', null);

        $this->withToken($token)->getJson('/api/v1/student/simulation/documents')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.convocation.statut', 'En attente')
            ->assertJsonPath('data.resultat_final', 'En attente')
            ->assertJsonPath('data.pv.statut', 'En attente');
    }

    public function test_student_can_get_their_scheduled_defense_and_published_result(): void
    {
        $student = User::factory()->create(['role' => 'etudiant', 'matricule' => '004I24']);
        $student->assignRole('etudiant');
        $formation = Formation::create(['code' => 'IG', 'name' => 'Informatique Générale']);
        $promotion = Promotion::create([
            'formation_id' => $formation->id,
            'year' => '2026',
            'name' => 'L3',
            'mention' => 'Informatique',
        ]);
        $depot = Depot::create([
            'etudiant_id' => $student->id,
            'promotion_id' => $promotion->id,
            'title' => 'Mémoire soutenu',
            'file_path' => 'depots/submitted.pdf',
            'status' => 'valide',
            'submitted_at' => now(),
        ]);
        $room = Room::factory()->create(['name' => 'S101']);
        $session = SessionSoutenance::create([
            'title' => 'Session 2026',
            'start_date' => '2026-11-11',
            'end_date' => '2026-11-16',
            'status' => 'en_cours',
        ]);
        $defense = Soutenance::create([
            'depot_id' => $depot->id,
            'session_soutenance_id' => $session->id,
            'room_id' => $room->id,
            'date' => '2026-11-12 10:30:00',
            'status' => 'terminee',
        ]);
        Evaluation::create([
            'soutenance_id' => $defense->id,
            'jury_user_id' => $student->id,
            'note_presentation' => 4,
            'note_manuscrit' => 8,
            'note_reponses' => 4,
            'note_finale' => 16,
            'status' => 'valide',
        ]);
        $token = $student->createToken('student_token')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/student/simulation/defense')
            ->assertOk()
            ->assertJsonPath('data.date', '2026-11-12')
            ->assertJsonPath('data.heure', '10:30:00')
            ->assertJsonPath('data.salle', 'S101')
            ->assertJsonPath('data.statut', 'terminee')
            ->assertJsonCount(0, 'data.jury');

        $this->withToken($token)->getJson('/api/v1/student/simulation/documents')
            ->assertOk()
            ->assertJsonPath('data.convocation.statut', 'Disponible')
            ->assertJsonPath('data.resultat_final', '16.00 / 20')
            ->assertJsonPath('data.pv.statut', 'Disponible');
    }

    public function test_non_student_cannot_access_student_simulation_endpoints(): void
    {
        $teacher = User::factory()->create(['role' => 'enseignant']);
        $teacher->assignRole('enseignant');
        $token = $teacher->createToken('teacher_token')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/student/simulation/profile')
            ->assertForbidden();
    }
}
