import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import StudentTabNavigator from './StudentTabNavigator';
import type { StudentProfile } from '../../types/etudiant';
import type { DemoDefense } from '../../types/defenseWorkflow';
import type { StudentPdfSubmission } from '../../hooks/useStudentSession';
import {
  getDefense,
  getDocuments,
  getProfile,
  getThesis,
  type StudentSimulationDefense,
  type StudentSimulationDocuments,
  type StudentSimulationProfile,
  type StudentSimulationThesis,
} from '../../services/studentService';

interface StudentHomeScreenProps {
  student: StudentProfile;
  defense?: DemoDefense;
  pdfSubmission: StudentPdfSubmission | null;
  onSubmitPdf: (submission: { name: string; uri: string }) => void;
  onNavigate: (screen: 'student' | 'student-defense' | 'student-results' | 'student-profile') => void;
  onExit: () => void;
}

interface StudentSimulationData {
  profile: StudentSimulationProfile;
  thesis: StudentSimulationThesis | null;
  defense: StudentSimulationDefense | null;
  documents: StudentSimulationDocuments;
}

const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  student,
  defense,
  pdfSubmission,
  onSubmitPdf,
  onNavigate,
  onExit,
}) => {
  const [isPickingPdf, setIsPickingPdf] = useState(false);
  const [isLoadingApiData, setIsLoadingApiData] = useState(true);
  const [apiError, setApiError] = useState('');
  const [simulationData, setSimulationData] = useState<StudentSimulationData | null>(null);

  const loadSimulationData = useCallback(async () => {
    setIsLoadingApiData(true);
    setApiError('');
    try {
      const [profile, thesis, defenseData, documents] = await Promise.all([
        getProfile(),
        getThesis(),
        getDefense(),
        getDocuments(),
      ]);
      setSimulationData({ profile, thesis, defense: defenseData, documents });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible de charger les données étudiant.');
    } finally {
      setIsLoadingApiData(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getProfile(), getThesis(), getDefense(), getDocuments()])
      .then(([profile, thesis, defenseData, documents]) => {
        if (isMounted) setSimulationData({ profile, thesis, defense: defenseData, documents });
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setApiError(error instanceof Error ? error.message : 'Impossible de charger les données étudiant.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingApiData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectPdf = async () => {
    setIsPickingPdf(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      if (file.mimeType !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        Alert.alert('Format non accepté', 'Veuillez sélectionner un document PDF.');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      onSubmitPdf({ name: file.name, uri: file.uri });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
      Alert.alert('Import impossible', `Le fichier PDF n’a pas pu être sélectionné. ${message}`);
    } finally {
      setIsPickingPdf(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <TopBar title="Accueil / Dépôt" showBackButton onBackPress={onExit} showNotification={false} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>ESPACE ÉTUDIANT</Text>
            <Text style={styles.studentName}>{simulationData?.profile.name ?? student.name}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <QuickAction icon="cloud-upload-outline" label="Déposer" onPress={selectPdf} />
          <QuickAction icon="calendar-outline" label="Convocation" onPress={() => onNavigate('student-defense')} />
          <QuickAction icon="document-text-outline" label="Résultats" onPress={() => onNavigate('student-results')} />
          <QuickAction icon="person-outline" label="Profil" onPress={() => onNavigate('student-profile')} />
        </View>

        <View style={styles.contentSheet}>
        <View style={styles.apiStatusCard}>
          {isLoadingApiData ? (
            <View style={styles.apiStatusRow}>
              <ActivityIndicator size="small" color={COLORS.sky} />
              <Text style={styles.helper}>Chargement des données depuis Laravel…</Text>
            </View>
          ) : apiError ? (
            <>
              <Text style={styles.apiErrorText}>{apiError}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void loadSimulationData()}
                style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
              >
                <Ionicons name="refresh-outline" size={17} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Réessayer</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.apiStatusRow}>
              <Ionicons name="cloud-done-outline" size={18} color={COLORS.blue} />
              <Text style={styles.helper}>Données de simulation chargées depuis Laravel.</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Actualiser les données"
                onPress={() => void loadSimulationData()}
                style={({ pressed }) => [styles.refreshIcon, pressed && styles.pressed]}
              >
                <Ionicons name="refresh-outline" size={19} color={COLORS.blue} />
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Matricule</Text>
          <TextInput
            accessibilityLabel="Matricule étudiant"
            value={student.matricule}
            editable={false}
            selectTextOnFocus
            style={styles.matriculeInput}
          />
          <Text style={styles.helper}>Matricule vérifié lors de votre connexion.</Text>
          {simulationData?.profile && (
            <>
              <InfoRow label="E-mail" value={simulationData.profile.email ?? ''} />
              <InfoRow label="Formation" value={simulationData.profile.formation ?? ''} />
              <InfoRow label="Parcours" value={simulationData.profile.parcours ?? ''} />
              <InfoRow label="Niveau" value={simulationData.profile.niveau ?? ''} />
              <InfoRow label="Promotion" value={simulationData.profile.promotion ?? ''} />
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeading}>
            <Ionicons name="book-outline" size={21} color={COLORS.sky} />
            <Text style={styles.sectionTitle}>Thème pré-enregistré</Text>
          </View>
          <Text style={styles.readOnlyLabel}>Thème de stage / mémoire</Text>
          <Text style={styles.themeValue}>
            {simulationData?.thesis?.titre ?? student.themeTitle ?? defense?.theme ?? 'Thème non renseigné.'}
          </Text>
          {simulationData?.thesis?.description ? <Text style={styles.helper}>{simulationData.thesis.description}</Text> : null}
          {simulationData?.thesis?.perimetre ? (
            <>
              <Text style={styles.readOnlyLabel}>Périmètre</Text>
              <Text style={styles.themeValue}>{simulationData.thesis.perimetre}</Text>
            </>
          ) : null}
          <Text style={styles.readOnlyLabel}>Entreprise d’accueil</Text>
          <Text style={styles.themeValue}>
            {student.company ?? 'Entreprise non renseignée dans le profil de démonstration.'}
          </Text>
          <Text style={styles.helper}>Ces informations sont en lecture seule dans l’espace étudiant.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeading}>
            <Ionicons name="document-text-outline" size={21} color={COLORS.sky} />
            <Text style={styles.sectionTitle}>Rédaction finale</Text>
          </View>
          <View style={[styles.statusPill, pdfSubmission ? styles.statusSubmitted : styles.statusPending]}>
            <View style={[styles.statusDot, pdfSubmission ? styles.dotSubmitted : styles.dotPending]} />
            <Text style={styles.statusText}>{pdfSubmission ? 'PDF Déposé' : 'En attente'}</Text>
          </View>
          <Text style={styles.helper}>
            {pdfSubmission ? pdfSubmission.name : 'Sélectionnez votre rédaction finale au format PDF.'}
          </Text>
          <Text style={styles.helper}>
            Statut déclaré par Laravel : {simulationData?.thesis?.statut_depot ?? 'Aucun dépôt'}
          </Text>
          {pdfSubmission ? (
            <View style={styles.successNote}>
              <Ionicons name="checkmark-circle-outline" size={19} color={COLORS.blue} />
              <Text style={styles.successText}>
                Rédaction enregistrée. Votre convocation sera publiée dès l’affectation des jurys par la scolarité.
              </Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isPickingPdf}
            onPress={selectPdf}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isPickingPdf && styles.disabled]}
          >
            <Ionicons name={pdfSubmission ? 'refresh-outline' : 'cloud-upload-outline'} size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>
              {isPickingPdf ? 'Sélection du PDF...' : pdfSubmission ? 'Remplacer le PDF' : 'Téléverser la rédaction PDF'}
            </Text>
          </Pressable>
          <Text style={styles.localNote}>Mode démonstration : le fichier reste local à cet appareil, aucun envoi serveur.</Text>
        </View>

        {simulationData && (
          <>
            {simulationData.defense ? (
            <View style={styles.card}>
              <View style={styles.sectionHeading}>
                <Ionicons name="calendar-outline" size={21} color={COLORS.sky} />
                <Text style={styles.sectionTitle}>Soutenance</Text>
              </View>
              <InfoRow label="Date" value={simulationData.defense.date} />
              <InfoRow label="Heure" value={simulationData.defense.heure} />
              <InfoRow label="Salle" value={simulationData.defense.salle ?? ''} />
              <InfoRow label="Statut" value={simulationData.defense.statut} />
              {simulationData.defense.jury.map((member) => (
                <InfoRow key={member.role} label={member.role} value={member.nom} />
              ))}
            </View>
            ) : (
              <View style={styles.card}>
                <View style={styles.sectionHeading}>
                  <Ionicons name="calendar-outline" size={21} color={COLORS.sky} />
                  <Text style={styles.sectionTitle}>Soutenance</Text>
                </View>
                <Text style={styles.helper}>Aucune soutenance n’est planifiée pour le moment.</Text>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.sectionHeading}>
                <Ionicons name="documents-outline" size={21} color={COLORS.sky} />
                <Text style={styles.sectionTitle}>Documents et résultats</Text>
              </View>
              <InfoRow label="Convocation" value={simulationData.documents.convocation.statut} />
              <InfoRow label="Résultat final" value={simulationData.documents.resultat_final} />
              <InfoRow label="Procès-verbal" value={simulationData.documents.pv.statut} />
            </View>
          </>
        )}

        <View style={styles.sessionNotice}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.blue} />
          <Text style={styles.sessionText}>Session de soutenances : du 11 au 16 novembre 2026</Text>
        </View>
        </View>
      </ScrollView>
      <StudentTabNavigator activeTab="home" onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

const QuickAction = ({ icon, label, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
    <View style={styles.quickActionIcon}>
      <Ionicons name={icon} size={21} color={COLORS.white} />
    </View>
    <Text style={styles.quickActionLabel} numberOfLines={1}>{label}</Text>
  </Pressable>
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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'Non renseigné'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  content: { paddingTop: 12, paddingBottom: 20 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  avatar: { alignItems: 'center', backgroundColor: COLORS.blue, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  headerText: { flex: 1 },
  eyebrow: { color: '#BFDBFE', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  studentName: { color: COLORS.white, fontSize: 19, fontWeight: '700' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 38, paddingTop: 4 },
  quickAction: { alignItems: 'center', flex: 1, gap: 7 },
  quickActionIcon: { alignItems: 'center', backgroundColor: COLORS.sky, borderRadius: 23, elevation: 3, height: 46, justifyContent: 'center', width: 46 },
  quickActionLabel: { color: COLORS.white, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  contentSheet: { backgroundColor: COLORS.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, gap: 14, marginTop: -24, minHeight: 500, padding: 18, paddingBottom: 28 },
  card: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, padding: 18 },
  apiStatusCard: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 12, borderWidth: 1, padding: 12 },
  apiStatusRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  apiErrorText: { color: COLORS.navy, fontSize: 13, lineHeight: 19 },
  refreshButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.blue, borderRadius: 9, flexDirection: 'row', gap: 7, marginTop: 10, paddingHorizontal: 12, paddingVertical: 9 },
  refreshIcon: { alignItems: 'center', height: 32, justifyContent: 'center', marginLeft: 'auto', width: 32 },
  infoRow: { borderBottomColor: COLORS.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingVertical: 9 },
  infoLabel: { color: COLORS.muted, flex: 1, fontSize: 12 },
  infoValue: { color: COLORS.navy, flex: 1.4, fontSize: 12, fontWeight: '600', textAlign: 'right' },
  label: { color: COLORS.navy, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  matriculeInput: { backgroundColor: COLORS.background, borderColor: COLORS.border, borderRadius: 10, borderWidth: 1, color: COLORS.navy, fontSize: 16, fontWeight: '700', paddingHorizontal: 13, paddingVertical: 12 },
  helper: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: 9, marginBottom: 17 },
  sectionTitle: { color: COLORS.navy, fontSize: 17, fontWeight: '700' },
  readOnlyLabel: { color: COLORS.blue, fontSize: 12, fontWeight: '700', marginBottom: 5, marginTop: 8 },
  themeValue: { color: COLORS.navy, fontSize: 15, lineHeight: 22 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 20, flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  statusPending: { backgroundColor: COLORS.paleBlue },
  statusSubmitted: { backgroundColor: '#DBEAFE' },
  statusDot: { alignSelf: 'center', borderRadius: 5, height: 9, width: 9 },
  dotPending: { backgroundColor: COLORS.sky },
  dotSubmitted: { backgroundColor: COLORS.blue },
  statusText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
  successNote: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, marginTop: 14 },
  successText: { color: COLORS.blue, flex: 1, fontSize: 13, lineHeight: 19 },
  primaryButton: { alignItems: 'center', backgroundColor: COLORS.blue, borderRadius: 12, flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 16, minHeight: 50, paddingHorizontal: 14 },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
  localNote: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 9, textAlign: 'center' },
  sessionNotice: { alignItems: 'center', backgroundColor: COLORS.paleBlue, borderRadius: 12, flexDirection: 'row', gap: 10, padding: 14 },
  sessionText: { color: COLORS.blue, flex: 1, fontSize: 13, fontWeight: '600' },
});

export default StudentHomeScreen;
