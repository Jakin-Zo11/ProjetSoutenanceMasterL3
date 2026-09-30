/**
 * ViewModel — Notifications étudiant.
 *
 * Extrait de NotificationsScreen.tsx : initialisation de la liste depuis
 * les mocks + flags contextuels, marquage comme lu, style par type.
 *
 * (MVVM — ViewModel, consommé par NotificationsScreen)
 */

import { useCallback, useState } from 'react';
import { mockNotifications } from '../mocks/notifications';
import type { NotificationItem } from '../types/etudiant';

// ─── Helpers purs (testables unitairement) ────────────────────────────────────

export type NotificationStyle = {
  icon: 'people-outline' | 'location-outline' | 'time-outline' | 'document-text-outline' | 'trophy-outline';
  color: string;
  label: string;
};

export function getNotificationStyle(type: NotificationItem['type']): NotificationStyle {
  switch (type) {
    case 'changement_jury':
      return { icon: 'people-outline',        color: '#F59E0B', label: 'Jury'        };
    case 'changement_salle':
      return { icon: 'location-outline',       color: '#2D84E0', label: 'Salle'       };
    case 'changement_horaire':
      return { icon: 'time-outline',           color: '#2D84E0', label: 'Horaire'     };
    case 'convocation_disponible':
      return { icon: 'document-text-outline',  color: '#2D84E0', label: 'Convocation' };
    case 'resultat_disponible':
      return { icon: 'trophy-outline',         color: '#2D84E0', label: 'Résultat'    };
  }
}

export function isImportantNotification(type: NotificationItem['type']): boolean {
  return (
    type === 'changement_jury' ||
    type === 'changement_salle' ||
    type === 'changement_horaire'
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotificationsViewModel(
  convocationReady: boolean,
  defenseCompleted: boolean = false,
) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    ...mockNotifications,
    ...(convocationReady ? [{
      id: '4',
      type: 'convocation_disponible' as const,
      titre: 'Convocation disponible',
      description: 'Votre convocation officielle et les détails de votre soutenance sont disponibles.',
      date: new Date().toISOString(),
      lue: false,
    }] : []),
    ...(defenseCompleted ? [{
      id: '5',
      type: 'resultat_disponible' as const,
      titre: 'Résultat disponible',
      description: 'Votre résultat de soutenance est maintenant disponible.',
      date: new Date().toISOString(),
      lue: false,
    }] : []),
  ]);

  const unreadCount = notifications.filter((n) => !n.lue).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, lue: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) => current.map((n) => ({ ...n, lue: true })));
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationStyle,
    isImportantNotification,
  };
}
