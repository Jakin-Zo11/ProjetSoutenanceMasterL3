import React from 'react';
import { Colors } from '../../constants/theme';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { juryTabItems, juryTabBadges, JURY_ACCENT_RED } from './juryNavigation';

interface ScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

// Données locales (Mock Data) — profil statique de l'enseignant évaluateur.
const teacherProfile = {
  initials: 'HA',
  name: 'Prof. Hery Andrianjafy',
  grade: 'Professeur chargé de cours',
  department: 'Département Informatique',
  role: 'Évaluateur / Membre du jury',
  email: 'hery.andrianjafy@emit.mg',
  phone: '+261 34 00 000 01',
  speciality: 'Systèmes d’information',
};

const JuryProfileScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.navy} />
      <TopBar title="Mon profil" showBackButton onBackPress={onBack} showNotification />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{teacherProfile.initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.teacherName}>{teacherProfile.name}</Text>
            <Text style={styles.teacherGrade}>{teacherProfile.grade}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{teacherProfile.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informations enseignant</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom complet</Text>
            <Text style={styles.infoValue}>{teacherProfile.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grade</Text>
            <Text style={styles.infoValue}>{teacherProfile.grade}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Département</Text>
            <Text style={styles.infoValue}>{teacherProfile.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Spécialité</Text>
            <Text style={styles.infoValue}>{teacherProfile.speciality}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{teacherProfile.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{teacherProfile.phone}</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="profile"
        badges={juryTabBadges}
        accentColor={JURY_ACCENT_RED}
        onTabChange={(tab) => {
          if (tab === 'home') onNavigate('jury');
          else if (tab === 'defenses') onNavigate('jury-students');
          else if (tab === 'evaluations') onNavigate('jury-history');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.surface },
  scrollView: { flex: 1 },
  profileHeader: {
    backgroundColor: Colors.light.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.light.sky,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginRight: 16,
    width: 80,
  },
  avatarInitials: {
    color: Colors.light.white,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 30,
    fontWeight: '700',
  },
  profileInfo: { flex: 1 },
  teacherName: {
    color: Colors.light.white,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  teacherGrade: {
    color: Colors.light.sky,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.sky,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.light.white,
    borderColor: Colors.light.border,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 4,
    margin: 20,
    marginTop: -24,
    padding: 20,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    color: Colors.light.navy,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  infoRow: { marginBottom: 16 },
  infoLabel: {
    color: Colors.light.muted,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: Colors.light.navy,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JuryProfileScreen;