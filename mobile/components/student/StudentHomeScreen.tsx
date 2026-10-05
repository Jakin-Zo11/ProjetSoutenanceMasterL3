import React, { useState } from 'react';
import {
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

interface StudentHomeScreenProps {
  student: StudentProfile;
  defense?: DemoDefense;
  pdfSubmission: StudentPdfSubmission | null;
  onSubmitPdf: (submission: { name: string; uri: string }) => void;
  onNavigate: (screen: 'student' | 'student-defense' | 'student-results' | 'student-profile') => void;
  onExit: () => void;
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
            <Text style={styles.studentName}>{student.name}</Text>
          </View>
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
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeading}>
            <Ionicons name="book-outline" size={21} color={COLORS.sky} />
            <Text style={styles.sectionTitle}>Thème pré-enregistré</Text>
          </View>
          <Text style={styles.readOnlyLabel}>Thème de stage / mémoire</Text>
          <Text style={styles.themeValue}>
            {student.themeTitle ?? defense?.theme ?? 'Thème non renseigné dans le profil de démonstration.'}
          </Text>
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

        <View style={styles.sessionNotice}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.blue} />
          <Text style={styles.sessionText}>Session de soutenances : du 11 au 16 novembre 2026</Text>
        </View>
      </ScrollView>
      <StudentTabNavigator activeTab="home" onNavigate={onNavigate} />
    </SafeAreaView>
  );
};

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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, gap: 16, paddingBottom: 28 },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    padding: 20,
  },
  avatar: { alignItems: 'center', backgroundColor: COLORS.blue, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  headerText: { flex: 1 },
  eyebrow: { color: COLORS.sky, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  studentName: { color: COLORS.white, fontSize: 19, fontWeight: '700' },
  card: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, padding: 18 },
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
