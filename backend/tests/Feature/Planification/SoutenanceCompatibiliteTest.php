<?php

namespace Tests\Feature\Planification;

use App\Models\Depot;
use App\Models\Soutenance;

/**
 * Pont de compatibilite : les modules Etudiant / Evaluation / PV utilisent encore
 * les anciens noms (status, date, room_id, room). Ils doivent lire et ecrire la meme donnee
 * que le module Planification (statut, date_debut, salle_id).
 */
class SoutenanceCompatibiliteTest extends PlanificationTestCase
{
    public function test_les_anciens_noms_lisent_les_nouvelles_colonnes(): void
    {
        $s = $this->creerSoutenance($this->lundi()->setTime(9, 0));

        $this->assertSame('planifiee', $s->status);
        $this->assertTrue($s->date->equalTo($s->date_debut));
        $this->assertSame($s->salle_id, $s->room_id);
        $this->assertSame('Salle A', $s->room->name);
        $this->assertNull($s->sessionSoutenance);
    }

    public function test_ecrire_un_ancien_nom_met_a_jour_la_nouvelle_colonne(): void
    {
        $s = $this->creerSoutenance();

        $s->status = 'terminee';
        $s->save();

        $this->assertSame('terminee', $s->fresh()->statut);
    }

    public function test_une_creation_a_lancienne_mode_est_complete_automatiquement(): void
    {
        $etudiant = $this->creerEtudiant();
        $salle = $this->creerSalle();
        $depot = Depot::create([
            'etudiant_id' => $etudiant->id, 'promotion_id' => $etudiant->promotion_id, 'type' => 'memoire',
            'title' => 'M', 'file_path' => 'x.pdf', 'status' => 'valide', 'submitted_at' => now(), 'validated_at' => now(),
        ]);

        // Ancien code : seulement depot, date, room et status
        $s = Soutenance::create([
            'depot_id' => $depot->id,
            'date'     => $this->lundi()->setTime(10, 0),
            'room_id'  => $salle->id,
            'status'   => 'planifiee',
        ])->fresh();

        $this->assertSame($etudiant->id, (int) $s->etudiant_id);          // retrouve via le depot
        $this->assertSame($salle->id, (int) $s->salle_id);
        $this->assertSame('planifiee', $s->statut);
        $this->assertSame('10:00', $s->date_debut->format('H:i'));
        $this->assertSame('10:30', $s->date_fin->format('H:i'));          // duree standard de 30 min
    }

    public function test_changer_la_salle_par_lancien_nom_annule_la_validation(): void
    {
        $s = $this->creerSoutenance(valide: true);

        $s->update(['room_id' => $this->creerSalle('Salle B')->id]);

        $this->assertNull($s->fresh()->valide_le);
    }
}
