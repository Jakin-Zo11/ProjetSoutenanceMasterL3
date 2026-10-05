/**
 * Types partagés pour la gestion des soutenances
 * Utilisé par Mobile (Étudiant & Jury)
 * Charte EMIT : États et types sans référence au rouge
 */

// ─── Rôles Jury ───────────────────────────────────────────────────────────────

export type JuryRole = 'PRESIDENT' | 'RAPPORTEUR' | 'EXAMINER';

// ─── Statuts de Soutenance ─────────────────────────────────────────────────────

export type DefenseStatus =
  | 'PENDING_SUBMISSION'
  | 'SUBMITTED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'ABSENT_REPLACED';

// ─── Profil Étudiant ─────────────────────────────────────────────────────────

export interface StudentProfile {
  matricule: string;
  fullName: string;
  filiere: string;
  themeTitle: string;
  company?: string;
  pdfUrl?: string;
  submissionDate?: string;
}

// ─── Membre de Jury ─────────────────────────────────────────────────────────

export interface JuryMember {
  id: number;
  teacherName: string;
  role: JuryRole;
  isAvailable: boolean;
}

// ─── Créneau de Soutenance ───────────────────────────────────────────────────

export interface DefenseSlot {
  id: number;
  studentMatricule: string;
  studentName: string;
  themeTitle: string;
  pdfUrl?: string;
  date: string; // Format: YYYY-MM-DD (session 11-16 novembre 2026)
  timeStart: string; // Format: HH:mm
  timeEnd: string; // Format: HH:mm
  room: string;
  jury: JuryMember[];
  status: DefenseStatus;
  finalScore?: number;
  pvUrl?: string;
}

// ─── Grille d'Évaluation ───────────────────────────────────────────────────────

export interface EvaluationGrid {
  defenseId: number;
  presentationScore: number; // /5
  technicalScore: number; // /10
  answersScore: number; // /5
  totalScore: number; // /20
  comments: string;
  isValidated: boolean;
}

// ─── Remplacement de Jury ─────────────────────────────────────────────────────

export interface JuryReplacement {
  id: number;
  defenseId: number;
  originalJuryId: number;
  replacementJuryId: number;
  dateReplacement: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  reason: string;
}

// ─── Notification de Remplacement ───────────────────────────────────────────────

export interface ReplacementNotification {
  id: number;
  type: 'JURY_REPLACEMENT' | 'JURY_CHANGE';
  title: string;
  message: string;
  defenseId: number;
  studentName: string;
  date: string;
  time: string;
  room: string;
  isRead: boolean;
  createdAt: string;
}
