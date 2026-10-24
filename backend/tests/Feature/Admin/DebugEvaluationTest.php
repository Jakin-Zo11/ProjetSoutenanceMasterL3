<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugEvaluationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_debug_probe(): void
    {
        $info = [];

        try {
            $admin = User::factory()->create();
            $admin->assignRole('admin_scolarite');
            $adminToken = $admin->createToken('t')->plainTextToken;

            $jury = User::factory()->create();
            $jury->assignRole('rapporteur');
            $juryToken = $jury->createToken('t')->plainTextToken;

            $info['admin_id'] = $admin->id;
            $info['jury_id'] = $jury->id;

            // A : première requête de la fenêtre de test, utilisateur jury.
            $info['A_first_jury'] = $this->withHeaders(['Authorization' => 'Bearer ' . $juryToken])
                ->getJson('/api/v1/auth/me')->json('user.id');

            // B : requête suivante, en-tête administrateur explicite, WITH reset.
            $this->app['auth']->forgetGuards();
            $info['B_second_admin_no_reset'] = $this->withHeaders(['Authorization' => 'Bearer ' . $adminToken])
                ->getJson('/api/v1/auth/me')->json('user.id');

            // C : reset des gardes d'authentification puis en-tête jury.
            $this->app['auth']->forgetGuards();
            $info['C_after_forgetGuards_jury'] = $this->withHeaders(['Authorization' => 'Bearer ' . $juryToken])
                ->getJson('/api/v1/auth/me')->json('user.id');

            // D : reset puis administrateur.
            $this->app['auth']->forgetGuards();
            $info['D_after_forgetGuards_admin'] = $this->withHeaders(['Authorization' => 'Bearer ' . $adminToken])
                ->getJson('/api/v1/auth/me')->json('user.id');

            // E : contrôle que l'administrateur crée bien une grille APRES reset,
            //     et que le jury se voit refuser la même action.
            $this->app['auth']->forgetGuards();
            $info['E_grid_as_admin'] = $this->withHeaders(['Authorization' => 'Bearer ' . $adminToken])
                ->postJson('/api/evaluation-grids', ['name' => 'Grille debug', 'is_active' => true])->status();

            $this->app['auth']->forgetGuards();
            $info['F_grid_as_jury'] = $this->withHeaders(['Authorization' => 'Bearer ' . $juryToken])
                ->postJson('/api/evaluation-grids', ['name' => 'Grille jury', 'is_active' => true])->status();

            $this->app['auth']->forgetGuards();
            $this->flushHeaders();
            $info['G_rooms_as_guest'] = $this->getJson('/api/v1/admin/rooms')->status();
        } catch (\Throwable $e) {
            $info['EXCEPTION'] = $e->getMessage();
        }

        $this->fail(json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}
