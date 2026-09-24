import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  Pressable,
} from 'react-native';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import { studentTabItems, navigateStudentTab } from './studentNavigation';

interface ScreenProps { onBack: () => void; onNavigate: (screen: string) => void }

const MyPvScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const pvData = {
    isAvailable: true,
  };

  if (!pvData.isAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
        <TopBar title="PV de soutenance" showBackButton onBackPress={onBack} showNotification />
        
        <View style={styles.waitingContainer}>
          <Ionicons name="document-text-outline" size={48} color="#1A4BA8" />
          <Text style={styles.waitingTitle}>PV non disponible</Text>
          <Text style={styles.waitingSubtitle}>
            Le procès-verbal sera disponible après la clôture de la soutenance
          </Text>
        </View>

        <BottomNav
          items={studentTabItems}
          activeTab=""
          onTabChange={(tab) => navigateStudentTab(tab, onNavigate)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="PV de soutenance" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* PV Info Card */}
        <View style={styles.pvCard}>
          <View style={styles.pvHeader}>
            <Image
              source={require('../../assets/images/Logo-emit.png')}
              style={styles.emitLogo}
              resizeMode="contain"
            />
            <Text style={styles.emitSubtitle}>École de Management et d’Innovation Technologique</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pvSection}>
            <Text style={styles.pvTitle}>PROCÈS-VERBAL DE SOUTENANCE</Text>
            <Text style={styles.pvSubtitle}>Mémoire de fin d’études - Master 2</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pvInfo}>
            <Text style={styles.pvLabel}>Étudiant</Text>
            <Text style={styles.pvValue}>Rakoto Jean</Text>
            <Text style={styles.pvMatricule}>MAT-2024-001</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pvInfo}>
            <Text style={styles.pvLabel}>Note finale</Text>
            <Text style={styles.pvGrade}>16.5 / 20</Text>
            <Text style={styles.pvMention}>Mention : Très Bien</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pvInfo}>
            <Text style={styles.pvLabel}>Décision</Text>
            <View style={[styles.decisionBadge, styles.admitted]}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.decisionBadgeText}>ADMIS</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.pvFooter}>
            <Text style={styles.pvFooterText}>Document officiel - Signé électroniquement</Text>
            <Text style={styles.pvFooterDate}>Généré le 20 Décembre 2024</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8 }]}>
            <Text style={styles.primaryButtonText}>📥 Télécharger PDF</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}>
            <Text style={styles.secondaryButtonText}>📤 Partager</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav
        items={studentTabItems}
        activeTab="result"
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
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  waitingIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D1F4E',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  waitingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  pvCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 20,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.06)',
    elevation: 4,
  },
  pvHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emitLogo: {
    height: 40,
    marginBottom: 4,
    width: 120,
  },
  emitSubtitle: {
    fontSize: 14,
    color: '#1A4BA8',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAF4FF',
    marginVertical: 16,
  },
  pvSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pvTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D1F4E',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    marginBottom: 4,
  },
  pvSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  pvInfo: {
    marginBottom: 16,
  },
  pvLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  pvValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1F4E',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 4,
  },
  pvMatricule: {
    fontSize: 14,
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
  pvGrade: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0D1F4E',
    fontFamily: 'JetBrainsMono-Bold',
    marginBottom: 4,
  },
  pvMention: {
    fontSize: 16,
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
  decisionBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  admitted: {
    backgroundColor: '#10B981',
  },
  decisionBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  pvFooter: {
    alignItems: 'center',
  },
  pvFooterText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  pvFooterDate: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1A4BA8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(26,75,168,0.3)',
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A4BA8',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
});

export default MyPvScreen;
