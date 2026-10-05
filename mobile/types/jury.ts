import type { DefenseSlot, JuryMember, JuryRole, DefenseStatus } from './defense';

// ─── Statuts de Soutenance (format mobile pour compatibilité) ──────────────────

export type SoutenanceStatut =
  | 'en_cours'
  | 'evaluation_en_attente'
  | 'a_venir'
  | 'evaluation_terminee'
  | 'absence_signalee';

// ─── Soutenance Jury (format mobile pour compatibilité UI existante) ───────────

export interface SoutenanceJury {
  id: string;
  etudiantNom: string;
  theme: string;
  date: string;
  heure: string;
  salle: string;
  statut: SoutenanceStatut;
  niveau?: string;
  role?: string;
  studentMatricule?: string;
  calendarDate?: string;
  director?: string;
  jury?: { name: string; role: string }[];
}

// ─── Statistiques Jury ───────────────────────────────────────────────────────

export interface StatsJury {
  soutenancesAujourdhui: number;
  soutenancesAVenir: number;
  evaluationsEnAttente: number;
  evaluationsTerminees: number;
}

// ─── Réexport des types partagés ─────────────────────────────────────────────

export type { DefenseSlot, JuryMember, JuryRole, DefenseStatus } from './defense';
export type { JuryReplacement, ReplacementNotification, EvaluationGrid } from './defense';
