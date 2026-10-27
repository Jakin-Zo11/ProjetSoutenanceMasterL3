<?php

namespace Tests\Feature\Planification;

/**
 * L'espace etudiant (application mobile) doit lire le planning du module Planification
 * et ne montrer une soutenance qu'une fois le planning valide.
 * Avant correction, ces appels renvoyaient une erreur 500 (relation "room" introuvable).
 */
class EspaceEtudiantConvocationTest extends PlanificationTestCase
{
    public function test_un_etudiant_sans_soutenance_na_pas_de_convocation(): void
    {
        $this->actingAs($this->creerEtudiant(), 'sanctum');

        $this->getJson('/api/v1/student/convocation')->assertOk()->assertJsonPath('data', null);
    }

    public function test_un_planning_non_valide_nest_pas_visible_par_letudiant(): void
    {
        $s = $this->creerSoutenance();
        $this->actingAs($s->etudiant, 'sanctum');

        $this->getJson('/api/v1/student/convocation')->assertOk()->assertJsonPath('data', null);
        $this->getJson('/api/v1/student/defense')->assertOk()->assertJsonPath('data', null);
        $this->getJson('/api/v1/student/status')->assertOk()->assertJsonPath('data.defenseScheduled', false);
    }

    public function test_un_planning_valide_apparait_dans_la_convocation_de_letudiant(): void
    {
        $s = $this->creerSoutenance($this->lundi()->setTime(8, 30), null, null, true);
        $this->actingAs($s->etudiant, 'sanctum');

        $this->getJson('/api/v1/student/convocation')
            ->assertOk()
            ->assertJsonPath('data.id', $s->id)
            ->assertJsonPath('data.title', $s->depot->title)
            ->assertJsonPath('data.time', '08:30')
            ->assertJsonPath('data.room.name', 'Salle A');

        $this->getJson('/api/v1/student/status')->assertOk()->assertJsonPath('data.defenseScheduled', true);
    }

    public function test_lecran_defense_affiche_la_soutenance_validee(): void
    {
        $s = $this->creerSoutenance($this->lundi()->setTime(9, 0), null, null, true);
        $this->actingAs($s->etudiant, 'sanctum');

        $this->getJson('/api/v1/student/defense')
            ->assertOk()
            ->assertJsonPath('data.date', $this->lundi()->format('Y-m-d'));
    }

    public function test_une_soutenance_annulee_na_pas_de_convocation(): void
    {
        $s = $this->creerSoutenance(valide: true);
        $s->update(['statut' => 'annulee']);
        $this->actingAs($s->etudiant, 'sanctum');

        $this->getJson('/api/v1/student/convocation')->assertOk()->assertJsonPath('data', null);
    }

    public function test_un_etudiant_ne_voit_jamais_la_soutenance_dun_autre(): void
    {
        $autre = $this->creerSoutenance(valide: true);
        $moi = $this->creerEtudiant();
        $this->actingAs($moi, 'sanctum');

        $this->getJson('/api/v1/student/convocation')->assertOk()->assertJsonPath('data', null);
        $this->assertNotSame($moi->id, $autre->etudiant_id);
    }

    public function test_les_ecrans_resultat_pv_et_documents_ne_plantent_plus(): void
    {
        $s = $this->creerSoutenance(valide: true);
        $this->actingAs($s->etudiant, 'sanctum');

        foreach (['status', 'defense', 'result', 'pv', 'documents', 'convocation'] as $ecran) {
            $this->getJson("/api/v1/student/{$ecran}")->assertOk();
        }
    }
}
