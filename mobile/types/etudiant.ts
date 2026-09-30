// ─── Notification ─────────────────────────────────────────────────────────────

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
}
