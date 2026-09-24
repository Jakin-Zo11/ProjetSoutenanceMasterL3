import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
}

interface ActivityItemProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  time: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon} size={24} color="#1A4BA8" />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, time, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityDot, { backgroundColor: color }]}>
      <Ionicons name={icon} size={18} color="#FFFFFF" />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);

const AdminHomeScreen: React.FC = () => {
  const [stats] = useState([
    { title: 'Étudiants', value: '128', icon: 'school-outline', color: '#95C5F2' },
    { title: 'Enseignants', value: '34', icon: 'people-outline', color: '#95C5F2' },
    { title: 'Soutenances', value: '42', icon: 'calendar-outline', color: '#95C5F2' },
    { title: 'PV Générés', value: '18', icon: 'document-text-outline', color: '#95C5F2' },
  ]);

  const [activities] = useState([
    { icon: 'checkmark-circle-outline', title: 'Validation dépôt mémoire - Rakoto Jean', time: 'Il y a 5 min', color: '#10B981' },
    { icon: 'create-outline', title: 'Affectation jury - Soutenance #42', time: 'Il y a 15 min', color: '#95C5F2' },
    { icon: 'notifications-outline', title: 'Envoi convocation - Étudiant #128', time: 'Il y a 1 heure', color: '#F59E0B' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050840" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../../assets/images/Logo-emit.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Espace Administration</Text>
                <Text style={styles.headerSubtitle}>EMIT Fianarantsoa</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.avatarBadge}>
              <Text style={styles.avatarInitial}>N</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard {...stats[0]} />
            <StatCard {...stats[1]} />
          </View>
          <View style={styles.statsRow}>
            <StatCard {...stats[2]} />
            <StatCard {...stats[3]} />
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>État Système</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Opérationnel</Text>
            </View>
          </View>
          <View style={styles.statusContent}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusLabel}>API v1</Text>
              <Text style={styles.statusValue}>Actif</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusLabel}>Serveur Laravel</Text>
              <Text style={styles.statusValue}>En ligne</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Activités Récentes</Text>
          <View style={styles.activitiesList}>
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF3FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#050840',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#95C5F2',
  },
  avatarBadge: {
    width: 50,
    height: 50,
    backgroundColor: '#95C5F2',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
    elevation: 8,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#050840',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EBF3FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#050840',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#95C5F2',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#050840',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusContent: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050840',
  },
  activitiesContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#050840',
    marginBottom: 16,
  },
  activitiesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF3FA',
  },
  activityDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050840',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default AdminHomeScreen;
