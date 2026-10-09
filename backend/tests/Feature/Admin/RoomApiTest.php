<?php

namespace Tests\Feature\Admin;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_unauthenticated_user_cannot_access_rooms()
    {
        $response = $this->getJson('/api/v1/admin/rooms');

        $response->assertStatus(401);
    }

    public function test_non_admin_user_cannot_access_rooms()
    {
        $user = User::factory()->create();
        $user->assignRole('etudiant');
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/admin/rooms');

        $response->assertStatus(403);
    }

    public function test_admin_can_list_rooms()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin_scolarite');
        $token = $admin->createToken('test_token')->plainTextToken;

        Room::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/admin/rooms');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'building', 'location', 'capacity', 'is_active']
                ]
            ]);
    }

    public function test_admin_can_create_room()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin_scolarite');
        $token = $admin->createToken('test_token')->plainTextToken;

        $roomData = [
            'name' => 'Salle Test',
            'building' => 'Bâtiment Test',
            'location' => 'Aile nord',
            'capacity' => 40,
            'is_active' => true,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/admin/rooms', $roomData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Salle créée avec succès.',
            ]);

        $this->assertDatabaseHas('rooms', ['name' => 'Salle Test', 'location' => 'Aile nord']);
    }

    public function test_admin_can_show_room()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin_scolarite');
        $token = $admin->createToken('test_token')->plainTextToken;

        $room = Room::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/admin/rooms/' . $room->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Détails de la salle récupérés avec succès.',
            ]);
    }

    public function test_admin_can_update_room()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin_scolarite');
        $token = $admin->createToken('test_token')->plainTextToken;

        $room = Room::factory()->create(['name' => 'Ancien Nom']);

        $updateData = [
            'name' => 'Nouveau Nom',
            'building' => 'Nouveau Bâtiment',
            'location' => 'Aile sud',
            'capacity' => 50,
            'is_active' => true,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/v1/admin/rooms/' . $room->id, $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Salle mise à jour avec succès.',
            ]);

        $this->assertDatabaseHas('rooms', ['name' => 'Nouveau Nom', 'location' => 'Aile sud']);
    }

    public function test_admin_can_delete_room()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin_scolarite');
        $token = $admin->createToken('test_token')->plainTextToken;

        $room = Room::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson('/api/v1/admin/rooms/' . $room->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Salle supprimée avec succès.',
            ]);

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }
}
