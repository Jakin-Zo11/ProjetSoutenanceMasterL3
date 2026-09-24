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
import { studentTabItems, navigateStudentTab } from './studentNavigation';

interface ScreenProps { onBack: () => void; submittedTheme?: string; onNavigate: (screen: string) => void }

const MyThesisScreen: React.FC<ScreenProps> = ({ onBack, submittedTheme, onNavigate }) => {
  const thesisData = {
    title: submittedTheme || 'Aucun thème enregistré',
    specialty: 'Informatique - Systèmes et Réseaux',
    director: 'Prof. Randriamanana',
    coDirector: 'Dr. Rasoarimanana',
    depositDate: '15 Novembre 2024',
    status: submittedTheme ? 'Validé' : 'À renseigner',
    summary: 'Ce mémoire propose une solution numérique pour la gestion complète du processus de soutenances à l\'EMIT. Le système permet aux étudiants de déposer leurs travaux, aux jurys d\'évaluer en ligne, et à l\'administration de suivre l\'ensemble du processus de manière centralisée et sécurisée.',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Mon sujet de thèse" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Thesis Title Card */}
        <View style={styles.thesisCard}>
          <Text style={styles.cardTitle}>Intitulé du mémoire</Text>
          <Text style={styles.thesisTitle}>{thesisData.title}</Text>
          
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{thesisData.status}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informations</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Spécialité</Text>
              <Text style={styles.infoValue}>{thesisData.specialty}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Directeur</Text>
              <Text style={styles.infoValue}>{thesisData.director}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Co-directeur</Text>
              <Text style={styles.infoValue}>{thesisData.coDirector}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date de dépôt</Text>
              <Text style={styles.infoValue}>{thesisData.depositDate}</Text>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Résumé</Text>
          <Text style={styles.summaryText}>{thesisData.summary}</Text>
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
  thesisCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 20,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  infoCard: {
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
  summaryCard: {
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
  thesisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1F4E',
    lineHeight: 26,
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
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
  summaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
});

export default MyThesisScreen;
