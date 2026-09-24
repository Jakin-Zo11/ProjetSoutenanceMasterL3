import React from 'react';
import {
  Colors } from '../../constants/theme';
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
import { Ionicons } from '@expo/vector-icons';

interface ScreenProps {
  onBack: () => void;
}

const SubmissionConfirmationScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const evaluationData = {
    finalGrade: 14.8,
    decision: 'Admis',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.navy} />
      <TopBar title="Confirmation" showBackButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={42} color={Colors.light.white} />
          </View>
          <Text style={styles.successTitle}>Évaluation soumise avec succès</Text>
          <Text style={styles.successSubtitle}>
            Votre évaluation a été enregistrée et transmise à l’administration
          </Text>
        </View>

        {/* Final Grade Card */}
        <View style={styles.gradeCard}>
          <Text style={styles.cardTitle}>Moyenne finale</Text>
          <View style={styles.gradeDisplay}>
            <Text style={styles.gradeValue}>{evaluationData.finalGrade}</Text>
            <Text style={styles.gradeMax}>/20</Text>
          </View>
          
          <View style={[styles.decisionBadge, styles.admitted]}>
            <Ionicons name="checkmark" size={16} color={Colors.light.white} />
            <Text style={styles.decisionBadgeText}>{evaluationData.decision}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informations</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date de soumission</Text>
            <Text style={styles.infoValue}>20 Décembre 2024 à 10:30</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Statut</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Soumis</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Prochaines étapes</Text>
            <Text style={styles.infoDescription}>
              L’évaluation sera consolidée avec les autres membres du jury pour déterminer la note finale et la mention.
            </Text>
          </View>
        </View>

        {/* Back Button */}
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}>
          <Ionicons name="arrow-back" size={18} color={Colors.light.primary} />
          <Text style={styles.backButtonText}>Retour à la liste des étudiants</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  scrollView: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.light.white,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.navy,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  gradeCard: {
    backgroundColor: Colors.light.white,
    margin: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.navy,
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  gradeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  gradeValue: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.light.navy,
    fontFamily: 'JetBrainsMono-Bold',
  },
  gradeMax: {
    fontSize: 24,
    color: Colors.light.tabIconDefault,
    marginLeft: 4,
    fontFamily: 'JetBrainsMono-Regular',
  },
  decisionBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  admitted: {
    backgroundColor: Colors.light.success,
  },
  decisionBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
  },
  infoCard: {
    backgroundColor: Colors.light.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.navy,
    fontFamily: 'Inter-SemiBold',
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  statusBadge: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    fontFamily: 'Inter-SemiBold',
  },
  backButton: {
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    fontFamily: 'Inter-SemiBold',
  },
});

export default SubmissionConfirmationScreen;
