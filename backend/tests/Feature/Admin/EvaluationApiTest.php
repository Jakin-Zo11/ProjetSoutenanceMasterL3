<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\Evaluation\Models\DefenseEvaluation;
use App\Modules\Evaluation\Models\EvaluationGrid;
use App\Modules\Evaluation\Models\EvaluationGridAssignment;
use App\Modules\Evaluation\Models\EvaluationScore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationApiTest extends TestCase
{
    use RefreshDatabase;

    private const DEFENSE_ID = 4242;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    private function tokenFor(string $role): string
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user->createToken('test_token')->plainTextToken;
    }

    private function headersFor(string $token): array
    {
        return ['Authorization' => 'Bearer ' . $token];
    }

    private function createGrid(string $token, string $name = 'Grille Master L3'): int
    {
        $response = $this->withHeaders($this->headersFor($token))->postJson('/api/evaluation-grids', [
            'name' => $name,
            'description' => 'Grille utilisée par les tests du module Évaluation.',
            'is_active' => true,
        ]);
        $response->assertStatus(201);

        return (int) $response->json('id');
    }

    private function createCriterion(string $token, int $gridId): int
    {
        $response = $this->withHeaders($this->headersFor($token))->postJson("/api/evaluation-grids/{$gridId}/criteria", [
            'name' => 'Clarté de l’exposé',
            'max_score' => 10,
            'coefficient' => 2,
            'position' => 0,
        ]);
        $response->assertStatus(201);

        return (int) $response->json('id');
    }

    private function createScoredEvaluation(int $gridId, int $criterionId, User $jury): DefenseEvaluation
    {
        EvaluationGridAssignment::create([
            'defense_id' => self::DEFENSE_ID,
            'evaluation_grid_id' => $gridId,
        ]);

        $evaluation = DefenseEvaluation::create([
            'defense_id' => self::DEFENSE_ID,
            'jury_id' => $jury->id,
            'evaluation_grid_id' => $gridId,
        ]);

        EvaluationScore::create([
            'defense_evaluation_id' => $evaluation->id,
            'evaluation_criterion_id' => $criterionId,
            'score' => 8,
            'weighted_score' => 16,
        ]);

        return $evaluation;
    }

    public function test_grids_require_authentication(): void
    {
        $this->getJson('/api/evaluation-grids')->assertStatus(401);
    }

    public function test_student_cannot_read_evaluation_scores(): void
    {
        $this->withHeaders($this->headersFor($this->tokenFor('etudiant')))
            ->getJson('/api/evaluation-defenses/' . self::DEFENSE_ID . '/scores')
            ->assertStatus(403);
    }

    public function test_jury_member_cannot_create_or_update_grids(): void
    {
        // Reset auth guard to prevent identity from previous test requests persisting
        $this->app['auth']->forgetGuards();
        $juryToken = $this->tokenFor('rapporteur');
        $gridId = $this->createGrid($this->tokenFor('admin_scolarite'));

        $this->withHeaders($this->headersFor($juryToken))->postJson('/api/evaluation-grids', [
            'name' => 'Grille jury',
            'is_active' => true,
        ])->assertStatus(403);

        $this->withHeaders($this->headersFor($juryToken))
            ->patchJson("/api/evaluation-grids/{$gridId}", ['name' => 'Renommée'])
            ->assertStatus(403);

        $this->withHeaders($this->headersFor($juryToken))
            ->deleteJson("/api/evaluation-grids/{$gridId}")
            ->assertStatus(403);
    }

    public function test_admin_can_create_update_and_delete_grid_and_criterion(): void
    {
        $adminToken = $this->tokenFor('admin_scolarite');
        $gridId = $this->createGrid($adminToken);
        $criterionId = $this->createCriterion($adminToken, $gridId);

        $this->withHeaders($this->headersFor($adminToken))
            ->patchJson("/api/evaluation-grids/{$gridId}", ['name' => 'Grille revue'])
            ->assertStatus(200);
        $this->assertDatabaseHas('evaluation_grids', ['id' => $gridId, 'name' => 'Grille revue']);

        $this->withHeaders($this->headersFor($adminToken))
            ->patchJson("/api/evaluation-grids/{$gridId}/criteria/{$criterionId}", ['name' => 'Clarté'])
            ->assertStatus(200);
        $this->assertDatabaseHas('evaluation_criteria', ['id' => $criterionId, 'name' => 'Clarté']);

        $this->withHeaders($this->headersFor($adminToken))
            ->deleteJson("/api/evaluation-grids/{$gridId}/criteria/{$criterionId}")
            ->assertStatus(204);
        $this->assertDatabaseMissing('evaluation_criteria', ['id' => $criterionId]);

        $this->withHeaders($this->headersFor($adminToken))
            ->deleteJson("/api/evaluation-grids/{$gridId}")
            ->assertStatus(204);
        $this->assertDatabaseMissing('evaluation_grids', ['id' => $gridId]);
    }

    public function test_updating_a_criterion_of_another_grid_returns_404(): void
    {
        $adminToken = $this->tokenFor('admin_scolarite');
        $firstGridId = $this->createGrid($adminToken, 'Grille A');
        $secondGridId = $this->createGrid($adminToken, 'Grille B');
        $criterionId = $this->createCriterion($adminToken, $firstGridId);

        $this->withHeaders($this->headersFor($adminToken))
            ->patchJson("/api/evaluation-grids/{$secondGridId}/criteria/{$criterionId}", ['name' => 'Invalide'])
            ->assertStatus(404);
    }

    public function test_scored_criterion_keeps_its_scale_but_can_be_renamed(): void
    {
        $adminToken = $this->tokenFor('admin_scolarite');
        $jury = User::factory()->create();
        $jury->assignRole('rapporteur');
        $gridId = $this->createGrid($adminToken);
        $criterionId = $this->createCriterion($adminToken, $gridId);
        $this->createScoredEvaluation($gridId, $criterionId, $jury);

        $this->withHeaders($this->headersFor($adminToken))
            ->patchJson("/api/evaluation-grids/{$gridId}/criteria/{$criterionId}", ['name' => 'Clarté revised'])
            ->assertStatus(200);

        $this->withHeaders($this->headersFor($adminToken))
            ->patchJson("/api/evaluation-grids/{$gridId}/criteria/{$criterionId}", ['max_score' => 20])
            ->assertStatus(409);

        $this->withHeaders($this->headersFor($adminToken))
            ->patchJson("/api/evaluation-grids/{$gridId}/criteria/{$criterionId}", ['coefficient' => 3])
            ->assertStatus(409);

        $this->assertDatabaseHas('evaluation_criteria', ['id' => $criterionId, 'name' => 'Clarté revised']);
        $this->assertDatabaseHas('evaluation_scores', ['defense_evaluation_id' => DefenseEvaluation::first()->id, 'score' => 8]);
    }

    public function test_jury_can_record_and_validate_scores_but_cannot_edit_afterwards(): void
    {
        $adminToken = $this->tokenFor('admin_scolarite');
        $juryToken = $this->tokenFor('rapporteur');
        $gridId = $this->createGrid($adminToken);
        $criterionId = $this->createCriterion($adminToken, $gridId);

        EvaluationGridAssignment::create([
            'defense_id' => self::DEFENSE_ID,
            'evaluation_grid_id' => $gridId,
        ]);
        // Reset auth guard after admin action so jury requests
        // don't retain the admin identity
        $this->app['auth']->forgetGuards();

        $scores = [
            'comment' => 'Bonne prestation.',
            'scores' => [['criterion_id' => $criterionId, 'score' => 8.5]],
        ];

        $created = $this->withHeaders($this->headersFor($juryToken))
            ->postJson('/api/evaluation-defenses/' . self::DEFENSE_ID . '/scores', $scores);
        // Debug: output 422 response details
        if ($created->status() === 422) {
            $body = $created->json();
            \Illuminate\Support\Facades\Log::info('422_DEBUG', [
                'status' => $created->status(),
                'body' => $body,
                'defense_id' => self::DEFENSE_ID,
                'grid_id' => $gridId,
                'criterion_id' => $criterionId,
            ]);
            // Check grid status
            $grid = \App\Modules\Evaluation\Models\EvaluationGrid::find($gridId);
            if ($grid) {
                \Illuminate\Support\Facades\Log::info('422_GRID_STATUS', [
                    'grid_id' => $gridId,
                    'is_active' => $grid->is_active,
                ]);
            }
            // Check assignment
            $assignment = \App\Modules\Evaluation\Models\EvaluationGridAssignment::where('defense_id', self::DEFENSE_ID)->first();
            if ($assignment) {
                \Illuminate\Support\Facades\Log::info('422_ASSIGNMENT', [
                    'assignment_id' => $assignment->id,
                    'grid_id' => $assignment->evaluation_grid_id,
                    'grid_is_active' => $assignment->grid ? $assignment->grid->is_active : 'null',
                ]);
            }
        }
        $created->assertStatus(201);
        $evaluationId = (int) $created->json('id');

        $this->withHeaders($this->headersFor($juryToken))
            ->postJson("/api/evaluations/{$evaluationId}/validate")
            ->assertStatus(200)
            ->assertJsonPath('status', 'validated');

        $this->withHeaders($this->headersFor($juryToken))
            ->patchJson("/api/evaluations/{$evaluationId}/scores", $scores)
            ->assertStatus(422);

        $this->assertDatabaseHas('defense_evaluations', [
            'id' => $evaluationId,
            'status' => 'validated',
        ]);
    }

    public function test_only_an_admin_can_lock_a_validated_evaluation(): void
    {
        $adminToken = $this->tokenFor('admin_scolarite');
        $jury = User::factory()->create();
        $jury->assignRole('rapporteur');
        $juryToken = $jury->createToken('test_token')->plainTextToken;
        $gridId = $this->createGrid($adminToken);
        $criterionId = $this->createCriterion($adminToken, $gridId);
        $evaluation = $this->createScoredEvaluation($gridId, $criterionId, $jury);

        $evaluation->update(['status' => 'validated', 'validated_at' => now()]);
        // Reset auth guard after admin action so jury lock request
        // doesn't retain admin identity
        $this->app['auth']->forgetGuards();

        $this->withHeaders($this->headersFor($juryToken))
            ->postJson('/api/evaluations/' . $evaluation->id . '/lock')
            ->assertStatus(403);

        $this->withHeaders($this->headersFor($adminToken))
            ->postJson('/api/evaluations/' . $evaluation->id . '/lock')
            ->assertStatus(200)
            ->assertJsonPath('status', 'locked');
    }

    public function test_grid_cannot_be_replaced_once_an_evaluation_started(): void
    {
        $adminToken = $this->tokenFor('admin_scolarite');
        $jury = User::factory()->create();
        $jury->assignRole('rapporteur');
        $firstGridId = $this->createGrid($adminToken, 'Grille A');
        $secondGridId = $this->createGrid($adminToken, 'Grille B');
        $criterionId = $this->createCriterion($adminToken, $firstGridId);
        $this->createScoredEvaluation($firstGridId, $criterionId, $jury);

        $this->withHeaders($this->headersFor($adminToken))
            ->putJson('/api/evaluation-defenses/' . self::DEFENSE_ID . '/grid', [
                'evaluation_grid_id' => $secondGridId,
            ])
            ->assertStatus(409);
    }
}
