export interface NotificationItem {
  id: string;
  type:
    | 'changement_jury'
    | 'changement_salle'
    | 'changement_horaire'
    | 'convocation_disponible'
    | 'resultat_disponible';
  titre: string;
  description: string;
  date: string;
  lue: boolean;
}
