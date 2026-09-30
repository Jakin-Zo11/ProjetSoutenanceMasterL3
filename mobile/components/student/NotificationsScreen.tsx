/**
 * View — Notifications étudiant (MVVM).
 * Toute la logique est déléguée à useNotificationsViewModel.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { studentTabItems, navigateStudentTab } from './studentNavigation';
import {
  useNotificationsViewModel,
  type NotificationStyle,
} from '../../hooks/useNotificationsViewModel';
import type { NotificationItem as NotificationData } from '../../types/etudiant';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ScreenProps {
  onBack: () => void;
  convocationReady: boolean;
  defenseCompleted?: boolean;
  onNavigate: (screen: string) => void;
}

// ─── Sous-composant NotificationItem (vue pure) ───────────────────────────────

interface NotificationItemProps {
  notification: NotificationData;
  style: NotificationStyle;
  isImportant: boolean;
  onRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  style: notifStyle,
  isImportant,
  onRead,
}) => (
  <Pressable
    onPress={() => onRead(notification.id)}
    style={({ pressed }) => [
      styles.notificationItem,
      isImportant && { borderLeftColor: notifStyle.color, borderLeftWidth: 3 },
      pressed && { opacity: 0.8 },
    ]}
  >
    <View style={styles.iconContainer}>
      <Ionicons name={notifStyle.icon} size={22} color={notifStyle.color} />
      {!notification.lue && <View style={styles.notificationDot} />}
    </View>
    <View style={styles.notificationContent}>
      <View style={styles.notificationHeader}>
        <View style={[styles.typeBadge, { backgroundColor: notifStyle.color }]}>
          <Text style={styles.typeBadgeText}>{notifStyle.label}</Text>
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

// ─── View ─────────────────────────────────────────────────────────────────────

const NotificationsScreen: React.FC<ScreenProps> = ({
  onBack,
  convocationReady,
  defenseCompleted = false,
  onNavigate,
}) => {
  const vm = useNotificationsViewModel(convocationReady, defenseCompleted);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Notifications" showBackButton onBackPress={onBack} showNotification />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationsList}>
          {vm.notifications.length ? (
            vm.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                style={vm.getNotificationStyle(notification.type)}
                isImportant={vm.isImportantNotification(notification.type)}
                onRead={vm.markAsRead}
              />
            ))
          ) : (
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FF' },
  scrollView: { flex: 1 },
  notificationsList: { padding: 20 },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  notificationContent: { flex: 1 },
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
  emptyText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    padding: 20,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
