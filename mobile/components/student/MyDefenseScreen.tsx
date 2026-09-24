import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { studentTabItems, navigateStudentTab } from './studentNavigation';

interface JuryMemberProps {
  name: string;
  role: string;
  isNew?: boolean;
}

const JuryMember: React.FC<JuryMemberProps> = ({ name, role, isNew }) => (
  <View style={styles.juryMember}>
    <View style={styles.juryMemberInfo}>
      <Text style={styles.juryMemberName}>{name}</Text>
      <Text style={styles.juryMemberRole}>{role}</Text>
    </View>
    {isNew && (
      <View style={styles.newBadge}>
        <Text style={styles.newBadgeText}>Nouveau</Text>
      </View>
    )}
  </View>
);

interface ScreenProps { onBack: () => void; onNavigate: (screen: string) => void }

const MyDefenseScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const defenseData = {
    isReprogrammed: true,
    oldDate: '15 Déc 2024',
    oldTime: '14:00',
    oldRoom: 'Salle B203',
    newDate: '20 Déc 2024',
    newTime: '09:00',
    newRoom: 'Salle A101',
    campus: 'Campus Principal',
    jury: [
      { name: 'Prof. Randriamanana', role: 'Président', isNew: false },
      { name: 'Dr. Rasoarimanana', role: 'Rapporteur', isNew: true },
      { name: 'Prof. Rakoto', role: 'Examinateur', isNew: false },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Ma soutenance" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Reprogrammed Banner */}
        {defenseData.isReprogrammed && (
          <View style={styles.reprogrammedBanner}>
            <View style={styles.reprogrammedTitleRow}>
              <Ionicons name="warning-outline" size={18} color="#92400E" />
              <Text style={styles.reprogrammedBannerTitle}>Reprogrammée</Text>
            </View>
            <View style={styles.reprogrammedInfo}>
              <View style={styles.reprogrammedItem}>
                <Text style={styles.reprogrammedLabel}>Ancien créneau</Text>
                <Text style={styles.reprogrammedValue}>{defenseData.oldDate} à {defenseData.oldTime}</Text>
                <Text style={styles.reprogrammedRoom}>{defenseData.oldRoom}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#F59E0B" />
              <View style={styles.reprogrammedItem}>
                <Text style={styles.reprogrammedLabel}>Nouveau créneau</Text>
                <Text style={styles.reprogrammedValue}>{defenseData.newDate} à {defenseData.newTime}</Text>
                <Text style={styles.reprogrammedRoom}>{defenseData.newRoom}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Defense Info Card */}
        <View style={styles.defenseCard}>
          <Text style={styles.cardTitle}>Informations de soutenance</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{defenseData.newDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Heure</Text>
              <Text style={styles.infoValue}>{defenseData.newTime}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Salle</Text>
              <Text style={styles.infoValue}>{defenseData.newRoom}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Campus</Text>
              <Text style={styles.infoValue}>{defenseData.campus}</Text>
            </View>
          </View>
        </View>

        {/* Jury Card */}
        <View style={styles.juryCard}>
          <Text style={styles.cardTitle}>Composition du jury</Text>
          
          {defenseData.jury.map((member, index) => (
            <JuryMember key={index} {...member} />
          ))}
        </View>
      </ScrollView>

      <BottomNav
        items={studentTabItems}
        activeTab="defense"
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
  reprogrammedBanner: {
    backgroundColor: '#FEF3C7',
    margin: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  reprogrammedBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  reprogrammedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reprogrammedItem: {
    flex: 1,
  },
  reprogrammedLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  reprogrammedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    fontFamily: 'Inter-SemiBold',
  },
  reprogrammedRoom: {
    fontSize: 12,
    color: '#B45309',
    fontFamily: 'Inter-Regular',
  },
  reprogrammedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defenseCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  juryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1F4E',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  juryMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF4FF',
  },
  juryMemberInfo: {
    flex: 1,
  },
  juryMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1F4E',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  juryMemberRole: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  newBadge: {
    backgroundColor: '#2D84E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});

export default MyDefenseScreen;
