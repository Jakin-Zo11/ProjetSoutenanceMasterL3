<?php

namespace App\Services;

use App\Models\Indisponibilite;
use App\Models\ParametrePlanification;
use App\Models\Room;
use App\Models\Soutenance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Optimise un planning EXISTANT (cas d'utilisation "Optimiser le planning") :
 * on cherche a deplacer des soutenances deja planifiees pour
 *   1. utiliser le moins de jours possible,
 *   2. supprimer les "trous" dans une journee,
 *   3. finir le plus tot possible,
 * sans jamais creer de conflit (salle, jury, indisponibilite) et sans toucher
 * aux soutenances dont le planning est deja valide.
 * Le jury de chaque soutenance n'est pas modifie : seuls le creneau et la salle changent.
 */
class PlanningOptimisationService
{
    private const POIDS_CONFLIT = 1000;
    private const POIDS_JOUR = 100;
    private const POIDS_TROU = 10;   // par creneau de duree standard laisse vide
    private const POIDS_TARDIF = 1;  // par jour de retard sur le premier jour du planning
    private const PASSES_MAX = 10;

    /**
     * @param bool $appliquer false = simple proposition (rien n'est modifie) ; true = les deplacements sont enregistres
     */
    public function optimiser(bool $appliquer = false): array
    {
        $params = ParametrePlanification::actuel();
        $duree = max(1, (int) $params->duree_minutes);

        $soutenances = Soutenance::with(['affectationsJury', 'etudiant'])
            ->where('statut', 'planifiee')
            ->whereNotNull('date_debut')
            ->whereNotNull('date_fin')
            ->whereNotNull('salle_id')
            ->get();

        if ($soutenances->isEmpty()) {
            return $this->vide('Aucune soutenance planifiee a optimiser.');
        }

        // Etat du planning en memoire : on y teste les deplacements sans toucher a la base
        $p = [];
        foreach ($soutenances as $s) {
            $p[$s->id] = [
                'debut' => $s->date_debut->copy(),
                'fin'   => $s->date_fin->copy(),
                'salle' => (int) $s->salle_id,
                'jurys' => $s->affectationsJury->pluck('enseignant_id')->map(fn ($i) => (int) $i)->all(),
                'fige'  => $s->valide_le !== null,
            ];
        }
        $origine = $p;

        $indispos = Indisponibilite::all()->groupBy('enseignant_id');
        $salles = Room::where('is_active', true)->pluck('id')->map(fn ($i) => (int) $i)->all();

        $avant = $this->metriques($p, $indispos, $duree);

        $aujourdhui = Carbon::today();
        $debutPlage = collect($p)->min(fn ($x) => $x['debut']->copy()->startOfDay()->timestamp);
        $finPlage = collect($p)->max(fn ($x) => $x['debut']->copy()->startOfDay()->timestamp);
        $refJour = Carbon::createFromTimestamp($debutPlage)->startOfDay();

        // Jours candidats : jours ouvres de la plage actuelle (jamais dans le passe)
        $jours = [];
        $cursor = Carbon::createFromTimestamp(max($debutPlage, $aujourdhui->timestamp))->startOfDay();
        $limite = Carbon::createFromTimestamp($finPlage)->startOfDay();
        while ($cursor->lte($limite)) {
            if (!$cursor->isWeekend()) {
                $jours[] = $cursor->copy();
            }
            $cursor->addDay();
        }

        // Grille de creneaux (meme logique que la planification)
        $grille = [];
        $h0 = $params->heure_debut_journee;
        $h1 = $params->heure_fin_journee;

        $ids = array_keys($p);
        usort($ids, fn ($a, $b) => $p[$a]['debut']->timestamp <=> $p[$b]['debut']->timestamp);

        for ($passe = 0; $passe < self::PASSES_MAX; $passe++) {
            $ameliore = false;

            foreach ($ids as $id) {
                if ($p[$id]['fige']) {
                    continue;
                }

                $coutCourant = $this->cout($p, $duree, $refJour)
                    + ($this->enConflit($id, $p, $indispos) ? self::POIDS_CONFLIT : 0);

                $meilleur = null;
                $meilleurCout = $coutCourant;

                foreach ($jours as $jour) {
                    $creneaux = $this->creneauxDuJour($jour, $h0, $h1, $duree);
                    foreach ($creneaux as [$debut, $fin]) {
                        // On essaie d'abord la salle actuelle, puis les autres
                        $ordreSalles = array_values(array_unique(array_merge([$p[$id]['salle']], $salles)));

                        foreach ($ordreSalles as $salle) {
                            $meme = $debut->equalTo($p[$id]['debut']) && $fin->equalTo($p[$id]['fin']) && $salle === $p[$id]['salle'];
                            if ($meme) {
                                continue;
                            }

                            $essai = $p;
                            $essai[$id]['debut'] = $debut;
                            $essai[$id]['fin'] = $fin;
                            $essai[$id]['salle'] = $salle;

                            if ($this->enConflit($id, $essai, $indispos)) {
                                continue;
                            }

                            $cout = $this->cout($essai, $duree, $refJour);
                            if ($cout < $meilleurCout) {
                                $meilleurCout = $cout;
                                $meilleur = [$debut, $fin, $salle];
                            }
                        }
                    }
                }

                if ($meilleur) {
                    [$debut, $fin, $salle] = $meilleur;
                    $p[$id]['debut'] = $debut;
                    $p[$id]['fin'] = $fin;
                    $p[$id]['salle'] = $salle;
                    $ameliore = true;
                }
            }

            if (!$ameliore) {
                break;
            }
        }

        $apres = $this->metriques($p, $indispos, $duree);

        // Liste des deplacements
        $deplacements = [];
        foreach ($p as $id => $nouveau) {
            $ancien = $origine[$id];
            $inchange = $nouveau['debut']->equalTo($ancien['debut'])
                && $nouveau['fin']->equalTo($ancien['fin'])
                && $nouveau['salle'] === $ancien['salle'];
            if ($inchange) {
                continue;
            }

            $s = $soutenances->firstWhere('id', $id);
            $deplacements[] = [
                'soutenance_id' => $id,
                'etudiant'      => $s->etudiant->name ?? ('#' . $s->etudiant_id),
                'theme'         => $s->theme,
                'de'            => [
                    'date_debut' => $ancien['debut']->toIso8601String(),
                    'date_fin'   => $ancien['fin']->toIso8601String(),
                    'salle_id'   => $ancien['salle'],
                ],
                'vers'          => [
                    'date_debut' => $nouveau['debut']->toIso8601String(),
                    'date_fin'   => $nouveau['fin']->toIso8601String(),
                    'salle_id'   => $nouveau['salle'],
                ],
            ];
        }

        if ($appliquer && !empty($deplacements)) {
            DB::transaction(function () use ($deplacements, $p) {
                foreach ($deplacements as $d) {
                    Soutenance::whereKey($d['soutenance_id'])->firstOrFail()->update([
                        'salle_id'   => $p[$d['soutenance_id']]['salle'],
                        'date_debut' => $p[$d['soutenance_id']]['debut'],
                        'date_fin'   => $p[$d['soutenance_id']]['fin'],
                    ]);
                }
            });
        }

        return [
            'success'      => true,
            'appliquee'    => $appliquer && !empty($deplacements),
            'message'      => empty($deplacements)
                ? 'Le planning est deja optimal : aucun deplacement possible sans creer de conflit.'
                : (count($deplacements) . ' deplacement(s) ' . ($appliquer ? 'appliques.' : 'proposes (rien n\'est modifie tant que vous n\'appliquez pas).')),
            'deplacements' => $deplacements,
            'avant'        => $avant,
            'apres'        => $apres,
            'figees'       => collect($p)->where('fige', true)->count(),
        ];
    }

    private function vide(string $message): array
    {
        $zero = ['jours' => 0, 'minutes_inactives' => 0, 'conflits' => 0];

        return [
            'success'      => true,
            'appliquee'    => false,
            'message'      => $message,
            'deplacements' => [],
            'avant'        => $zero,
            'apres'        => $zero,
            'figees'       => 0,
        ];
    }

    /** Creneaux d'une journee selon les parametres de planification. */
    private function creneauxDuJour(Carbon $jour, string $heureDebut, string $heureFin, int $duree): array
    {
        $creneaux = [];
        $debut = $jour->copy()->setTimeFromTimeString($heureDebut);
        $finJournee = $jour->copy()->setTimeFromTimeString($heureFin);

        while ($debut->copy()->addMinutes($duree)->lte($finJournee)) {
            $fin = $debut->copy()->addMinutes($duree);
            $creneaux[] = [$debut->copy(), $fin->copy()];
            $debut = $fin;
        }

        return $creneaux;
    }

    /** Indicateurs lisibles du planning (avant / apres). */
    private function metriques(array $p, $indispos, int $duree): array
    {
        $conflits = 0;
        foreach (array_keys($p) as $id) {
            if ($this->enConflit($id, $p, $indispos)) {
                $conflits++;
            }
        }

        $parJour = $this->parJour($p);

        return [
            'jours'             => count($parJour),
            'minutes_inactives' => $this->minutesInactives($parJour),
            'conflits'          => $conflits,
        ];
    }

    private function parJour(array $p): array
    {
        $parJour = [];
        foreach ($p as $x) {
            $parJour[$x['debut']->format('Y-m-d')][] = [$x['debut']->timestamp, $x['fin']->timestamp];
        }

        return $parJour;
    }

    /** Minutes vides entre la premiere et la derniere soutenance de chaque jour (toutes salles confondues). */
    private function minutesInactives(array $parJour): int
    {
        $total = 0;
        foreach ($parJour as $intervalles) {
            usort($intervalles, fn ($a, $b) => $a[0] <=> $b[0]);
            $finMax = $intervalles[0][1];
            foreach (array_slice($intervalles, 1) as [$debut, $fin]) {
                if ($debut > $finMax) {
                    $total += intdiv($debut - $finMax, 60);
                }
                $finMax = max($finMax, $fin);
            }
        }

        return $total;
    }

    /** Cout du planning (plus petit = meilleur) : jours utilises, trous, retard. */
    private function cout(array $p, int $duree, Carbon $refJour): int
    {
        $parJour = $this->parJour($p);

        $cout = count($parJour) * self::POIDS_JOUR;
        $cout += intdiv($this->minutesInactives($parJour), $duree) * self::POIDS_TROU;

        foreach ($p as $x) {
            // nombre de jours entre le premier jour du planning et cette soutenance
            $cout += (int) round(($x['debut']->copy()->startOfDay()->timestamp - $refJour->timestamp) / 86400) * self::POIDS_TARDIF;
        }

        return $cout;
    }

    /** La soutenance $id est-elle en conflit (salle, jury, indisponibilite) avec le reste du planning ? */
    private function enConflit(int $id, array $p, $indispos): bool
    {
        $a = $p[$id];

        foreach ($p as $autreId => $b) {
            if ($autreId === $id) {
                continue;
            }

            $chevauche = $b['debut']->lt($a['fin']) && $b['fin']->gt($a['debut']);
            if (!$chevauche) {
                continue;
            }

            if ($b['salle'] === $a['salle']) {
                return true;
            }
            if (array_intersect($a['jurys'], $b['jurys'])) {
                return true;
            }
        }

        foreach ($a['jurys'] as $enseignantId) {
            foreach ($indispos->get($enseignantId, collect()) as $ind) {
                if (Carbon::parse($ind->date)->format('Y-m-d') !== $a['debut']->format('Y-m-d')) {
                    continue;
                }
                $iDebut = $a['debut']->copy()->setTimeFromTimeString($ind->heure_debut);
                $iFin = $a['debut']->copy()->setTimeFromTimeString($ind->heure_fin);
                if ($iDebut->lt($a['fin']) && $iFin->gt($a['debut'])) {
                    return true;
                }
            }
        }

        return false;
    }
}
