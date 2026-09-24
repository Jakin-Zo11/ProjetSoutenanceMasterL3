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
  { id: 'defense', icon: 'calendar-outline', label: 'Soutenance' },
  { id: 'result', icon: 'stats-chart-outline', label: 'Notes' },
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
  else if (tab === 'defense') onNavigate('student-defense');
  else if (tab === 'result') onNavigate('student-result');
  else if (tab === 'profile') onNavigate('student-profile');
};