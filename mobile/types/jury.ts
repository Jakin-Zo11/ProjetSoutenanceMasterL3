export type SoutenanceStatut =
  | 'en_cours'
  | 'evaluation_en_attente'
  | 'a_venir'
  | 'evaluation_terminee';

export interface SoutenanceJury {
  id: string;
  etudiantNom: string;
  theme: string;
  date: string;
  heure: string;
  salle: string;
  statut: SoutenanceStatut;
}

export interface StatsJury {
  soutenancesAujourdhui: number;
  soutenancesAVenir: number;
  evaluationsEnAttente: number;
  evaluationsTerminees: number;
}
