import React from 'react';

import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StudentTabNavigator from './StudentTabNavigator';
import type { StudentPdfSubmission } from '../../hooks/useStudentSession';
import type { DemoDefense } from '../../types/defenseWorkflow';
import TopBar from '../common/TopBar';
import type { StudentProfile } from '../../types/etudiant';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProfileScreenProps {
  student: StudentProfile;
  defense?: DemoDefense;
  pdfSubmission: StudentPdfSubmission | null;
  onNavigate: (screen: 'student' | 'student-defense' | 'student-results' | 'student-profile') => void;
  onExit: () => void;
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  locked?: boolean;
  last?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, locked, last }) => (
  <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueRow}>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value || '—'}
      </Text>
      {locked && (
        <Ionicons name="lock-closed" size={12} color="#9CA3AF" style={styles.lockIcon} />
      )}
    </View>
  </View>
);

// ─── Écran principal ─────────────────────────────────────────────────────────

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({
  student,
  defense,
  pdfSubmission,
  onNavigate,
  onExit,
}) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
    <TopBar title="Profil étudiant" showBackButton onBackPress={onExit} showNotification={false} />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={28} color={COLORS.white} />
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.matricule}>{student.matricule}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.heading}>
          <Ionicons name="person-circle-outline" size={22} color={COLORS.sky} />
          <Text style={styles.sectionTitle}>Informations du profil</Text>
        </View>
        <InfoRow label="Formation" value={student.formation || 'Non renseignée'} />
        <InfoRow label="Promotion" value={student.promotion || 'Non renseignée'} />
        <InfoRow label="E-mail" value={student.email || 'Non renseigné'} />
        <InfoRow label="Téléphone" value={student.telephone || 'Non renseigné'} />
      </View>

      <View style={styles.card}>
        <View style={styles.heading}>
          <Ionicons name="book-outline" size={22} color={COLORS.sky} />
          <Text style={styles.sectionTitle}>Thème de stage / mémoire</Text>
        </View>
        <Text style={styles.themeTitle}>{student.themeTitle ?? defense?.theme ?? 'Thème non renseigné'}</Text>
        <InfoRow label="Entreprise d'accueil" value={student.company ?? 'Non renseignée'} />
      </View>

      <View style={styles.card}>
        <View style={styles.heading}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.sky} />
          <Text style={styles.sectionTitle}>Description de la rédaction</Text>
        </View>
        <Text style={styles.body}>
          Rédaction finale du mémoire de stage portant sur le thème pré-enregistré ci-dessus. Le document attendu est un fichier PDF destiné à être consulté par le jury pendant la soutenance.
        </Text>
        <View style={[styles.statusPill, pdfSubmission ? styles.submitted : styles.pending]}>
          <Ionicons
            name={pdfSubmission ? 'checkmark-circle-outline' : 'time-outline'}
            size={18}
            color={COLORS.blue}
          />
          <Text style={styles.statusText}>{pdfSubmission ? 'Rédaction déposée' : 'Rédaction en attente de dépôt'}</Text>
        </View>

        {pdfSubmission && (
          <View style={styles.fileRow}>
            <Ionicons name="document-outline" size={18} color={COLORS.blue} />
            <Text style={styles.fileName}>{pdfSubmission.name}</Text>
          </View>
        )}
        <Text style={styles.localNote}>Le fichier et son statut sont conservés localement sur cet appareil.</Text>
      </View>
    </ScrollView>
    <StudentTabNavigator activeTab="profile" onNavigate={onNavigate} />
  </SafeAreaView>
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
  content: { gap: 16, padding: 18, paddingBottom: 28 },
  identityCard: { alignItems: 'center', backgroundColor: COLORS.navy, borderRadius: 18, flexDirection: 'row', gap: 14, padding: 20 },
  avatar: { alignItems: 'center', backgroundColor: COLORS.blue, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  identityCopy: { flex: 1 },
  name: { color: COLORS.white, fontSize: 19, fontWeight: '700' },
  matricule: { color: '#BFDBFE', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, padding: 18 },
  heading: { alignItems: 'center', flexDirection: 'row', gap: 9, marginBottom: 12 },
  sectionTitle: { color: COLORS.navy, flex: 1, fontSize: 16, fontWeight: '700' },
  infoRow: { borderBottomColor: COLORS.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingVertical: 12 },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { color: COLORS.muted, flex: 1, fontSize: 13 },
  infoValue: { color: COLORS.navy, flex: 1.4, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  infoValueRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  lockIcon: { marginLeft: 4 },
  themeTitle: { color: COLORS.navy, fontSize: 15, lineHeight: 22, marginBottom: 6 },
  body: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  statusPill: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, flexDirection: 'row', gap: 7, marginTop: 16, paddingHorizontal: 12, paddingVertical: 9 },
  submitted: { backgroundColor: '#DBEAFE' },
  pending: { backgroundColor: COLORS.paleBlue },
  statusText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
  fileRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 13 },
  fileName: { color: COLORS.navy, flex: 1, fontSize: 13 },
  localNote: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 12 },
});

export default StudentProfileScreen;
