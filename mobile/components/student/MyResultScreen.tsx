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

interface ScreenProps { onBack: () => void; onNavigate: (screen: string) => void }

const MyResultScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  // Données locales (Mock Data) — aucune requête réseau.
  const resultData = {
    isAvailable: true,
    finalGrade: 16.5,
    mention: 'Très Bien',
    isAdmitted: true,
    memoStatus: 'Validé le 10 Décembre 2024',
    advisorApproval: 'Favorable',
    juryGrades: [
      { role: 'Président', name: 'Prof. Randriamanana', grade: 17 },
      { role: 'Rapporteur', name: 'Dr. Rasoarimanana', grade: 16 },
      { role: 'Examinateur', name: 'Prof. Rakoto', grade: 16.5 },
    ],
  };

  if (!resultData.isAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
        <TopBar title="Mon résultat" showBackButton onBackPress={onBack} showNotification />
        
        <View style={styles.waitingContainer}>
          <Ionicons name="hourglass-outline" size={48} color="#1A4BA8" />
          <Text style={styles.waitingTitle}>En attente de délibération</Text>
          <Text style={styles.waitingSubtitle}>
            Les résultats seront disponibles après la réunion du jury
          </Text>
 <Text style={styles.waitingDate}>Prévu : 22 Décembre 2024</Text>
        </View>

        <BottomNav
          items={studentTabItems}
          activeTab="result"
          onTabChange={(tab) => navigateStudentTab(tab, onNavigate)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Mon résultat" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Final Grade Card */}
        <View style={styles.gradeCard}>
          <Text style={styles.gradeLabel}>Note finale</Text>
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeValue}>{resultData.finalGrade}</Text>
            <Text style={styles.gradeMax}>/20</Text>
          </View>
          
          <View style={styles.mentionBadge}>
            <Text style={styles.mentionBadgeText}>{resultData.mention}</Text>
          </View>

          <View style={[styles.admissionBadge, resultData.isAdmitted ? styles.admitted : styles.failed]}>
            <Ionicons
              name={resultData.isAdmitted ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.admissionBadgeText}>{resultData.isAdmitted ? 'Admis' : 'Ajourné'}</Text>
          </View>
        </View>

        {/* Mémoire Validation Status */}
        <View style={styles.juryGradesCard}>
          <Text style={styles.cardTitle}>Statut de validation du mémoire</Text>
          <View style={styles.averageRow}>
            <Text style={styles.averageLabel}>Dépôt du mémoire</Text>
            <Text style={styles.averageResult}>{resultData.memoStatus}</Text>
          </View>
          <View style={styles.averageRow}>
            <Text style={styles.averageLabel}>Avis de l’encadreur</Text>
            <Text style={styles.averageResult}>{resultData.advisorApproval}</Text>
          </View>
          <View style={[styles.admissionBadge, styles.admitted]}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.admissionBadgeText}>Mémoire validé</Text>
          </View>
        </View>

        {/* Jury Grades Card */}
        <View style={styles.juryGradesCard}>
          <Text style={styles.cardTitle}>Notes du jury</Text>
          
          {resultData.juryGrades.map((jury, index) => (
            <View key={index} style={styles.juryGradeRow}>
              <View style={styles.juryGradeInfo}>
                <Text style={styles.juryRole}>{jury.role}</Text>
                <Text style={styles.juryName}>{jury.name}</Text>
              </View>
              <View style={styles.juryGradeBadge}>
                <Text style={styles.juryGradeValue}>{jury.grade}</Text>
                <Text style={styles.juryGradeMax}>/20</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Average Calculation */}
        <View style={styles.averageCard}>
          <Text style={styles.cardTitle}>Moyenne pondérée</Text>
          <View style={styles.averageRow}>
            <Text style={styles.averageLabel}>Calcul</Text>
            <Text style={styles.averageCalc}>
              ({resultData.juryGrades.map(g => g.grade).join(' + ')}) / {resultData.juryGrades.length}
            </Text>
          </View>
          <View style={styles.averageRow}>
            <Text style={styles.averageLabel}>Résultat</Text>
            <Text style={styles.averageResult}>{resultData.finalGrade} / 20</Text>
          </View>
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
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  waitingDate: {
    fontSize: 14,
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 20,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.06)',
    elevation: 4,
  },
  gradeLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  gradeValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#0D1F4E',
    fontFamily: 'JetBrainsMono-Bold',
  },
  gradeMax: {
    fontSize: 24,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'JetBrainsMono-Regular',
  },
  mentionBadge: {
    backgroundColor: '#1A4BA8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  mentionBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  admissionBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  admitted: {
    backgroundColor: '#10B981',
  },
  failed: {
    backgroundColor: '#EF4444',
  },
  admissionBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  juryGradesCard: {
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
  averageCard: {
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
  juryGradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF4FF',
  },
  juryGradeInfo: {
    flex: 1,
  },
  juryRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A4BA8',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  juryName: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  juryGradeBadge: {
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  juryGradeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D1F4E',
    fontFamily: 'JetBrainsMono-Bold',
  },
  juryGradeMax: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
    fontFamily: 'JetBrainsMono-Regular',
  },
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  averageLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  averageCalc: {
    fontSize: 14,
    color: '#0D1F4E',
    fontFamily: 'JetBrainsMono-Regular',
  },
  averageResult: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1F4E',
    fontFamily: 'JetBrainsMono-Bold',
  },
});

export default MyResultScreen;
