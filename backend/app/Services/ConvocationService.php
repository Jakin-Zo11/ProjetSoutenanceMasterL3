<?php

namespace App\Services;

use App\Models\Convocation;
use App\Models\Soutenance;
use App\Models\StudentNotification;
use App\Models\User;
use App\Notifications\ConvocationNotification;
use DomainException;
use Illuminate\Support\Facades\Log;

class ConvocationService
{
    /** Passe a true des qu'un envoi de mail echoue : on n'insiste pas sur un serveur mail indisponible. */
    protected bool $mailIndisponible = false;

    /**
     * Genere (ou met a jour) la convocation d'une soutenance.
     * Regle : une convocation n'est generee qu'a partir d'un planning valide.
     *
     * @throws DomainException si la soutenance n'est pas planifiee ou pas validee
     */
    public function generer(Soutenance $soutenance): Convocation
    {
        if (!$soutenance->date_debut || !$soutenance->salle_id) {
            throw new DomainException("Cette soutenance n'est pas encore planifiee (date/salle manquante).");
        }

        if (!$soutenance->valide_le) {
            throw new DomainException(
                "Le planning de cette soutenance n'est pas encore valide : la convocation ne peut pas etre generee."
            );
        }

        $soutenance->loadMissing(['affectationsJury.enseignant', 'salle', 'etudiant']);

        $contenu = $this->construireContenu($soutenance);

        $convocation = Convocation::firstOrNew(['soutenance_id' => $soutenance->id]);

        // Le contenu change (ex. apres une replanification) : nouvelle convocation,
        // donc a rediffuser.
        if (!$convocation->exists || $convocation->contenu !== $contenu) {
            $convocation->contenu = $contenu;
            $convocation->generee_le = now();
            $convocation->diffusee_le = null;
            $convocation->diffusee_par = null;
            $convocation->save();
        }

        return $convocation;
    }

    /**
     * Une convocation est "a jour" si elle a ete diffusee apres la derniere validation du planning.
     */
    public function estDiffusee(Soutenance $soutenance, Convocation $convocation): bool
    {
        return $convocation->diffusee_le !== null
            && $soutenance->valide_le !== null
            && $convocation->diffusee_le->gte($soutenance->valide_le);
    }

    /**
     * Diffuse la convocation d'une soutenance a l'etudiant (notification dans son espace + e-mail)
     * et aux membres du jury (e-mail).
     *
     * @return array{deja_diffusee: bool, destinataires: int, notifications: int, mails_envoyes: int, erreurs: string[], diffusee_le: ?string}
     * @throws DomainException si la convocation ne peut pas etre generee (non planifiee / non validee)
     */
    public function diffuser(Soutenance $soutenance, ?User $par = null, bool $renvoyer = false): array
    {
        $convocation = $this->generer($soutenance);

        if (!$renvoyer && $this->estDiffusee($soutenance, $convocation)) {
            return [
                'deja_diffusee' => true,
                'destinataires' => 0,
                'notifications' => 0,
                'mails_envoyes' => 0,
                'erreurs'       => [],
                'diffusee_le'   => $convocation->diffusee_le->toIso8601String(),
            ];
        }

        $destinataires = [];
        if ($soutenance->etudiant) {
            $destinataires[] = [$soutenance->etudiant, 'etudiant'];
        }
        foreach ($soutenance->affectationsJury as $affectation) {
            if ($affectation->enseignant) {
                $destinataires[] = [$affectation->enseignant, $affectation->role];
            }
        }

        $notifications = 0;
        $mailsEnvoyes = 0;
        $erreurs = [];

        foreach ($destinataires as [$user, $role]) {
            // Notification dans l'espace etudiant (visible dans l'application)
            if ($role === 'etudiant') {
                StudentNotification::updateOrCreate(
                    [
                        'user_id'   => $user->id,
                        'event_key' => "convocation:{$soutenance->id}:{$convocation->generee_le->timestamp}",
                    ],
                    [
                        'type'        => 'convocation',
                        'title'       => 'Convocation a votre soutenance',
                        'message'     => 'Vous etes convoque(e) le ' . $soutenance->date_debut->format('d/m/Y')
                            . ' a ' . $soutenance->date_debut->format('H:i')
                            . ', salle ' . ($soutenance->salle->name ?? 'a preciser') . '.',
                        'occurred_at' => now(),
                    ]
                );
                $notifications++;
            }

            // E-mail : un echec d'envoi ne doit pas bloquer la diffusion
            if (empty($user->email)) {
                $erreurs[] = "{$user->name} : pas d'adresse e-mail";
                continue;
            }

            if ($this->mailIndisponible) {
                $erreurs[] = "{$user->name} : mail non envoye (serveur mail indisponible)";
                continue;
            }

            try {
                $user->notify(new ConvocationNotification($soutenance, $role));
                $mailsEnvoyes++;
            } catch (\Throwable $e) {
                $this->mailIndisponible = true;
                Log::warning("Echec d'envoi de la convocation a {$user->email} : " . $e->getMessage());
                $erreurs[] = "{$user->name} : envoi du mail impossible (verifier la configuration MAIL_* du .env)";
            }
        }

        // On ne marque la convocation comme diffusee que si au moins un destinataire a ete joint.
        if ($notifications > 0 || $mailsEnvoyes > 0) {
            $convocation->forceFill([
                'diffusee_le'  => now(),
                'diffusee_par' => $par?->id,
            ])->save();
        }

        return [
            'deja_diffusee' => false,
            'destinataires' => count($destinataires),
            'notifications' => $notifications,
            'mails_envoyes' => $mailsEnvoyes,
            'erreurs'       => $erreurs,
            'diffusee_le'   => $convocation->diffusee_le?->toIso8601String(),
        ];
    }

    /**
     * Diffuse toutes les convocations des soutenances validees qui n'ont pas encore ete diffusees
     * (ou dont le planning a ete revalide depuis la derniere diffusion).
     */
    public function diffuserTout(?User $par = null): array
    {
        $resultat = [
            'soutenances'   => 0,
            'deja_diffusees' => 0,
            'notifications' => 0,
            'mails_envoyes' => 0,
            'erreurs'       => [],
        ];

        $soutenances = Soutenance::where('statut', 'planifiee')
            ->whereNotNull('valide_le')
            ->with(['affectationsJury.enseignant', 'salle', 'etudiant'])
            ->get();

        foreach ($soutenances as $soutenance) {
            try {
                $r = $this->diffuser($soutenance, $par);
            } catch (DomainException $e) {
                $resultat['erreurs'][] = "Soutenance #{$soutenance->id} : " . $e->getMessage();
                continue;
            }

            if ($r['deja_diffusee']) {
                $resultat['deja_diffusees']++;
                continue;
            }

            $resultat['soutenances']++;
            $resultat['notifications'] += $r['notifications'];
            $resultat['mails_envoyes'] += $r['mails_envoyes'];
            foreach ($r['erreurs'] as $erreur) {
                $resultat['erreurs'][] = "Soutenance #{$soutenance->id} - " . $erreur;
            }
        }

        return $resultat;
    }

    protected function construireContenu(Soutenance $soutenance): string
    {
        $lignes = [
            'CONVOCATION A LA SOUTENANCE',
            '',
            'Etudiant : ' . ($soutenance->etudiant->name ?? ('#' . $soutenance->etudiant_id)),
            'Theme : ' . ($soutenance->theme ?? 'Non precise'),
            'Date : ' . $soutenance->date_debut->format('d/m/Y'),
            'Heure : ' . $soutenance->date_debut->format('H:i') . ' - ' . $soutenance->date_fin->format('H:i'),
            'Salle : ' . ($soutenance->salle->name ?? 'Non assignee'),
            '',
            'Membres du jury :',
        ];

        foreach ($soutenance->affectationsJury as $affectation) {
            $lignes[] = '- ' . ($affectation->enseignant->name ?? '?') . ' (' . $affectation->role . ')';
        }

        return implode("\n", $lignes);
    }
}
