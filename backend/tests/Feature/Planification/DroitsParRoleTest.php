<?php

namespace Tests\Feature\Planification;

use App\Models\Indisponibilite;

class DroitsParRoleTest extends PlanificationTestCase
{
    /** Routes de gestion du planning : [methode, url avec {id} = soutenance]. */
    public static function routesDeGestion(): array
    {
        return [
            'planning'            => ['GET', '/api/planning'],
            'conflits'            => ['GET', '/api/planning/conflits'],
            'statut validation'   => ['GET', '/api/planning/validation'],
            'valider'             => ['POST', '/api/planning/valider'],
            'parametres (lire)'   => ['GET', '/api/planning/parametres'],
            'parametres (ecrire)' => ['PUT', '/api/planning/parametres'],
            'planifier'           => ['POST', '/api/soutenances/{id}/planifier'],
            'replanifier'         => ['POST', '/api/soutenances/{id}/replanifier'],
            'jurys (lire)'        => ['GET', '/api/soutenances/{id}/jurys'],
            'jurys (affecter)'    => ['POST', '/api/soutenances/{id}/jurys'],
            'convocation'         => ['GET', '/api/soutenances/{id}/convocation'],
            'diffuser une'        => ['POST', '/api/soutenances/{id}/convocation/diffuser'],
            'diffuser tout'       => ['POST', '/api/planning/convocations/diffuser'],
            'optimiser'           => ['POST', '/api/planning/optimiser'],
        ];
    }

    /** @dataProvider routesDeGestion */
    public function test_un_etudiant_ne_peut_pas_gerer_le_planning(string $methode, string $url): void
    {
        $s = $this->creerSoutenance(valide: true);
        $this->actingAs($this->creerEtudiant(), 'sanctum');

        $this->json($methode, str_replace('{id}', (string) $s->id, $url))->assertForbidden();
    }

    /** @dataProvider routesDeGestion */
    public function test_un_enseignant_ne_peut_pas_gerer_le_planning(string $methode, string $url): void
    {
        $s = $this->creerSoutenance(valide: true);
        $this->actingAs($this->creerEnseignant(), 'sanctum');

        $this->json($methode, str_replace('{id}', (string) $s->id, $url))->assertForbidden();
    }

    /** @dataProvider routesDeGestion */
    public function test_un_visiteur_non_connecte_est_refuse(string $methode, string $url): void
    {
        $s = $this->creerSoutenance(valide: true);

        $this->json($methode, str_replace('{id}', (string) $s->id, $url))->assertUnauthorized();
    }

    public function test_ladministration_et_le_president_accedent_au_planning(): void
    {
        foreach (['admin_scolarite', 'president_mention'] as $role) {
            $this->actingAs($this->creerAdmin($role), 'sanctum');
            $this->getJson('/api/planning')->assertOk();
            $this->getJson('/api/planning/validation')->assertOk();
        }
    }

    // ---------- Indisponibilites ----------

    private function plage(int $enseignantId, string $date = '2027-02-01'): array
    {
        return ['enseignant_id' => $enseignantId, 'date' => $date, 'heure_debut' => '08:00', 'heure_fin' => '10:00', 'motif' => 'Conference'];
    }

    public function test_un_enseignant_gere_ses_propres_indisponibilites(): void
    {
        $ens = $this->creerEnseignant();
        $this->actingAs($ens, 'sanctum');

        $id = $this->postJson('/api/indisponibilites', $this->plage($ens->id))->assertCreated()->json('data.id');
        $this->getJson("/api/enseignants/{$ens->id}/indisponibilites")->assertOk()->assertJsonCount(1);
        $this->deleteJson("/api/indisponibilites/{$id}")->assertOk();
        $this->getJson("/api/enseignants/{$ens->id}/indisponibilites")->assertOk()->assertJsonCount(0);
    }

    public function test_un_enseignant_ne_touche_pas_aux_indisponibilites_dun_collegue(): void
    {
        $moi = $this->creerEnseignant();
        $collegue = $this->creerEnseignant();
        $plage = Indisponibilite::create([
            'enseignant_id' => $collegue->id, 'date' => '2027-02-02', 'heure_debut' => '08:00:00', 'heure_fin' => '10:00:00',
        ]);
        $this->actingAs($moi, 'sanctum');

        $this->getJson("/api/enseignants/{$collegue->id}/indisponibilites")->assertForbidden();
        $this->postJson('/api/indisponibilites', $this->plage($collegue->id))->assertForbidden();
        $this->deleteJson("/api/indisponibilites/{$plage->id}")->assertForbidden();

        $this->assertDatabaseHas('indisponibilites', ['id' => $plage->id]);
    }

    public function test_ladministration_gere_les_indisponibilites_de_nimporte_quel_enseignant(): void
    {
        $ens = $this->creerEnseignant();
        $this->enAdmin();

        $id = $this->postJson('/api/indisponibilites', $this->plage($ens->id))->assertCreated()->json('data.id');
        $this->getJson("/api/enseignants/{$ens->id}/indisponibilites")->assertOk()->assertJsonCount(1);
        $this->deleteJson("/api/indisponibilites/{$id}")->assertOk();
    }

    public function test_un_etudiant_ne_peut_pas_declarer_dindisponibilite(): void
    {
        $ens = $this->creerEnseignant();
        $this->actingAs($this->creerEtudiant(), 'sanctum');

        $this->postJson('/api/indisponibilites', $this->plage($ens->id))->assertForbidden();
        $this->getJson("/api/enseignants/{$ens->id}/indisponibilites")->assertForbidden();
    }

    public function test_une_plage_pour_un_enseignant_inexistant_est_refusee(): void
    {
        $this->enAdmin();

        $this->postJson('/api/indisponibilites', $this->plage(999999))->assertStatus(422);
    }
}
