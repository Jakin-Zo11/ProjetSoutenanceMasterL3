<?php

namespace App\Notifications;

use App\Models\Soutenance;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * E-mail de convocation envoye a l'etudiant et aux membres du jury
 * une fois le planning valide.
 */
class ConvocationNotification extends Notification
{
    public function __construct(
        protected Soutenance $soutenance,
        protected string $role // 'etudiant' ou role dans le jury (president, rapporteur, examinateur)
    ) {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $s = $this->soutenance;
        $s->loadMissing(['etudiant', 'salle', 'affectationsJury.enseignant']);

        $intro = $this->role === 'etudiant'
            ? 'Vous etes convoque(e) a votre soutenance.'
            : "Vous etes convoque(e) comme membre du jury ({$this->role}) pour la soutenance suivante.";

        $mail = (new MailMessage)
            ->subject('Convocation a la soutenance du ' . $s->date_debut->format('d/m/Y'))
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line($intro)
            ->line('Etudiant : ' . ($s->etudiant->name ?? ('#' . $s->etudiant_id)))
            ->line('Theme : ' . ($s->theme ?? 'Non precise'))
            ->line('Date : ' . $s->date_debut->format('d/m/Y'))
            ->line('Heure : ' . $s->date_debut->format('H:i') . ' - ' . $s->date_fin->format('H:i'))
            ->line('Salle : ' . ($s->salle->name ?? 'Non assignee'))
            ->line('Membres du jury :');

        foreach ($s->affectationsJury as $a) {
            $mail->line('- ' . ($a->enseignant->name ?? '?') . ' (' . $a->role . ')');
        }

        return $mail->line("Merci de vous presenter 15 minutes avant l'heure indiquee.");
    }
}
