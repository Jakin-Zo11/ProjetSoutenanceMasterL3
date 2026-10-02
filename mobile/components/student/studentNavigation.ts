import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * Tab Bar unique de l'espace Étudiant (Données locales — Mock Data).
 * Tous les écrans étudiants partagent exactement les mêmes onglets
 * afin qu'un clic affiche immédiatement l'écran correspondant,
 * sans appel réseau ni serveur externe.
 */
export const studentTabItems: {
  id: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
}[] = [
  { id: 'home', icon: 'home-outline', label: 'Accueil' },
  { id: 'convocation', icon: 'document-text-outline', label: 'Convocation (PDF)' },
  { id: 'jury', icon: 'people-outline', label: 'Mon Jury' },
  { id: 'redaction', icon: 'create-outline', label: 'Rédaction & Mémoire' },
  { id: 'result', icon: 'stats-chart-outline', label: 'Résultats & PV' },
  { id: 'profile', icon: 'person-outline', label: 'Profil' },
];

/**
 * Navigation instantanée entre les onglets étudiants (100 % locale).
 */
export const navigateStudentTab = (
  tab: string,
  onNavigate: (screen: string) => void,
) => {
  if (tab === 'home') onNavigate('student');
  else if (tab === 'convocation') onNavigate('student-convocation');
  else if (tab === 'jury') onNavigate('student-jury');
  else if (tab === 'redaction') onNavigate('student-redaction');
  else if (tab === 'result') onNavigate('student-result');
  else if (tab === 'profile') onNavigate('student-profile');
};