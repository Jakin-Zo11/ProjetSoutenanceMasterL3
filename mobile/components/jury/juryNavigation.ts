import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export const JURY_ACCENT_BLUE = '#3B82F6';

export const juryTabItems: {
  id: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
}[] = [
  { id: 'home', icon: 'home-outline', label: 'Accueil' },
  { id: 'defenses', icon: 'calendar-outline', label: 'Étudiants' },
  { id: 'evaluations', icon: 'clipboard-outline', label: 'Évaluations' },
  { id: 'profile', icon: 'person-outline', label: 'Profil' },
];

/**
 * Pastilles bleues de la Tab Bar Jury (données locales / Mock Data) :
 * - Soutenances : soutenances assignées du jour
 * - Évaluations : évaluations en attente (priorité haute)
 */
export const juryTabBadges: Record<string, number> = {
  defenses: 3,
  evaluations: 8,
};
