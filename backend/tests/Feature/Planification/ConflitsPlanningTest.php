<?php

namespace Tests\Feature\Planification;

use App\Models\Indisponibilite;
use App\Services\ConflitDetectionService;

class ConflitsPlanningTest extends PlanificationTestCase
{
    public function test_aucun_conflit_sur_un_planning_correct(): void
    {
        $a = $this->creerSoutenance($this->lundi()->setTime(9, 0));
        $b = $this->creerSoutenance($this->lundi()->setTime(9, 30));

        $service = app(ConflitDetectionService::class);
        $this->assertSame([], $service->conflitsPour($a->load('affectationsJury')));
        $this->assertSame([], $service->conflitsPour($b->load('affectationsJury')));
    }

    public function test_conflit_de_salle_detecte(): void
    {
        $salle = $this->creerSalle();
        $a = $this->creerSoutenance($this->lundi()->setTime(9, 0), $salle);
        $this->creerSoutenance($this->lundi()->setTime(9, 15), $salle); // chevauche a

        $raisons = app(ConflitDetectionService::class)->conflitsPour($a->load('affectationsJury'));

        $this->assertContains('salle deja occupee sur ce creneau', $raisons);
    }

    public function test_conflit_de_jury_detecte(): void
    {
        $commun = $this->creerEnseignant();
        $a = $this->creerSoutenance($this->lundi()->setTime(9, 0), $this->creerSalle('A'), [$commun, $this->creerEnseignant(), $this->creerEnseignant()]);
        $this->creerSoutenance($this->lundi()->setTime(9, 0), $this->creerSalle('B'), [$commun, $this->creerEnseignant(), $this->creerEnseignant()]);

        $raisons = app(ConflitDetectionService::class)->conflitsPour($a->load('affectationsJury'));

        $this->assertNotEmpty(array_filter($raisons, fn ($r) => str_contains($r, 'deja affecte')));
    }

    public function test_deux_soutenances_consecutives_ne_sont_pas_en_conflit(): void
    {
        $salle = $this->creerSalle();
        $a = $this->creerSoutenance($this->lundi()->setTime(9, 0), $salle);   // 09:00-09:30
        $this->creerSoutenance($this->lundi()->setTime(9, 30), $salle);        // 09:30-10:00

        $this->assertSame([], app(ConflitDetectionService::class)->conflitsPour($a->load('affectationsJury')));
    }

    public function test_la_page_des_conflits_signale_une_indisponibilite(): void
    {
        $this->enAdmin();
        $jury = [$this->creerEnseignant(), $this->creerEnseignant(), $this->creerEnseignant()];
        $s = $this->creerSoutenance($this->lundi()->setTime(9, 0), null, $jury);
        Indisponibilite::create([
            'enseignant_id' => $jury[0]->id,
            'date'          => $this->lundi()->format('Y-m-d'),
            'heure_debut'   => '09:00:00',
            'heure_fin'     => '10:00:00',
        ]);

        $conflits = $this->getJson('/api/planning/conflits')->assertOk()->json();

        $types = array_column($conflits, 'type');
        $this->assertContains('indisponibilite', $types);
        $this->assertSame($s->id, collect($conflits)->firstWhere('type', 'indisponibilite')['soutenance_a']);
    }

    public function test_la_page_des_conflits_signale_un_conflit_de_salle(): void
    {
        $this->enAdmin();
        $salle = $this->creerSalle();
        $this->creerSoutenance($this->lundi()->setTime(9, 0), $salle);
        $this->creerSoutenance($this->lundi()->setTime(9, 0), $salle);

        $types = array_column($this->getJson('/api/planning/conflits')->assertOk()->json(), 'type');

        $this->assertContains('salle', $types);
    }
}
