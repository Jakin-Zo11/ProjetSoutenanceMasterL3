<?php

namespace Tests\Feature\Planification;

use App\Models\Indisponibilite;
use App\Models\Soutenance;
use App\Services\ConflitDetectionService;
use Carbon\Carbon;

class OptimisationPlanningTest extends PlanificationTestCase
{
    /** @var array<string, \App\Models\Soutenance> */
    private array $s = [];
    private array $ens = [];

    /**
     * Planning volontairement disperse : 5 jours, des trous, une soutenance deja validee le vendredi.
     * Le jury 4-5-6 est indisponible le lundi matin.
     */
    private function planningDisperse(): void
    {
        for ($i = 1; $i <= 6; $i++) {
            $this->ens[$i] = $this->creerEnseignant();
        }
        $A = $this->creerSalle('Salle A');
        $B = $this->creerSalle('Salle B');
        $jury = fn (array $n) => array_map(fn ($i) => $this->ens[$i], $n);
        $lundi = $this->lundi();

        $this->s['lun'] = $this->creerSoutenance($lundi->copy()->setTime(9, 0), $A, $jury([1, 2, 3]));
        $this->s['mar'] = $this->creerSoutenance($lundi->copy()->addDay()->setTime(14, 0), $A, $jury([1, 2, 3]));
        $this->s['mer'] = $this->creerSoutenance($lundi->copy()->addDays(2)->setTime(10, 0), $B, $jury([4, 5, 6]));
        $this->s['jeu'] = $this->creerSoutenance($lundi->copy()->addDays(3)->setTime(16, 0), $A, $jury([4, 5, 6]));
        $this->s['ven'] = $this->creerSoutenance($lundi->copy()->addDays(4)->setTime(8, 0), $B, $jury([1, 4, 5]), true, 60);

        Indisponibilite::create([
            'enseignant_id' => $this->ens[4]->id,
            'date'          => $lundi->format('Y-m-d'),
            'heure_debut'   => '08:00:00',
            'heure_fin'     => '12:00:00',
        ]);
    }

    private function nombreDeJours(): int
    {
        return Soutenance::get()->map(fn ($s) => $s->date_debut->format('Y-m-d'))->unique()->count();
    }

    public function test_une_proposition_ne_modifie_rien(): void
    {
        $this->planningDisperse();
        $this->enAdmin();
        $avant = Soutenance::orderBy('id')->get(['id', 'salle_id', 'date_debut', 'date_fin'])->toArray();

        $r = $this->postJson('/api/planning/optimiser', ['appliquer' => false])->assertOk();

        $this->assertFalse($r->json('appliquee'));
        $this->assertCount(4, $r->json('deplacements'));
        $this->assertLessThan($r->json('avant.jours'), $r->json('apres.jours'));
        $this->assertSame($avant, Soutenance::orderBy('id')->get(['id', 'salle_id', 'date_debut', 'date_fin'])->toArray());
    }

    public function test_lapplication_regroupe_les_soutenances_sur_moins_de_jours(): void
    {
        $this->planningDisperse();
        $this->enAdmin();
        $this->assertSame(5, $this->nombreDeJours());

        $r = $this->postJson('/api/planning/optimiser', ['appliquer' => true])->assertOk();

        $this->assertTrue($r->json('appliquee'));
        $this->assertSame(2, $this->nombreDeJours()); // le lundi + le vendredi (validee, figee)
        $this->assertSame(0, $r->json('apres.conflits'));
    }

    public function test_la_journee_commence_a_lheure_douverture_avec_des_creneaux_de_30_minutes(): void
    {
        $this->planningDisperse();
        $this->enAdmin();

        $this->postJson('/api/planning/optimiser', ['appliquer' => true])->assertOk();

        $mobiles = Soutenance::whereNull('valide_le')->orderBy('date_debut')->get();
        $this->assertSame('08:30', $mobiles->first()->date_debut->format('H:i'));
        foreach ($mobiles as $s) {
            $this->assertSame(30, $s->date_debut->diffInMinutes($s->date_fin), "soutenance #{$s->id}");
        }
    }

    public function test_une_soutenance_validee_ne_bouge_pas(): void
    {
        $this->planningDisperse();
        $this->enAdmin();
        $avant = $this->s['ven']->fresh();

        $r = $this->postJson('/api/planning/optimiser', ['appliquer' => true])->assertOk();

        $apres = $this->s['ven']->fresh();
        $this->assertSame(1, $r->json('figees'));
        $this->assertTrue($avant->date_debut->equalTo($apres->date_debut));
        $this->assertTrue($avant->date_fin->equalTo($apres->date_fin));
        $this->assertSame($avant->salle_id, $apres->salle_id);
        $this->assertNotNull($apres->valide_le);
    }

    public function test_aucun_conflit_apres_optimisation_et_les_indisponibilites_sont_respectees(): void
    {
        $this->planningDisperse();
        $this->enAdmin();

        $this->postJson('/api/planning/optimiser', ['appliquer' => true])->assertOk();

        $service = app(ConflitDetectionService::class);
        foreach (Soutenance::with('affectationsJury')->get() as $s) {
            $this->assertSame([], $service->conflitsPour($s), "soutenance #{$s->id}");
        }

        // Le jury 4-5-6 (indisponible lundi 08:00-12:00) ne passe pas le lundi matin
        foreach (['mer', 'jeu'] as $cle) {
            $debut = $this->s[$cle]->fresh()->date_debut;
            if ($debut->isSameDay($this->lundi())) {
                $this->assertGreaterThanOrEqual(12, $debut->hour, "soutenance {$cle}");
            }
        }
    }

    public function test_une_seconde_optimisation_ne_propose_plus_rien(): void
    {
        $this->planningDisperse();
        $this->enAdmin();
        $this->postJson('/api/planning/optimiser', ['appliquer' => true])->assertOk();

        $this->postJson('/api/planning/optimiser', ['appliquer' => false])
            ->assertOk()
            ->assertJsonCount(0, 'deplacements');
    }

    public function test_un_planning_vide_ne_provoque_pas_derreur(): void
    {
        $this->enAdmin();

        $this->postJson('/api/planning/optimiser')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(0, 'deplacements');
    }

    public function test_les_soutenances_deplacees_perdent_leur_validation_mais_pas_celles_qui_restent(): void
    {
        $this->planningDisperse();
        $this->enAdmin();

        $this->postJson('/api/planning/optimiser', ['appliquer' => true])->assertOk();

        $this->assertNotNull($this->s['ven']->fresh()->valide_le);
        $this->assertSame(1, Soutenance::whereNotNull('valide_le')->count());
    }
}
