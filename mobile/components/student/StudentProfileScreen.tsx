import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import { studentTabItems, navigateStudentTab } from './studentNavigation';

interface ScreenProps { onBack: () => void; onNavigate: (screen: string) => void }

// Données locales (Mock Data) — aucune requête réseau.
const StudentProfileScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const studentData = {
    initials: 'RJ',
    name: 'Rakoto Jean',
    filiere: 'Master 2 - Informatique',
    niveau: 'M2 (Master 2)',
    matricule: 'MAT-2024-001',
    email: 'rakoto.jean@emit.mg',
    phone: '+261 34 00 000 00',
    promotion: '2024-2025',
    department: 'Département Informatique',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Mon profil" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{studentData.initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.studentName}>{studentData.name}</Text>
            <Text style={styles.studentFiliere}>{studentData.filiere}</Text>
            <View style={styles.studentBadge}>
              <Text style={styles.studentBadgeText}>Étudiant</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informations personnelles</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Matricule</Text>
              <Text style={styles.infoValue}>{studentData.matricule}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Niveau</Text>
              <Text style={styles.infoValue}>{studentData.niveau}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{studentData.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{studentData.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Promotion</Text>
              <Text style={styles.infoValue}>{studentData.promotion}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Département</Text>
              <Text style={styles.infoValue}>{studentData.department}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.8 }]}>
            <Ionicons name="create-outline" size={18} color="#1A4BA8" />
            <Text style={styles.actionButtonText}>Modifier mon profil</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionButton, styles.logoutButton, pressed && { opacity: 0.8 }]}>
            <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav
        items={studentTabItems}
        activeTab="profile"
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
  profileHeader: {
    backgroundColor: '#0D1F4E',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D84E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  studentFiliere: {
    fontSize: 14,
    color: '#2D84E0',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  studentBadge: {
    backgroundColor: '#2D84E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  studentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: -24,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.06)',
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1F4E',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1F4E',
    fontFamily: 'Inter-SemiBold',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  logoutButtonText: {
    color: '#FFFFFF',
  },
});

export default StudentProfileScreen;
