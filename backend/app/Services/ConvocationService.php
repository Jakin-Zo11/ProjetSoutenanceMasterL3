<?php

namespace App\Services;

use App\Models\Convocation;
use App\Models\Soutenance;
use DomainException;

class ConvocationService
{
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

        // On ne change la date de generation que si le contenu a vraiment change
        // (ex. apres une replanification).
        if (!$convocation->exists || $convocation->contenu !== $contenu) {
            $convocation->contenu = $contenu;
            $convocation->generee_le = now();
            $convocation->save();
        }

        return $convocation;
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
