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
