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
        {/* Description du mémoire */}
        <View style={styles.thesisCard}>
          <Text style={styles.cardTitle}>Description du mémoire</Text>
          <Text style={styles.thesisTitle}>{thesisData.title}</Text>
          
          <View style={[styles.statusBadge, submittedTheme ? styles.statusValid : styles.statusPending]}>
            <Text style={styles.statusBadgeText}>{thesisData.status}</Text>
          </View>
        </View>

        {/* Résumé (Abstract) */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Résumé (Abstract)</Text>
          <Text style={styles.summaryText}>{thesisData.summary}</Text>
        </View>

        {/* État du dépôt du fichier */}
        <View style={styles.depositCard}>
          <Text style={styles.cardTitle}>État du dépôt</Text>
          
          <View style={styles.depositRow}>
            <View style={styles.depositItem}>
              <Text style={styles.depositLabel}>Spécialité</Text>
              <Text style={styles.depositValue}>{thesisData.specialty}</Text>
            </View>
          </View>

          <View style={styles.depositRow}>
            <View style={styles.depositItem}>
              <Text style={styles.depositLabel}>Directeur</Text>
              <Text style={styles.depositValue}>{thesisData.director}</Text>
            </View>
          </View>

          <View style={styles.depositRow}>
            <View style={styles.depositItem}>
              <Text style={styles.depositLabel}>Co-directeur</Text>
              <Text style={styles.depositValue}>{thesisData.coDirector}</Text>
            </View>
          </View>

          <View style={styles.depositRow}>
            <View style={styles.depositItem}>
              <Text style={styles.depositLabel}>Date de dépôt</Text>
              <Text style={styles.depositValue}>{thesisData.depositDate}</Text>
            </View>
          </View>

          <View style={styles.depositStatusRow}>
            <Text style={styles.depositStatusLabel}>Statut du fichier</Text>
            <View style={[styles.depositStatusBadge, submittedTheme ? styles.statusValid : styles.statusPending]}>
              <Text style={styles.depositStatusText}>{submittedTheme ? 'Déposé et validé' : 'Non déposé'}</Text>
            </View>
          </View>
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
  statusValid: {
    backgroundColor: '#10B981',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  depositCard: {
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
  depositRow: {
    marginBottom: 16,
  },
  depositItem: {
    flex: 1,
  },
  depositLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  depositValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1F4E',
    fontFamily: 'Inter-SemiBold',
  },
  depositStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAF4FF',
  },
  depositStatusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1F4E',
    fontFamily: 'Inter-SemiBold',
  },
  depositStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  depositStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});

export default MyThesisScreen;
