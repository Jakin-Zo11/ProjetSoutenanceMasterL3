import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import StudentTabNavigator from './StudentTabNavigator';
import type { StudentProfile } from '../../types/etudiant';
import type { DemoDefense, JuryEvaluation } from '../../types/defenseWorkflow';
import { escapeHtml, exportPdf } from '../../services/pdfExport';

interface StudentDefenseScreenProps {
  student: StudentProfile;
  defense?: DemoDefense;
  evaluation?: JuryEvaluation;
  initialView: 'convocation' | 'results';
  onNavigate: (screen: 'student' | 'student-defense' | 'student-results' | 'student-profile') => void;
  onExit: () => void;
}

const StudentDefenseScreen: React.FC<StudentDefenseScreenProps> = ({
  student,
  defense,
  evaluation,
  initialView,
  onNavigate,
  onExit,
}) => {
  const isValidated = evaluation?.status === 'validated'
    && evaluation.studentMatricule === student.matricule;

  const downloadPv = () => {
    if (!evaluation || !isValidated) return;
    const html = `
      <html><head><meta charset="utf-8"><style>
        body{font-family:Arial,sans-serif;color:#0A192F;padding:36px}
        h1,h2{text-align:center;color:#1E3A8A}
        .notice{background:#EFF6FF;color:#1E3A8A;padding:12px}
        .row{padding:12px 0;border-bottom:1px solid #DCE6F2}
        .label{font-weight:bold;color:#1E3A8A}
      </style></head><body>
        <h1>EMIT Fianarantsoa</h1><h2>PROCÈS-VERBAL DE SOUTENANCE</h2>
        <p class="notice">Aperçu de démonstration généré localement — ce document n’est pas un PV officiel signé.</p>
        <div class="row"><span class="label">Étudiant :</span> ${escapeHtml(student.name)} — ${escapeHtml(student.matricule)}</div>
        <div class="row"><span class="label">Formation :</span> ${escapeHtml(student.formation)}</div>
        <div class="row"><span class="label">Thème :</span> ${escapeHtml(student.themeTitle ?? defense?.theme ?? 'Non renseigné')}</div>
        <div class="row"><span class="label">Date :</span> ${escapeHtml(evaluation.date)}</div>
        <div class="row"><span class="label">Présentation :</span> ${escapeHtml(evaluation.scores.presentation)}/5</div>
        <div class="row"><span class="label">Technique :</span> ${escapeHtml(evaluation.scores.technical)}/10</div>
        <div class="row"><span class="label">Réponses :</span> ${escapeHtml(evaluation.scores.answers)}/5</div>
        <div class="row"><span class="label">Note finale :</span> ${evaluation.totalScore.toFixed(1)}/20 — ${escapeHtml(evaluation.mention)}</div>
        <div class="row"><span class="label">Remarques :</span> ${escapeHtml(evaluation.remarks || 'Aucune remarque')}</div>
      </body></html>`;
    exportPdf('PV de soutenance EMIT', html).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Le fichier PDF n’a pas pu être généré.';
      Alert.alert('Téléchargement impossible', message);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <TopBar title={initialView === 'convocation' ? 'Soutenance' : 'Résultats & PV'} showBackButton onBackPress={onExit} showNotification={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {initialView === 'convocation' ? (
          <View style={styles.card}>
            <View style={styles.heading}>
              <Ionicons name="calendar-outline" size={23} color={COLORS.sky} />
              <Text style={styles.title}>Convocation de soutenance</Text>
            </View>
            {!defense ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={34} color={COLORS.sky} />
                <Text style={styles.emptyTitle}>Convocation en attente</Text>
                <Text style={styles.bodyText}>
                  Votre créneau et la composition du jury seront affichés dès leur affectation par la scolarité.
                </Text>
                <Text style={styles.sessionText}>Session prévue du 11 au 16 novembre 2026.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.studentLine}>{student.name} · {student.matricule}</Text>
                <InfoRow label="Thème" value={student.themeTitle ?? defense.theme} />
                <InfoRow label="Date" value={defense.date} />
                <InfoRow label="Heure" value={defense.time} />
                <InfoRow label="Salle" value={defense.room} />
                <View style={styles.juryBlock}>
                  <Text style={styles.sectionTitle}>Composition du jury</Text>
                  {(['Président', 'Rapporteur', 'Examinateur'] as const).map((role) => {
                    const member = defense.jury.find((candidate) => candidate.role === role);
                    return (
                      <InfoRow
                        key={role}
                        label={role}
                        value={member?.name ?? 'En attente d’affectation'}
                      />
                    );
                  })}
                </View>
                <Text style={styles.localNotice}>Convocation de démonstration — dates et informations locales.</Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.heading}>
              <Ionicons name="stats-chart-outline" size={23} color={COLORS.sky} />
              <Text style={styles.title}>Résultats &amp; PV</Text>
            </View>
            {!isValidated || !evaluation ? (
              <View style={styles.emptyState}>
                <Ionicons name="lock-closed-outline" size={34} color={COLORS.sky} />
                <Text style={styles.emptyTitle}>Résultat non disponible</Text>
                <Text style={styles.bodyText}>
                  La note, les remarques et le procès-verbal seront accessibles après validation de l’évaluation par le jury.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.scoreLabel}>Note finale</Text>
                <Text style={styles.score}>{evaluation.totalScore.toFixed(1)}<Text style={styles.scoreMax}> / 20</Text></Text>
                <View style={styles.mentionPill}>
                  <Text style={styles.mentionText}>{evaluation.mention}</Text>
                </View>
                <View style={styles.scoreRows}>
                  <InfoRow label="Présentation" value={`${evaluation.scores.presentation} / 5`} />
                  <InfoRow label="Technique" value={`${evaluation.scores.technical} / 10`} />
                  <InfoRow label="Réponses" value={`${evaluation.scores.answers} / 5`} />
                </View>
                <Text style={styles.sectionTitle}>Remarques du jury</Text>
                <Text style={styles.bodyText}>{evaluation.remarks || 'Aucune remarque.'}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={downloadPv}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                  <Ionicons name="download-outline" size={20} color={COLORS.white} />
                  <Text style={styles.primaryButtonText}>Télécharger le PV officiel (PDF)</Text>
                </Pressable>
                <Text style={styles.localNotice}>
                  Démonstration locale : PDF généré à partir des données de cette application, sans signature officielle.
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
      <StudentTabNavigator activeTab={initialView} onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const COLORS = {
  navy: '#0A192F',
  blue: '#1E3A8A',
  sky: '#3B82F6',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#DCE6F2',
  muted: '#64748B',
  paleBlue: '#EFF6FF',
} as const;

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  card: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, padding: 18 },
  heading: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 19 },
  title: { color: COLORS.navy, flex: 1, fontSize: 18, fontWeight: '700' },
  studentLine: { color: COLORS.blue, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  infoRow: { borderBottomColor: COLORS.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingVertical: 13 },
  infoLabel: { color: COLORS.muted, flex: 1, fontSize: 13 },
  infoValue: { color: COLORS.navy, flex: 1.4, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  juryBlock: { marginTop: 17 },
  sectionTitle: { color: COLORS.navy, fontSize: 15, fontWeight: '700', marginBottom: 5, marginTop: 12 },
  emptyState: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 25 },
  emptyTitle: { color: COLORS.navy, fontSize: 17, fontWeight: '700', marginBottom: 8, marginTop: 12, textAlign: 'center' },
  bodyText: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  sessionText: { color: COLORS.blue, fontSize: 13, fontWeight: '600', marginTop: 15, textAlign: 'center' },
  localNotice: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 14, textAlign: 'center' },
  scoreLabel: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },
  score: { color: COLORS.navy, fontSize: 46, fontWeight: '800', marginTop: 3, textAlign: 'center' },
  scoreMax: { color: COLORS.muted, fontSize: 20, fontWeight: '500' },
  mentionPill: { alignSelf: 'center', backgroundColor: COLORS.paleBlue, borderRadius: 18, marginBottom: 14, marginTop: 7, paddingHorizontal: 14, paddingVertical: 8 },
  mentionText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
  scoreRows: { marginBottom: 15 },
  primaryButton: { alignItems: 'center', backgroundColor: COLORS.blue, borderRadius: 12, flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 20, minHeight: 50, paddingHorizontal: 12 },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.82 },
});

export default StudentDefenseScreen;
