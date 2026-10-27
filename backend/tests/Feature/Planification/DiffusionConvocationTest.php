<?php

namespace Tests\Feature\Planification;

use App\Models\Convocation;
use App\Models\StudentNotification;
use App\Notifications\ConvocationNotification;
use Carbon\Carbon;
use Illuminate\Contracts\Notifications\Dispatcher;
use Illuminate\Support\Facades\Notification;

class DiffusionConvocationTest extends PlanificationTestCase
{
    public function test_la_diffusion_previent_letudiant_et_les_trois_jurys(): void
    {
        Notification::fake();
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")
            ->assertOk()
            ->assertJsonPath('deja_diffusee', false)
            ->assertJsonPath('destinataires', 4)
            ->assertJsonPath('notifications', 1)
            ->assertJsonPath('mails_envoyes', 4)
            ->assertJsonPath('erreurs', []);

        Notification::assertSentTo($s->etudiant, ConvocationNotification::class);
        foreach ($s->affectationsJury as $a) {
            Notification::assertSentTo($a->enseignant, ConvocationNotification::class);
        }
        Notification::assertCount(4);
    }

    public function test_letudiant_recoit_une_notification_dans_son_espace(): void
    {
        Notification::fake();
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")->assertOk();

        $notif = StudentNotification::where('user_id', $s->etudiant_id)->where('type', 'convocation')->first();
        $this->assertNotNull($notif);
        $this->assertStringContainsString($s->date_debut->format('d/m/Y'), $notif->message);
        $this->assertStringContainsString('Salle A', $notif->message);
    }

    public function test_la_diffusion_est_enregistree(): void
    {
        Notification::fake();
        $admin = $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")->assertOk();

        $convocation = Convocation::where('soutenance_id', $s->id)->first();
        $this->assertNotNull($convocation->diffusee_le);
        $this->assertSame($admin->id, (int) $convocation->diffusee_par);
    }

    public function test_une_deuxieme_diffusion_nenvoie_rien(): void
    {
        Notification::fake();
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")->assertOk();
        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")
            ->assertOk()
            ->assertJsonPath('deja_diffusee', true)
            ->assertJsonPath('mails_envoyes', 0);

        Notification::assertCount(4); // les 4 du premier envoi seulement
    }

    public function test_renvoyer_force_un_nouvel_envoi(): void
    {
        Notification::fake();
        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")->assertOk();
        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser?renvoyer=1")
            ->assertOk()
            ->assertJsonPath('deja_diffusee', false)
            ->assertJsonPath('mails_envoyes', 4);

        Notification::assertCount(8);
    }

    public function test_pas_de_diffusion_si_le_planning_nest_pas_valide(): void
    {
        Notification::fake();
        $this->enAdmin();
        $s = $this->creerSoutenance();

        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        Notification::assertNothingSent();
        $this->assertSame(0, StudentNotification::where('type', 'convocation')->count());
    }

    public function test_diffuser_tout_traite_les_soutenances_validees_une_seule_fois(): void
    {
        Notification::fake();
        $this->enAdmin();
        $this->creerSoutenance($this->lundi()->setTime(9, 0), null, null, true);
        $this->creerSoutenance($this->lundi()->setTime(10, 0), null, null, true);
        $this->creerSoutenance($this->lundi()->setTime(11, 0)); // non validee : ignoree

        $this->postJson('/api/planning/convocations/diffuser')
            ->assertOk()
            ->assertJsonPath('soutenances', 2)
            ->assertJsonPath('mails_envoyes', 8)
            ->assertJsonPath('notifications', 2);

        $this->postJson('/api/planning/convocations/diffuser')
            ->assertOk()
            ->assertJsonPath('soutenances', 0)
            ->assertJsonPath('deja_diffusees', 2);
    }

    public function test_le_statut_compte_les_convocations_diffusees_et_a_diffuser(): void
    {
        Notification::fake();
        $this->enAdmin();
        $a = $this->creerSoutenance($this->lundi()->setTime(9, 0), null, null, true);
        $this->creerSoutenance($this->lundi()->setTime(10, 0), null, null, true);

        $this->getJson('/api/planning/validation')->assertJsonPath('diffusees', 0)->assertJsonPath('a_diffuser', 2);

        $this->postJson("/api/soutenances/{$a->id}/convocation/diffuser")->assertOk();

        $this->getJson('/api/planning/validation')->assertJsonPath('diffusees', 1)->assertJsonPath('a_diffuser', 1);
    }

    public function test_apres_replanification_la_convocation_est_a_rediffuser(): void
    {
        Notification::fake();
        $this->enAdmin();

        Carbon::setTestNow(Carbon::parse('2026-12-01 10:00:00'));
        $s = $this->creerSoutenance(valide: true);
        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")->assertOk();
        $this->getJson('/api/planning/validation')->assertJsonPath('a_diffuser', 0);

        // Replanification puis revalidation, plus tard
        Carbon::setTestNow(Carbon::parse('2026-12-01 11:00:00'));
        $s->update([
            'date_debut' => $this->lundi()->addDay()->setTime(14, 0),
            'date_fin'   => $this->lundi()->addDay()->setTime(14, 30),
        ]);
        $this->postJson('/api/planning/valider')->assertOk()->assertJsonPath('validees', 1);

        $this->getJson('/api/planning/validation')->assertJsonPath('a_diffuser', 1);

        $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")
            ->assertOk()
            ->assertJsonPath('deja_diffusee', false)
            ->assertJsonPath('mails_envoyes', 4);

        // L'etudiant a recu une nouvelle notification (le contenu a change)
        $this->assertSame(2, StudentNotification::where('user_id', $s->etudiant_id)->where('type', 'convocation')->count());
    }

    public function test_une_panne_de_mail_ne_bloque_pas_la_diffusion(): void
    {
        // Simule un serveur mail injoignable : chaque envoi leve une exception
        $this->app->instance(Dispatcher::class, new class implements Dispatcher {
            public function send($notifiables, $notification)
            {
                throw new \RuntimeException('serveur mail injoignable');
            }

            public function sendNow($notifiables, $notification, ?array $channels = null)
            {
                throw new \RuntimeException('serveur mail injoignable');
            }
        });

        $this->enAdmin();
        $s = $this->creerSoutenance(valide: true);

        $reponse = $this->postJson("/api/soutenances/{$s->id}/convocation/diffuser")
            ->assertOk()
            ->assertJsonPath('mails_envoyes', 0)
            ->assertJsonPath('notifications', 1);

        $this->assertNotEmpty($reponse->json('erreurs'));
        // L'etudiant a quand meme sa notification et la convocation est marquee diffusee
        $this->assertSame(1, StudentNotification::where('user_id', $s->etudiant_id)->where('type', 'convocation')->count());
        $this->assertNotNull(Convocation::where('soutenance_id', $s->id)->value('diffusee_le'));
    }
}
