import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { mockNotifications } from '../../mocks/notifications';
import type { NotificationItem as NotificationData } from '../../types/etudiant';
import { studentTabItems, navigateStudentTab } from './studentNavigation';

interface NotificationItemProps {
  notification: NotificationData;
  onRead: (id: string) => void;
}

const getNotificationStyle = (type: NotificationData['type']) => {
  switch (type) {
    case 'changement_jury':
      return { icon: 'people-outline' as const, color: '#F59E0B', label: 'Jury' };
    case 'changement_salle':
      return { icon: 'location-outline' as const, color: '#2D84E0', label: 'Salle' };
    case 'changement_horaire':
      return { icon: 'time-outline' as const, color: '#2D84E0', label: 'Horaire' };
    case 'convocation_disponible':
      return { icon: 'document-text-outline' as const, color: '#2D84E0', label: 'Convocation' };
    case 'resultat_disponible':
      return { icon: 'trophy-outline' as const, color: '#2D84E0', label: 'Résultat' };
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
  const notificationStyle = getNotificationStyle(notification.type);
  const isImportant = notification.type === 'changement_jury'
    || notification.type === 'changement_salle'
    || notification.type === 'changement_horaire';

  return (
    <Pressable
      onPress={() => onRead(notification.id)}
      style={({ pressed }) => [styles.notificationItem,
        isImportant && {
          borderLeftColor: notificationStyle.color,
          borderLeftWidth: 3,
        },, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={notificationStyle.icon} size={22} color={notificationStyle.color} />
        {!notification.lue && <View style={styles.notificationDot} />}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={[styles.typeBadge, { backgroundColor: notificationStyle.color }]}>
            <Text style={styles.typeBadgeText}>{notificationStyle.label}</Text>
          </View>
          <Text style={styles.timestamp}>
            {new Date(notification.date).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <Text style={styles.notificationTitle}>{notification.titre}</Text>
        <Text style={styles.notificationDescription}>{notification.description}</Text>
      </View>
    </Pressable>
  );
};

interface ScreenProps {
  onBack: () => void;
  convocationReady: boolean;
  defenseCompleted?: boolean;
  onNavigate: (screen: string) => void;
}

const NotificationsScreen: React.FC<ScreenProps> = ({
  onBack,
  convocationReady,
  defenseCompleted = false,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>(() => [
    ...mockNotifications,
    ...(convocationReady ? [{
      id: '4',
      type: 'convocation_disponible' as const,
      titre: 'Convocation disponible',
      description: 'Votre convocation officielle et les détails de votre soutenance sont disponibles.',
      date: '2026-09-21T09:00:00',
      lue: false,
    }] : []),
    ...(defenseCompleted ? [{
      id: '5',
      type: 'resultat_disponible' as const,
      titre: 'Résultat disponible',
      description: 'Votre résultat de soutenance est maintenant disponible.',
      date: '2026-09-21T10:00:00',
      lue: false,
    }] : []),
  ]);

  const markAsRead = (id: string) => {
    setNotifications((current) => current.map((notification) => (
      notification.id === id ? { ...notification, lue: true } : notification
    )));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Notifications" showBackButton onBackPress={onBack} showNotification />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationsList}>
          {notifications.length ? notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
            />
          )) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={44} color="#1A4BA8" />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptyText}>
                Vous serez averti ici en cas de changement concernant votre soutenance (jury, salle, horaire).
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav
        items={studentTabItems}
        activeTab=""
        onTabChange={(tab) => navigateStudentTab(tab, onNavigate)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  iconContainer: {
    width: 28,
    marginRight: 12,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -3,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D84E0',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1F4E',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  emptyText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    padding: 20,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDEAF7',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    padding: 28,
  },
  emptyTitle: {
    color: '#0D1F4E',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 17,
    marginTop: 12,
  },
});

export default NotificationsScreen;
