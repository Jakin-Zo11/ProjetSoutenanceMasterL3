// ─── Profil étudiant ──────────────────────────────────────────────────────────
// Source canonique du type StudentProfile.
// Anciennement défini dans StudentLoginScreen.tsx — centralisé ici (MVVM : Model).

export interface StudentProfile {
  /** Identifiant interne (utile pour les appels API) */
  id: number;
  /** Matricule — toujours string, ex : "001I24", jamais converti en nombre */
  matricule: string;
  /** Nom complet retourné par le backend (ex : "RAKOTO Jean") */
  name: string;
  /** Email institutionnel */
  email: string;
  /** Numéro de téléphone */
  telephone: string;
  /** Libellé de la filière / formation */
  formation: string;
  /** Libellé de la promotion */
  promotion: string;
  /** Statut du compte : "actif" | "inactif" */
  status: string;
  /** Sujet déjà enregistré dans le dossier étudiant, si transmis par le service. */
  themeTitle?: string;
  /** Entreprise de stage déjà enregistrée, si transmise par le service. */
  company?: string;
  /** URL du PDF de la thèse/mémoire */
  pdfUrl?: string;
  /** Date de soumission du thème */
  submissionDate?: string;
}

export type StudentDepositKind = 'theme' | 'memoire';

export interface StudentDeposit {
  id: number;
  type: StudentDepositKind;
  title: string;
  fileName: string;
  fileUrl: string;
  status: 'en_attente' | 'valide' | 'rejete';
  comment: string | null;
  submittedAt: string | null;
  validatedAt: string | null;
}

export interface StudentPortalStatus {
  themeApproved: boolean;
  thesisApproved: boolean;
  defenseScheduled: boolean;
  resultPublished: boolean;
  pvAvailable: boolean;
}

export interface StudentDefense {
  id: number;
  title: string | null;
  status: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  date: string | null;
  time: string | null;
  room: { name: string; building: string | null } | null;
  session: string | null;
  jury: string[] | null;
  convocationDocument: string | null;
}

export interface StudentResult {
  average: number;
  mention: string;
  publishedAt: string | null;
}

export interface StudentPv {
  soutenance: { id: number; date: string; salle: string; session: string };
  etudiant: { id: number; nom: string; email: string; matricule: string };
  memoire: { titre: string; promotion: string };
  evaluations: Array<{
    jury: string;
    note_presentation: number;
    note_manuscrit: number;
    note_reponses: number;
    note_finale: number;
    remarques: string | null;
  }>;
  resultat: { moyenne: number; mention: string };
  statut_soutenance: string;
}
