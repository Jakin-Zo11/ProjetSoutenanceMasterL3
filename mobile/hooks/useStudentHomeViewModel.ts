/**
 * ViewModel — Accueil étudiant.
 *
 * Extrait de StudentHomeScreen.tsx : liste des raccourcis avec état de
 * verrouillage calculé, initiales de l'avatar.
 *
 * (MVVM — ViewModel, consommé par StudentHomeScreen)
 */

import { useMemo } from 'react';
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export interface Shortcut {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  screen: string;
  locked: boolean;
}

/** Initiales depuis le nom complet — ex: "RAKOTO Jean" → "RJ" */
export function getAvatarInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
}

export function useStudentHomeViewModel(
  convocationReady: boolean,
  studentName: string,
) {
  const avatarInitials = useMemo(
    () => getAvatarInitials(studentName),
    [studentName],
  );

  const shortcuts: Shortcut[] = useMemo(() => [
    {
      icon: 'calendar-outline',
      title: 'Ma soutenance',
      screen: 'student-defense',
      locked: !convocationReady,
    },
    {
      icon: 'document-text-outline',
      title: 'Ma convocation',
      screen: 'student-convocation',
      locked: !convocationReady,
    },
    {
      icon: 'book-outline',
      title: 'Mon sujet de thèse',
      screen: 'student-thesis',
      locked: false,
    },
    {
      icon: 'stats-chart-outline',
      title: 'Mon résultat',
      screen: 'student-result',
      locked: true,
    },
    {
      icon: 'create-outline',
      title: 'PV de soutenance',
      screen: 'student-pv',
      locked: true,
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      screen: 'student-notifications',
      locked: true,
    },
  ], [convocationReady]);

  return { shortcuts, avatarInitials };
}
