<?php

namespace Tests\Feature\Planification;

use App\Models\AffectationJury;
use App\Models\Indisponibilite;

class ValidationPlanningTest extends PlanificationTestCase
{
    public function test_valider_marque_la_soutenance_comme_validee(): void
    {
        $admin = $this->enAdmin();
        $s = $this->creerSoutenance();

        $this->postJson('/api/planning/valider')
            ->assertOk()
            ->assertJsonPath('validees', 1)
            ->assertJsonPath('ignorees', []);

        $s->refresh();
        $this->assertNotNull($s->valide_le);
        $this->assertSame($admin->id, (int) $s->valide_par);
    }

    public function test_le_president_de_mention_peut_valider(): void
    {
        $this->enAdmin('president_mention');
        $this->creerSoutenance();

        $this->postJson('/api/planning/valider')->assertOk()->assertJsonPath('validees', 1);
    }

    public function test_une_soutenance_au_jury_incomplet_est_ignoree(): void
    {
        $this->enAdmin();
        $s = $this->creerSoutenance(jury: [$this->creerEnseignant(), $this->creerEnseignant()]);

        $this->postJson('/api/planning/valider')
            ->assertOk()
            ->assertJsonPath('validees', 0)
            ->assertJsonPath('ignorees.0.id', $s->id)
            ->assertJsonPath('ignorees.0.raison', 'jury incomplet');

        $this->assertNull($s->fresh()->valide_le);
    }

    public function test_deux_soutenances_en_conflit_de_salle_ne_sont_pas_validees(): void
    {
        $this->enAdmin();
        $salle = $this->creerSalle();
        $a = $this->creerSoutenance($this->lundi()->setTime(9, 0), $salle);
        $b = $this->creerSoutenance($this->lundi()->setTime(9, 0), $salle); // meme salle, meme creneau

        $reponse = $this->postJson('/api/planning/valider')->assertOk()->assertJsonPath('validees', 0);

        $this->assertCount(2, $reponse->json('ignorees'));
        $this->assertStringStartsWith('conflit', $reponse->json('ignorees.0.raison'));
        $this->assertNull($a->fresh()->valide_le);
        $this->assertNull($b->fresh()->valide_le);
    }

    public function test_un_enseignant_indisponible_empeche_la_validation(): void
    {
        $this->enAdmin();
        $jury = [$this->creerEnseignant(), $this->creerEnseignant(), $this->creerEnseignant()];
        $s = $this->creerSoutenance($this->lundi()->setTime(9, 0), null, $jury);

        Indisponibilite::create([
            'enseignant_id' => $jury[1]->id,
            'date'          => $this->lundi()->format('Y-m-d'),
            'heure_debut'   => '08:00:00',
            'heure_fin'     => '12:00:00',
        ]);

        $reponse = $this->postJson('/api/planning/valider')->assertOk()->assertJsonPath('validees', 0);
        $this->assertStringContainsString('indisponible', $reponse->json('ignorees.0.raison'));
        $this->assertNull($s->fresh()->valide_le);
    }

    public function test_modifier_le_creneau_annule_la_validation(): void
    {
        $s = $this->creerSoutenance(valide: true);
        $this->assertNotNull($s->valide_le);

        $s->update([
            'date_debut' => $s->date_debut->copy()->addHour(),
            'date_fin'   => $s->date_fin->copy()->addHour(),
        ]);

        $this->assertNull($s->fresh()->valide_le);
        $this->assertNull($s->fresh()->valide_par);
    }

    public function test_changer_de_salle_annule_la_validation(): void
    {
        $s = $this->creerSoutenance(valide: true);

        $s->update(['salle_id' => $this->creerSalle('Salle B')->id]);

        $this->assertNull($s->fresh()->valide_le);
    }

    public function test_retirer_un_membre_du_jury_annule_la_validation(): void
    {
        $s = $this->creerSoutenance(valide: true);
        $this->assertNotNull($s->valide_le);

        AffectationJury::where('soutenance_id', $s->id)->first()->delete();

        $this->assertNull($s->fresh()->valide_le);
    }

    public function test_le_statut_de_validation_compte_planifiees_validees_et_a_valider(): void
    {
        $this->enAdmin();
        $this->creerSoutenance($this->lundi()->setTime(9, 0), null, null, true);
        $this->creerSoutenance($this->lundi()->setTime(10, 0), null, null, true);
        $this->creerSoutenance($this->lundi()->setTime(11, 0));

        $this->getJson('/api/planning/validation')
            ->assertOk()
            ->assertJsonPath('planifiees', 3)
            ->assertJsonPath('validees', 2)
            ->assertJsonPath('a_valider', 1);
    }
}
