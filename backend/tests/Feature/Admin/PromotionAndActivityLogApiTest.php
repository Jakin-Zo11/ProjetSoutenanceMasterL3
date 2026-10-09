<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionAndActivityLogApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_admin_can_create_a_promotion_with_mention(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin_scolarite');
        $token = $admin->createToken('test_token')->plainTextToken;
        $formation = Formation::create([
            'code' => 'IG',
            'name' => 'Informatique Générale',
            'description' => null,
        ]);

        $response = $this->withToken($token)->postJson('/api/v1/admin/promotions', [
            'formation_id' => $formation->id,
            'year' => '2025-2026',
            'name' => 'Promotion 15',
            'mention' => 'Informatique',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Promotion 15')
            ->assertJsonPath('data.mention', 'Informatique');
        $this->assertDatabaseHas('promotions', [
            'name' => 'Promotion 15',
            'mention' => 'Informatique',
        ]);
    }

    public function test_activity_logs_are_available_only_to_authenticated_admins(): void
    {
        $this->getJson('/api/logs')->assertUnauthorized();
        $this->getJson('/api/v1/admin/logs')->assertUnauthorized();

        $admin = User::factory()->create();
        $admin->assignRole('admin_scolarite');
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'room.created',
            'description' => 'Salle 101 créée.',
        ]);
        $token = $admin->createToken('test_token')->plainTextToken;

        $this->withToken($token)->getJson('/api/logs')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.action', 'room.created');
    }
}
