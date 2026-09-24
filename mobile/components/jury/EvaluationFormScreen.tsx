import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { juryTabItems, juryTabBadges, JURY_ACCENT_RED } from './juryNavigation';
import { Colors, Fonts } from '../../constants/theme';

interface ScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  onSubmitted?: (evaluation: JuryEvaluation) => void;
  evaluatedEvaluation?: JuryEvaluation;
  defense?: {
    studentId: string;
    studentName: string;
    thesisTitle: string;
    date: string;
    time: string;
    room: string;
    program?: string;
    defenseId?: string;
  };
}

type CriterionKey = 'oralPresentation' | 'memoryContent' | 'subjectMastery';
// TODO: remplacer les données de formulaire locales par les données de l'API Jury.
type JuryEvaluation = {
  studentName: string;
  date: string;
  scores: Record<CriterionKey, string>;
  remarks: string;
  average: number;
  mention: string;
  evaluee: true;
};

// Données locales (Mock Data) — aucune requête réseau.
const defaultDefense = {
  studentId: '001M24',
  studentName: 'Alice Martin',
  program: 'Master 2 - Informatique',
  thesisTitle: 'Plateforme web de gestion des soutenances à l’EMIT',
  defenseId: 'SOUT-2024-001',
  date: '15 Décembre',
  time: '09:00',
  room: 'Salle A-101',
};

const criteriaLabels: Record<CriterionKey, string> = {
  oralPresentation: 'Qualité de la présentation orale',
  memoryContent: 'Contenu et structure du mémoire',
  subjectMastery: 'Maîtrise du sujet et réponses aux questions',
};

const clampScore = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  if (Number.isNaN(parsed)) return 0;
  return Math.min(20, Math.max(0, parsed));
};

const getMention = (average: number) => {
  if (average < 10) return { label: 'Ajourné / Rattrapage', color: Colors.light.error };
  if (average >= 16) return { label: 'Très Bien', color: Colors.light.primary };
  if (average >= 14) return { label: 'Bien', color: Colors.light.primary };
  return { label: 'Assez Bien', color: Colors.light.sky };
};

const EvaluationFormScreen: React.FC<ScreenProps> = ({ onBack, onNavigate, onSubmitted, defense: selectedDefense, evaluatedEvaluation }) => {
  const defense = selectedDefense ?? defaultDefense;
  const [scores, setScores] = useState<Record<CriterionKey, string>>(
    evaluatedEvaluation?.scores ?? {
      oralPresentation: '15',
      memoryContent: '14',
      subjectMastery: '16',
    },
  );
  const [remarks, setRemarks] = useState(evaluatedEvaluation?.remarks ?? '');
  const [showCriteria, setShowCriteria] = useState(true);

  const average = useMemo(() => {
    const values = Object.values(scores).map(clampScore);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [scores]);
  const mention = getMention(average);
  const isEvaluated = Boolean(evaluatedEvaluation?.evaluee);

  const updateScore = (key: CriterionKey, value: string) => {
    setScores((current) => ({ ...current, [key]: value.replace(/[^0-9.,]/g, '') }));
  };

  const saveDraft = () => {
    console.log('Evaluation draft saved:', { defense, scores, remarks });
    Alert.alert('Brouillon sauvegardé', 'Votre saisie a été enregistrée localement.');
  };

  const confirmSubmit = () => {
    Alert.alert(
      'Confirmer la transmission',
      'Voulez-vous valider et transmettre définitivement ce procès-verbal ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: () => {
            const evaluation: JuryEvaluation = {
              studentName: defense.studentName,
              date: defense.date,
              scores,
              remarks,
              average,
              mention: mention.label,
              evaluee: true,
            };
            console.log('Evaluation submitted:', { defense, ...evaluation });
            Alert.alert('Évaluation transmise', 'Le procès-verbal a été généré et transmis avec succès.', [
              {
                text: 'Continuer',
                onPress: () => {
                  if (onSubmitted) {
                    onSubmitted(evaluation);
                  } else {
                    onBack();
                  }
                },
              },
            ]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.tint} />
      <TopBar title="Fiche d’évaluation" showBackButton onBackPress={onBack} showNotification={false} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>{defense.studentName.charAt(0)}</Text>
            </View>
            <View style={styles.studentCopy}>
              <Text style={styles.studentName}>{defense.studentName}</Text>
              <Text style={styles.program}>{defense.program ?? 'Master 2 - Informatique'}</Text>
            </View>
          </View>
          <Text style={styles.fieldLabel}>Thème du mémoire</Text>
          <Text style={styles.thesisTitle}>{defense.thesisTitle}</Text>
          <Text style={styles.defenseId}>{defense.defenseId ?? defense.studentId}</Text>
          <View style={styles.logistics}>
            <Text style={styles.logisticsText}>{defense.date}</Text>
            <Text style={styles.logisticsText}>{defense.time}</Text>
            <Text style={styles.logisticsText}>{defense.room}</Text>
          </View>
        </View>

        <View style={styles.criteriaCard}>
          <Pressable onPress={() => setShowCriteria((visible) => !visible)} style={({ pressed }) => [styles.criteriaButton, pressed && { opacity: 0.8 }]}>
            <Ionicons name="list-outline" size={18} color={Colors.light.primary} />
            <Text style={styles.criteriaButtonText}>Consulter la grille d’évaluation</Text>
            <Ionicons name={showCriteria ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color={Colors.light.primary} />
          </Pressable>
          {showCriteria && <View style={styles.criteriaContent}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Grille de notation</Text>
            <Text style={styles.sectionHint}>Chaque critère est noté sur 20</Text>
          </View>
          {(Object.keys(criteriaLabels) as CriterionKey[]).map((key) => (
            <View key={key} style={styles.criterionRow}>
              <Text style={styles.criterionLabel}>{criteriaLabels[key]}</Text>
              <View style={styles.scoreInputContainer}>
                <TextInput
                  value={scores[key]}
                  onChangeText={(value) => updateScore(key, value)}
                  editable={!isEvaluated}
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.scoreInput}
                  selectTextOnFocus
                />
                <Text style={styles.scoreMax}>/20</Text>
              </View>
            </View>
          ))}
          </View>}
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Moyenne finale</Text>
          <View style={styles.averageRow}>
            <Text style={styles.averageValue}>{average.toFixed(1)}</Text>
            <Text style={styles.averageMax}>/20</Text>
          </View>
          <View style={[styles.mentionBadge, { backgroundColor: mention.color }]}>
            <Text style={styles.mentionText}>{mention.label}</Text>
          </View>
        </View>

        <View style={styles.remarksCard}>
          <Text style={styles.sectionTitle}>Appréciation et remarques</Text>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            editable={!isEvaluated}
            style={styles.remarksInput}
            placeholder="Saisissez les observations, remarques du jury ou corrections à apporter au mémoire..."
            placeholderTextColor={Colors.light.icon}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          {!isEvaluated && (
            <>
              <Pressable onPress={saveDraft} style={({ pressed }) => [styles.draftButton, pressed && { opacity: 0.8 }]}>
                <Ionicons name="save-outline" size={18} color={Colors.light.primary} />
                <Text style={styles.draftButtonText}>Sauvegarder brouillon</Text>
              </Pressable>
              <Pressable onPress={confirmSubmit} style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.8 }]}>
                <Ionicons name="checkmark-circle-outline" size={19} color={Colors.light.background} />
                <Text style={styles.submitButtonText}>Valider & transmettre le PV</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
      <BottomNav
        items={juryTabItems}
        activeTab="evaluations"
        badges={juryTabBadges}
        accentColor={JURY_ACCENT_RED}
        onTabChange={(tab) => {
          if (tab === 'home') onBack();
          if (tab === 'defenses') onNavigate?.('jury-students');
          if (tab === 'evaluations') onNavigate?.('jury-history');
          if (tab === 'profile') onNavigate?.('jury-profile');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: 20, paddingBottom: 32 },
  summaryCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  summaryHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: 16 },
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  studentAvatarText: { color: Colors.light.background, fontSize: 20, fontWeight: '700' },
  studentCopy: { flex: 1 },
  studentName: { color: Colors.light.tint, fontFamily: Fonts?.sans, fontSize: 18, fontWeight: '700' },
  program: { color: Colors.light.icon, fontFamily: Fonts?.sans, fontSize: 13, marginTop: 3 },
  fieldLabel: { color: Colors.light.icon, fontFamily: Fonts?.sans, fontSize: 11, marginBottom: 4 },
  thesisTitle: { color: Colors.light.tint, fontFamily: Fonts?.sans, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  defenseId: { color: Colors.light.icon, fontFamily: Fonts?.mono, fontSize: 11, marginBottom: 12 },
  logistics: { borderTopColor: Colors.light.border, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12 },
  logisticsText: { color: Colors.light.icon, fontFamily: Fonts?.mono, fontSize: 11 },
  criteriaCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  sectionHeading: { marginBottom: 16 },
  criteriaButton: { alignItems: 'center', borderColor: Colors.light.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, padding: 12 },
  criteriaButtonText: { color: Colors.light.primary, flex: 1, fontFamily: Fonts?.sans, fontSize: 13, fontWeight: '700', marginHorizontal: 8 },
  criteriaContent: { borderTopColor: Colors.light.border, borderTopWidth: 1, paddingTop: 4 },
  sectionTitle: { color: Colors.light.tint, fontFamily: Fonts?.sans, fontSize: 17, fontWeight: '700' },
  sectionHint: { color: Colors.light.icon, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 4 },
  criterionRow: { borderTopColor: Colors.light.border, borderTopWidth: 1, paddingVertical: 14 },
  criterionLabel: { color: Colors.light.tint, fontFamily: Fonts?.sans, fontSize: 14, lineHeight: 19, marginBottom: 8 },
  scoreInputContainer: { alignItems: 'center', flexDirection: 'row' },
  scoreInput: {
    borderColor: Colors.light.sky,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.light.tint,
    fontFamily: Fonts?.mono,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 62,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'center',
  },
  scoreMax: { color: Colors.light.icon, fontFamily: Fonts?.mono, fontSize: 14, marginLeft: 6 },
  resultCard: { alignItems: 'center', backgroundColor: Colors.light.tint, borderRadius: 12, marginBottom: 16, padding: 20 },
  resultLabel: { color: Colors.light.background, fontFamily: Fonts?.sans, fontSize: 14 },
  averageRow: { alignItems: 'baseline', flexDirection: 'row', marginVertical: 4 },
  averageValue: { color: Colors.light.background, fontFamily: Fonts?.mono, fontSize: 46, fontWeight: '700' },
  averageMax: { color: Colors.light.sky, fontFamily: Fonts?.mono, fontSize: 20, marginLeft: 4 },
  mentionBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  mentionText: { color: Colors.light.background, fontFamily: Fonts?.sans, fontSize: 12, fontWeight: '700' },
  remarksCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  remarksInput: {
    borderColor: Colors.light.border,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    marginTop: 12,
    minHeight: 110,
    padding: 12,
  },
  actions: { gap: 10 },
  draftButton: { alignItems: 'center', borderColor: Colors.light.primary, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', paddingVertical: 14 },
  draftButtonText: { color: Colors.light.primary, fontFamily: Fonts?.sans, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  submitButton: { alignItems: 'center', backgroundColor: Colors.light.primary, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', paddingVertical: 15 },
  submitButtonText: { color: Colors.light.background, fontFamily: Fonts?.sans, fontSize: 14, fontWeight: '700', marginLeft: 8 },
});

export default EvaluationFormScreen;
