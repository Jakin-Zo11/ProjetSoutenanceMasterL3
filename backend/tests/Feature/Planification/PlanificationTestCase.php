<?php

namespace Tests\Feature\Planification;

use App\Models\AffectationJury;
use App\Models\Depot;
use App\Models\Formation;
use App\Models\ParametrePlanification;
use App\Models\Promotion;
use App\Models\Room;
use App\Models\Soutenance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Base commune des tests du module Planification & convocations.
 * Les tests tournent sur SQLite en memoire (voir phpunit.xml) : la base MySQL de developpement n'est jamais touchee.
 */
abstract class PlanificationTestCase extends TestCase
{
    use RefreshDatabase;

    private int $compteur = 0;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin_scolarite', 'president_mention', 'enseignant', 'etudiant'] as $role) {
            Role::findOrCreate($role, 'api');
        }

        // Journee a 08:30, creneaux de 30 min (valeurs par defaut du projet)
        ParametrePlanification::actuel()->forceFill([
            'heure_debut_journee' => '08:30:00',
            'heure_fin_journee'   => '17:00:00',
            'duree_minutes'       => 30,
        ])->save();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    // ---------- Utilisateurs ----------

    protected function creerAdmin(string $role = 'admin_scolarite'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    protected function creerEnseignant(): User
    {
        $user = User::factory()->create();
        $user->assignRole('enseignant');

        return $user;
    }

    protected function creerEtudiant(): User
    {
        $formation = Formation::firstOrCreate(['code' => 'TEST'], ['name' => 'Formation de test']);
        $promotion = Promotion::firstOrCreate(
            ['formation_id' => $formation->id, 'year' => '2026'],
            ['name' => 'Promotion de test']
        );

        $user = User::factory()->create([
            'matricule'    => 'M' . (++$this->compteur) . uniqid(),
            'status'       => 'actif',
            'promotion_id' => $promotion->id,
        ]);
        $user->assignRole('etudiant');

        return $user;
    }

    // ---------- Donnees de planning ----------

    protected function creerSalle(string $nom = 'Salle A'): Room
    {
        return Room::firstOrCreate(
            ['name' => $nom],
            ['building' => 'Batiment test', 'capacity' => 30, 'is_active' => true]
        );
    }

    /** Un lundi futur (les creneaux passes ou de week-end ne sont jamais proposes). */
    protected function lundi(): Carbon
    {
        return Carbon::today()->next(Carbon::MONDAY)->addWeek()->startOfDay();
    }

    /**
     * Cree une soutenance planifiee avec son etudiant, son depot et un jury.
     *
     * @param Carbon|null $debut debut du creneau (30 min par defaut)
     * @param User[]|null $jury  membres du jury (3 enseignants crees par defaut ; [] = aucun)
     */
    protected function creerSoutenance(?Carbon $debut = null, ?Room $salle = null, ?array $jury = null, bool $valide = false, int $minutes = 30): Soutenance
    {
        $etudiant = $this->creerEtudiant();
        $debut = $debut ?? $this->lundi()->setTime(9, 0);
        $salle = $salle ?? $this->creerSalle();

        $depot = Depot::create([
            'etudiant_id'  => $etudiant->id,
            'promotion_id' => $etudiant->promotion_id,
            'type'         => 'memoire',
            'title'        => 'Memoire de ' . $etudiant->name,
            'file_path'    => 'memoires/test.pdf',
            'status'       => 'valide',
            'submitted_at' => now(),
            'validated_at' => now(),
        ]);

        $soutenance = Soutenance::create([
            'depot_id'    => $depot->id,
            'etudiant_id' => $etudiant->id,
            'salle_id'    => $salle->id,
            'theme'       => 'Theme ' . $etudiant->id,
            'date_debut'  => $debut,
            'date_fin'    => $debut->copy()->addMinutes($minutes),
            'statut'      => 'planifiee',
        ]);

        $membres = $jury ?? [$this->creerEnseignant(), $this->creerEnseignant(), $this->creerEnseignant()];
        foreach ($membres as $i => $enseignant) {
            AffectationJury::create([
                'soutenance_id' => $soutenance->id,
                'enseignant_id' => $enseignant->id,
                'role'          => ['president', 'rapporteur', 'examinateur'][$i % 3],
            ]);
        }

        if ($valide) {
            $this->valider($soutenance);
        }

        return $soutenance->fresh();
    }

    /** Valide une soutenance sans passer par l'API (le jury doit deja etre en place). */
    protected function valider(Soutenance $soutenance, ?User $par = null): void
    {
        Soutenance::whereKey($soutenance->id)->update([
            'valide_le'  => now(),
            'valide_par' => ($par ?? $this->creerAdmin())->id,
        ]);
    }

    protected function enAdmin(string $role = 'admin_scolarite'): User
    {
        $admin = $this->creerAdmin($role);
        $this->actingAs($admin, 'sanctum');

        return $admin;
    }
}
