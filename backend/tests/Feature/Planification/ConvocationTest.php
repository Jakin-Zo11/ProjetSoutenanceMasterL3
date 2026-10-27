<?php

namespace Tests\Feature\Planification;

use App\Models\Convocation;
use App\Services\ConvocationService;
use DomainException;

class ConvocationTest extends PlanificationTestCase
{
    public function test_pas_de_convocation_tant_que_le_planning_nest_pas_valide(): void
    {
        $this->enAdmin();
        $s = $this->creerSoutenance();

        $this->getJson("/api/soutenances/{$s->id}/convocation")
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertSame(0, Convocation::count());
    }

    public function test_le_service_refuse_une_soutenance_non_validee(): void
    {
        $s = $this->creerSoutenance();

        $this->expectException(DomainException::class);
        app(ConvocationService::class)->generer($s);
    }

    public function test_convocation_generee_apres_validation(): void
    {
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $reponse = $this->getJson("/api/soutenances/{$s->id}/convocation")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('diffusee', false);

        $contenu = $reponse->json('convocation.contenu');
        $this->assertStringContainsString($s->etudiant->name, $contenu);
        $this->assertStringContainsString('Salle A', $contenu);
        $this->assertStringContainsString($s->date_debut->format('d/m/Y'), $contenu);
        $this->assertStringContainsString($s->date_debut->format('H:i'), $contenu);
        $this->assertSame(1, Convocation::count());
    }

    public function test_la_convocation_liste_les_membres_du_jury(): void
    {
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $contenu = $this->getJson("/api/soutenances/{$s->id}/convocation")->json('convocation.contenu');

        foreach ($s->affectationsJury as $a) {
            $this->assertStringContainsString($a->enseignant->name, $contenu);
        }
    }

    public function test_lire_deux_fois_ne_cree_pas_deux_convocations(): void
    {
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $this->getJson("/api/soutenances/{$s->id}/convocation")->assertOk();
        $this->getJson("/api/soutenances/{$s->id}/convocation")->assertOk();

        $this->assertSame(1, Convocation::count());
    }

    public function test_la_convocation_est_regeneree_apres_replanification(): void
    {
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);
        $this->getJson("/api/soutenances/{$s->id}/convocation")->assertOk();

        // Replanification : la validation tombe, puis on revalide
        $s->update([
            'date_debut' => $this->lundi()->addDay()->setTime(14, 0),
            'date_fin'   => $this->lundi()->addDay()->setTime(14, 30),
        ]);
        $this->valider($s->fresh());

        $contenu = $this->getJson("/api/soutenances/{$s->id}/convocation")->assertOk()->json('convocation.contenu');

        $this->assertStringContainsString($this->lundi()->addDay()->format('d/m/Y'), $contenu);
        $this->assertStringContainsString('14:00', $contenu);
        $this->assertSame(1, Convocation::count());
    }

    public function test_apres_replanification_sans_revalidation_la_convocation_est_refusee(): void
    {
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);
        $this->getJson("/api/soutenances/{$s->id}/convocation")->assertOk();

        $s->update([
            'date_debut' => $this->lundi()->addDay()->setTime(14, 0),
            'date_fin'   => $this->lundi()->addDay()->setTime(14, 30),
        ]);

        $this->getJson("/api/soutenances/{$s->id}/convocation")->assertStatus(422);
    }
}
