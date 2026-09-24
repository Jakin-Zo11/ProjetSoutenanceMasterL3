import type { NotificationItem } from '../types/etudiant';

// TODO: remplacer ces données mockées par l'API notifications.
export const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'changement_jury',
    titre: 'Modification du jury',
    description:
      'Dr. R. Durand est indisponible pour votre soutenance. Il a été remplacé par Dr. M. Rakoto.',
    date: '2026-09-20T10:00:00',
    lue: false,
  },
  {
    id: '2',
    type: 'changement_salle',
    titre: 'Changement de salle',
    description:
      'Votre soutenance a été déplacée de la salle A102 vers la salle B204.',
    date: '2026-09-19T15:30:00',
    lue: false,
  },
  {
    id: '3',
    type: 'changement_horaire',
    titre: "Modification de l'horaire",
    description:
      "L'heure de votre soutenance a été avancée à 09:00 (au lieu de 10:30).",
    date: '2026-09-18T08:00:00',
    lue: true,
  },
];
