import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { juryTabItems } from './juryNavigation';
import { Colors, Fonts } from '../../constants/theme';
import evaluationApi, { saveJuryNote } from '../../services/evaluationApi';
import { storage } from '../../utils/storage';
import type {
  EvaluationCriterion,
  EvaluationScores,
  JuryEvaluation,
} from '../../types/defenseWorkflow';

const defaultDefense = {
  studentId: '001M24',
  studentMatricule: '001I24',
  studentName: 'Alice Martin',
  program: 'Master 2 - Informatique',
  thesisTitle: "Plateforme web de gestion des soutenances à l'EMIT",
  defenseId: 'SOUT-2024-001',
  date: '11 novembre 2026',
  time: '09:00',
  room: 'Salle A-101',
};

type DefenseData = {
  studentId?: string;
  studentName: string;
  studentMatricule: string;
  program: string;
  thesisTitle: string;
  defenseId: string;
  date: string;
  time: string;
  room: string;
  soutenanceId?: number;
};

type AssignedEvaluation = Awaited<
  ReturnType<typeof evaluationApi.listAssignedEvaluations>
>[number];

const criteriaLabels: Record<EvaluationCriterion, string> = {
  presentation: 'Qualité de la présentation orale',
  technical: 'Contenu et maîtrise technique du mémoire',
  answers: 'Maîtrise du sujet et réponses aux questions',
};

const scoreMaximums: Record<EvaluationCriterion, number> = {
  presentation: 5,
  technical: 10,
  answers: 5,
};

type CriterionKey = EvaluationCriterion;

interface ScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  onSubmitted?: (evaluation: JuryEvaluation) => void;
  onStatusChange?: (evaluation: JuryEvaluation) => void;
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
    studentMatricule?: string;
    soutenanceId?: number;
  };
}

const parseScore = (value: string): number => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMention = (note: number) => {
  if (note < 10) {
    return { label: 'Ajourné / Rattrapage', color: Colors.light.primary };
  }
  if (note >= 16) {
    return { label: 'Très Bien', color: Colors.light.primary };
  }
  if (note >= 14) {
    return { label: 'Bien', color: Colors.light.sky };
  }
  return { label: 'Assez Bien', color: Colors.light.sky };
};

/**
 * Recherche une évaluation existante à partir des données disponibles.
 * L'API ne renvoie pas studentMatricule : on utilise donc le nom et le thème.
 */
const findMatchingEvaluation = (
  evaluations: AssignedEvaluation[],
  studentName: string,
  thesisTitle: string,
): AssignedEvaluation | undefined => {
  const normalize = (value: string) =>
    value.trim().toLocaleLowerCase();

  return evaluations.find(
    (item) =>
      normalize(item.student_name ?? '') === normalize(studentName) &&
      normalize(item.theme ?? '') === normalize(thesisTitle),
  );
};

const EvaluationFormScreen: React.FC<ScreenProps> = ({
  onBack,
  onNavigate,
  onSubmitted,
  onStatusChange,
  defense: selectedDefense,
  evaluatedEvaluation,
}) => {
  const [defenseData, setDefenseData] = useState<DefenseData>(() => ({
    studentId: selectedDefense?.studentId ?? defaultDefense.studentId,
    studentName: selectedDefense?.studentName ?? defaultDefense.studentName,
    studentMatricule:
      selectedDefense?.studentMatricule ?? defaultDefense.studentMatricule,
    program: selectedDefense?.program ?? defaultDefense.program,
    thesisTitle: selectedDefense?.thesisTitle ?? defaultDefense.thesisTitle,
    defenseId: selectedDefense?.defenseId ?? defaultDefense.defenseId,
    date: selectedDefense?.date ?? defaultDefense.date,
    time: selectedDefense?.time ?? defaultDefense.time,
    room: selectedDefense?.room ?? defaultDefense.room,
    soutenanceId: selectedDefense?.soutenanceId,
  }));

  const [scores, setScores] = useState<EvaluationScores>(
    evaluatedEvaluation?.scores ?? {
      presentation: '4',
      technical: '8',
      answers: '4',
    },
  );

  const [remarks, setRemarks] = useState(evaluatedEvaluation?.remarks ?? '');
  const [showCriteria, setShowCriteria] = useState(true);
  const [evaluationStatus, setEvaluationStatus] = useState<'draft' | 'validated'>(
    evaluatedEvaluation?.status ?? 'draft',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDefense = async () => {
      // Les informations transmises par l'écran précédent restent prioritaires.
      setDefenseData((current) => ({
        ...current,
        studentId: selectedDefense?.studentId ?? current.studentId,
        studentName: selectedDefense?.studentName ?? current.studentName,
        studentMatricule:
          selectedDefense?.studentMatricule ?? current.studentMatricule,
        program: selectedDefense?.program ?? current.program,
        thesisTitle: selectedDefense?.thesisTitle ?? current.thesisTitle,
        defenseId: selectedDefense?.defenseId ?? current.defenseId,
        date: selectedDefense?.date ?? current.date,
        time: selectedDefense?.time ?? current.time,
        room: selectedDefense?.room ?? current.room,
        soutenanceId: selectedDefense?.soutenanceId ?? current.soutenanceId,
      }));

      try {
        const token = await storage.getItemAsync('emit_jury_sanctum_token');

        if (!token) {
          return;
        }

        const assigned = await evaluationApi.listAssignedEvaluations(token);

        if (!active || !Array.isArray(assigned)) {
          return;
        }

        const name = selectedDefense?.studentName ?? defaultDefense.studentName;
        const theme = selectedDefense?.thesisTitle ?? defaultDefense.thesisTitle;
        const match = findMatchingEvaluation(assigned, name, theme);

        if (match) {
          setDefenseData((current) => ({
            ...current,
            studentName: match.student_name || current.studentName,
            thesisTitle: match.theme || current.thesisTitle,
            date: match.date || current.date,
            time: match.heure || current.time,
            room: match.salle || current.room,
            soutenanceId: match.soutenance_id,
            defenseId: String(match.soutenance_id),
          }));
        }
      } catch (error) {
        console.warn(
          'Impossible de charger les évaluations assignées :',
          error,
        );
      }
    };

    void loadDefense();

    return () => {
      active = false;
    };
  }, [selectedDefense]);

  const totalScore = useMemo(
    () =>
      (Object.keys(scoreMaximums) as CriterionKey[]).reduce(
        (sum, key) => sum + parseScore(scores[key]),
        0,
      ),
    [scores],
  );

  const mention = getMention(totalScore);
  const isEvaluated = evaluationStatus !== 'draft';

  const updateScore = (key: CriterionKey, value: string) => {
    setScores((current) => ({
      ...current,
      [key]: value.replace(/[^0-9.,]/g, ''),
    }));
  };

  const createEvaluation = (
    status: JuryEvaluation['status'],
  ): JuryEvaluation => ({
    studentName: defenseData.studentName,
    studentMatricule: defenseData.studentMatricule,
    date: defenseData.date,
    scores,
    remarks,
    totalScore,
    mention: mention.label,
    evaluee: true,
    status,
  });

  const saveDraft = () => {
    const evaluation = createEvaluation('draft');
    setEvaluationStatus('draft');
    onStatusChange?.(evaluation);

    Alert.alert(
      'Brouillon',
      "Le brouillon est conservé dans l'écran actuel. Il n'est pas encore enregistré dans le serveur.",
    );
  };

  const submitEvaluation = async () => {
    if (isSubmitting) {
      return;
    }

    const invalidScore = (
      Object.keys(scoreMaximums) as CriterionKey[]
    ).find((key) => {
      const rawValue = scores[key].trim().replace(',', '.');
      const value = Number(rawValue);

      return (
        rawValue === '' ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > scoreMaximums[key]
      );
    });

    if (invalidScore) {
      Alert.alert(
        'Note hors barème',
        `Le critère « ${criteriaLabels[invalidScore]} » doit être compris entre 0 et ${scoreMaximums[invalidScore]}.`,
      );
      return;
    }

    if (totalScore < 0 || totalScore > 20) {
      Alert.alert('Note invalide', 'La note finale doit être comprise entre 0 et 20.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await storage.getItemAsync('emit_jury_sanctum_token');

      if (!token) {
        Alert.alert(
          'Session expirée',
          'Reconnectez-vous avec votre compte Jury avant de soumettre une évaluation.',
        );
        return;
      }

      let soutenanceId = defenseData.soutenanceId;

      // Si l'écran précédent n'a pas transmis l'ID numérique,
      // recherche une évaluation existante correspondante dans l'API.
      if (!soutenanceId) {
        const assigned = await evaluationApi.listAssignedEvaluations(token);
        const match = findMatchingEvaluation(
          assigned,
          defenseData.studentName,
          defenseData.thesisTitle,
        );
        soutenanceId = match?.soutenance_id;
      }

      if (!soutenanceId || !Number.isInteger(Number(soutenanceId))) {
        Alert.alert(
          'Soutenance introuvable',
          "L'ID numérique de la soutenance est manquant. Transmettez soutenanceId depuis l'écran Jury/planning. Aucun enregistrement n'a été envoyé.",
        );
        return;
      }

      // L'API attend : token Sanctum, ID numérique de soutenance,
      // note globale sur 20 et commentaire.
      await saveJuryNote(
        token,
        Number(soutenanceId),
        totalScore,
        remarks.trim() || undefined,
      );

      const evaluation = createEvaluation('validated');
      setEvaluationStatus('validated');
      onStatusChange?.(evaluation);

      if (onSubmitted) {
        onSubmitted(evaluation);
      } else {
        onBack();
      }

      Alert.alert('Succès', "L'évaluation a été enregistrée sur le serveur.");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'évaluation :", error);

      Alert.alert(
        'Erreur',
        "Impossible d'enregistrer l'évaluation. Vérifiez la connexion API, votre session Jury et les autorisations du backend.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.light.tint}
      />

      <TopBar
        title="Fiche d'évaluation"
        showBackButton
        onBackPress={onBack}
        showNotification={false}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {defenseData.studentName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.studentCopy}>
              <Text style={styles.studentName}>{defenseData.studentName}</Text>
              <Text style={styles.program}>{defenseData.program}</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Thème du mémoire</Text>
          <Text style={styles.thesisTitle}>{defenseData.thesisTitle}</Text>
          <Text style={styles.defenseId}>
            {defenseData.defenseId || defenseData.studentMatricule}
          </Text>

          <View style={styles.logistics}>
            <Text style={styles.logisticsText}>{defenseData.date}</Text>
            <Text style={styles.logisticsText}>{defenseData.time}</Text>
            <Text style={styles.logisticsText}>{defenseData.room}</Text>
          </View>
        </View>

        <View style={styles.criteriaCard}>
          <Pressable
            onPress={() => setShowCriteria((visible) => !visible)}
            style={({ pressed }) => [
              styles.criteriaButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={Colors.light.primary}
            />

            <Text style={styles.criteriaButtonText}>
              Consulter la grille d'évaluation
            </Text>

            <Ionicons
              name={showCriteria ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color={Colors.light.primary}
            />
          </Pressable>

          {showCriteria && (
            <View style={styles.criteriaContent}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Grille de notation</Text>
                <Text style={styles.sectionHint}>
                  Présentation /5 · Technique /10 · Réponses /5
                </Text>
              </View>

              {(Object.keys(criteriaLabels) as CriterionKey[]).map((key) => (
                <View key={key} style={styles.criterionRow}>
                  <Text style={styles.criterionLabel}>
                    {criteriaLabels[key]}
                  </Text>

                  <View style={styles.scoreInputContainer}>
                    <TextInput
                      value={scores[key]}
                      onChangeText={(value) => updateScore(key, value)}
                      editable={!isEvaluated && !isSubmitting}
                      keyboardType="decimal-pad"
                      maxLength={4}
                      style={styles.scoreInput}
                    />
                    <Text style={styles.scoreMax}>/{scoreMaximums[key]}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Note globale</Text>

          <View style={styles.averageRow}>
            <Text style={styles.averageValue}>{totalScore.toFixed(1)}</Text>
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
            editable={!isEvaluated && !isSubmitting}
            style={styles.remarksInput}
            placeholder="Saisissez les observations, remarques du jury ou corrections à apporter au mémoire..."
            placeholderTextColor={Colors.light.icon}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          {evaluationStatus === 'draft' && (
            <>
              <Pressable
                onPress={saveDraft}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.draftButton,
                  (pressed || isSubmitting) && styles.pressed,
                ]}
              >
                <Ionicons
                  name="save-outline"
                  size={18}
                  color={Colors.light.primary}
                />
                <Text style={styles.draftButtonText}>
                  Sauvegarder brouillon
                </Text>
              </Pressable>

              <Pressable
                onPress={submitEvaluation}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.submitButton,
                  (pressed || isSubmitting) && styles.pressed,
                ]}
              >
                <Ionicons
                  name="send-outline"
                  size={19}
                  color={Colors.light.background}
                />
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Enregistrement...' : 'Valider & Évaluer'}
                </Text>
              </Pressable>
            </>
          )}

          {evaluationStatus === 'validated' && (
            <View style={styles.validatedBanner}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.light.background}
              />
              <Text style={styles.validatedText}>
                Évaluation enregistrée
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="evaluations"
        accentColor={Colors.light.sky}
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  studentAvatarText: {
    color: Colors.light.background,
    fontSize: 20,
    fontWeight: '700',
  },
  studentCopy: {
    flex: 1,
  },
  studentName: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
  },
  program: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 13,
    marginTop: 3,
  },
  fieldLabel: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    marginBottom: 4,
  },
  thesisTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  defenseId: {
    color: Colors.light.icon,
    fontFamily: Fonts?.mono,
    fontSize: 11,
    marginBottom: 12,
  },
  logistics: {
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  logisticsText: {
    color: Colors.light.icon,
    fontFamily: Fonts?.mono,
    fontSize: 11,
  },
  criteriaCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  sectionHeading: {
    marginBottom: 16,
  },
  criteriaButton: {
    alignItems: 'center',
    borderColor: Colors.light.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
  },
  criteriaButtonText: {
    color: Colors.light.primary,
    flex: 1,
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  criteriaContent: {
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    paddingTop: 4,
  },
  sectionTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionHint: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    marginTop: 4,
  },
  criterionRow: {
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    paddingVertical: 14,
  },
  criterionLabel: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 8,
  },
  scoreInputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreInput: {
    borderColor: Colors.light.sky,
    borderRadius: 8,
    borderWidth: 1.5,
    color: Colors.light.tint,
    fontFamily: Fonts?.mono,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 62,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'center',
  },
  scoreMax: {
    color: Colors.light.icon,
    fontFamily: Fonts?.mono,
    fontSize: 14,
    marginLeft: 6,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
  },
  resultLabel: {
    color: Colors.light.background,
    fontFamily: Fonts?.sans,
    fontSize: 14,
  },
  averageRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginVertical: 4,
  },
  averageValue: {
    color: Colors.light.background,
    fontFamily: Fonts?.mono,
    fontSize: 46,
    fontWeight: '700',
  },
  averageMax: {
    color: Colors.light.sky,
    fontFamily: Fonts?.mono,
    fontSize: 20,
    marginLeft: 4,
  },
  mentionBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mentionText: {
    color: Colors.light.background,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
  },
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
    textAlignVertical: 'top',
  },
  actions: {
    gap: 10,
  },
  draftButton: {
    alignItems: 'center',
    borderColor: Colors.light.primary,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  draftButtonText: {
    color: Colors.light.primary,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  submitButtonText: {
    color: Colors.light.background,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  validatedBanner: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  validatedText: {
    color: Colors.light.background,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});

export default EvaluationFormScreen;
