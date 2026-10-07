/**
 * App.tsx — Shell de l'application EMIT (MVVM)
 *
 * Ce fichier est un orchestrateur pur : il n'a plus d'état métier inline.
 * Toute la logique est déléguée aux ViewModels de navigation et de session.
 *
 * Le rendu conditionnel `if (screen === '...')` est conservé tel quel :
 * c'est le pattern de navigation choisi pour ce projet (pas d'expo-router).
 */

import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ── ViewModels ───────────────────────────────────────────────────────────────
import { useAppNavigation, type MobileScreen } from './hooks/useAppNavigation';
import { useStudentSession } from './hooks/useStudentSession';

// ── Composants étudiant ──────────────────────────────────────────────────────
import StudentHomeScreen from './components/student/StudentHomeScreen';
import StudentLoginScreen from './components/student/StudentLoginScreen';
import StudentDefenseScreen from './components/student/StudentDefenseScreen';
import StudentProfileScreen from './components/student/StudentProfileScreen';

// ── Composants jury ───────────────────────────────────────────────────────────
import JuryLoginScreen from './components/jury/JuryLoginScreen';
import JuryHomeScreen from './components/jury/JuryHomeScreen';
import JuryProfileScreen from './components/jury/JuryProfileScreen';
import DefenseDetailsScreen from './components/jury/DefenseDetailsScreen';
import HistoryScreen from './components/jury/HistoryScreen';
import MyStudentsScreen from './components/jury/MyStudentsScreen';
import JuryTeamScreen from './components/jury/JuryTeamScreen';
import EvaluationFormScreen from './components/jury/EvaluationFormScreen';
import SubmissionConfirmationScreen from './components/jury/SubmissionConfirmationScreen';
import { demoDefenses, type JuryEvaluation } from './types/defenseWorkflow';

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const nav = useAppNavigation();
  const session = useStudentSession();
  const [selectedJuryDefense, setSelectedJuryDefense] = useState<{
    studentId: string;
    studentName: string;
    studentMatricule: string;
    thesisTitle: string;
    date: string;
    time: string;
    room: string;
    status: string;
    director?: string;
    role?: string;
    jury?: { name: string; role: string }[];
    pdfUri?: string;
  } | null>(null);
  const [juryEvaluations, setJuryEvaluations] = useState<Record<string, JuryEvaluation>>(() => ({
    '001I24': {
      studentName: 'Jean Rakoto',
      studentMatricule: '001I24',
      date: '11 novembre 2026',
      scores: { presentation: '4', technical: '8', answers: '4' },
      remarks: 'Très bonne maîtrise du sujet et présentation claire.',
      totalScore: 16,
      mention: 'Très Bien',
      evaluee: true,
      status: 'validated',
    },
  }));
  const [juryTeacher, setJuryTeacher] = useState('Dr. Randriamanana');
  const [localAdminAlerts, setLocalAdminAlerts] = useState<string[]>([]);

  const studentDefense = session.student
    ? demoDefenses.find((item) => item.studentMatricule === session.student?.matricule) ?? {
        ...demoDefenses[0],
        id: `DEMO-${session.student.matricule}`,
        studentMatricule: session.student.matricule,
        studentName: session.student.name,
        theme: session.student.themeTitle ?? demoDefenses[0].theme,
      }
    : undefined;

  const navigate = (nextScreen: MobileScreen) => {
    nav.navigateTo(nextScreen);
  };

  const goToJuryHome = () => {
    nav.resetTo('jury');
  };

  const navigateTab = (nextScreen: string) => {
    if (nextScreen === 'jury') {
      goToJuryHome();
      return;
    }
    navigate(nextScreen as MobileScreen);
  };

  // ── Écrans jury ────────────────────────────────────────────────────────────

  if (nav.screen === 'jury') {
    return (
      <JuryHomeScreen
        teacherName={juryTeacher}
        evaluatedMatricules={Object.values(juryEvaluations)
          .filter((evaluation) => evaluation.status === 'validated')
          .map((evaluation) => evaluation.studentMatricule)}
        adminAlerts={localAdminAlerts}
        onAbsenceReported={(defense) => setLocalAdminAlerts((alerts) => [
          ...alerts,
          `Absence pour ${defense.etudiantNom}, le ${defense.date} à ${defense.heure} en ${defense.salle}.`,
        ])}
        onNavigate={(nextScreen, params) => {
          if (params) {
            setSelectedJuryDefense({
              studentId:   params.id,
              studentName: params.etudiantNom,
              studentMatricule: params.studentMatricule ?? params.id,
              thesisTitle: params.theme,
              date:        params.date,
              time:        params.heure,
              room:        params.salle,
              status:      params.statut,
              director:    params.director,
              role:        params.role,
              jury:        params.jury,
              pdfUri:      params.studentMatricule ? session.getPdfSubmission(params.studentMatricule)?.uri : undefined,
            });
          }
          if (nextScreen === 'jury') { goToJuryHome(); return; }
          nav.navigateTo(nextScreen as MobileScreen);
        }}
        onExit={() => nav.setScreen('select')}
      />
    );
  }

  if (nav.screen === 'jury-defense') {
    const evaluation = selectedJuryDefense ? juryEvaluations[selectedJuryDefense.studentMatricule] : undefined;
    return (
      <DefenseDetailsScreen
        onBack={goToJuryHome}
        onNavigate={navigateTab}
        onEvaluate={() => nav.navigateTo('jury-evaluation')}
        defense={selectedJuryDefense ?? undefined}
        evaluation={evaluation}
        onReportIssue={(message) => setLocalAdminAlerts((alerts) => [...alerts, message])}
      />
    );
  }

  if (nav.screen === 'jury-history') {
    const validatedEvaluations = Object.fromEntries(
      Object.entries(juryEvaluations).filter(([, evaluation]) => evaluation.status === 'validated'),
    );
    return <HistoryScreen onBack={goToJuryHome} onNavigate={navigateTab} evaluatedEvaluations={validatedEvaluations} />;
  }
  if (nav.screen === 'jury-team') return <JuryTeamScreen onBack={goToJuryHome} onNavigate={navigateTab} teacherName={juryTeacher} />;
  if (nav.screen === 'jury-profile') return <JuryProfileScreen onBack={goToJuryHome} onNavigate={navigateTab} />;

  if (nav.screen === 'jury-students') {
    return (
      <MyStudentsScreen
        onBack={goToJuryHome}
        onNavigate={navigateTab}
        teacherName={juryTeacher}
        evaluations={juryEvaluations}
        notifications={[
          ...localAdminAlerts,
          ...demoDefenses
            .filter((defense) => defense.jury.some((member) => member.name === juryTeacher))
            .map((defense) => `Soutenance attribuée : ${defense.studentName}, le ${defense.date} à ${defense.time} — ${defense.room}.`),
        ]}
        onOpenDefense={(s) => {
          const assignedDefense = demoDefenses.find((item) => item.id === s.studentId);
          setSelectedJuryDefense({
            studentId:   s.studentId,
            studentName: s.studentName,
            studentMatricule: s.studentMatricule,
            thesisTitle: s.thesisTitle,
            date:        s.date,
            time:        s.time,
            room:        s.room,
            status:      s.status,
            director:    assignedDefense?.director,
            role:        assignedDefense?.jury.find((member) => member.name === juryTeacher)?.role,
            jury:        assignedDefense?.jury,
            pdfUri:      session.getPdfSubmission(s.studentMatricule)?.uri,
          });
          nav.navigateTo('jury-defense');
        }}
        onEvaluate={(student) => {
          const assignedDefense = demoDefenses.find((item) => item.id === student.studentId);
          setSelectedJuryDefense({
            studentId: student.studentId,
            studentName: student.studentName,
            studentMatricule: student.studentMatricule,
            thesisTitle: student.thesisTitle,
            date: student.date,
            time: student.time,
            room: student.room,
            status: student.status,
            director: assignedDefense?.director,
            role: assignedDefense?.jury.find((member) => member.name === juryTeacher)?.role,
            jury: assignedDefense?.jury,
            pdfUri:      session.getPdfSubmission(student.studentMatricule)?.uri,
          });
          navigate('jury-evaluation');
        }}
      />
    );
  }

  if (nav.screen === 'jury-evaluation') {
    const evaluation = selectedJuryDefense ? juryEvaluations[selectedJuryDefense.studentMatricule] : undefined;
    return (
      <EvaluationFormScreen
        onBack={goToJuryHome}
        onNavigate={navigateTab}
        evaluatedEvaluation={evaluation}
        onStatusChange={(updatedEvaluation) => {
          if (!selectedJuryDefense) return;
          setJuryEvaluations((current) => ({
            ...current,
            [updatedEvaluation.studentMatricule]: updatedEvaluation,
          }));
        }}
        onSubmitted={(submittedEvaluation) => {
          if (!selectedJuryDefense) return;
          setJuryEvaluations((cur) => ({
            ...cur,
            [submittedEvaluation.studentMatricule]: submittedEvaluation,
          }));
          setLocalAdminAlerts((alerts) => [
            ...alerts,
            `Évaluation validée pour ${submittedEvaluation.studentName} : ${submittedEvaluation.totalScore.toFixed(1)}/20. Le PV de démonstration est disponible localement.`,
          ]);
          setSelectedJuryDefense((current) => current ? { ...current, status: 'evaluation_terminee' } : current);
          navigate('jury-defense');
        }}
        defense={selectedJuryDefense ?? undefined}
      />
    );
  }

  if (nav.screen === 'jury-confirmation') {
    return <SubmissionConfirmationScreen onBack={goToJuryHome} />;
  }

  // ── Écrans étudiant ───────────────────────────────────────────────────────

  if (nav.screen === 'student-access') {
    return (
      <StudentLoginScreen
        onSuccess={(profile) => { session.login(profile); nav.resetTo('student'); }}
        onBack={() => nav.setScreen('select')}
      />
    );
  }

  if (nav.screen === 'jury-login') {
    return (
      <JuryLoginScreen
        onSuccess={(teacherName) => { setJuryTeacher(teacherName); nav.resetTo('jury'); }}
        onBack={() => nav.setScreen('select')}
      />
    );
  }

  if (nav.screen === 'student') {
    if (!session.student) {
      return (
        <StudentLoginScreen
          onSuccess={(profile) => { session.login(profile); nav.resetTo('student'); }}
          onBack={() => nav.setScreen('select')}
        />
      );
    }
    return (
      <StudentHomeScreen
        student={session.student}
        pdfSubmission={session.pdfSubmission}
        defense={studentDefense}
        onSubmitPdf={session.submitPdf}
        onNavigate={(screen) => nav.resetTo(screen)}
        onExit={() => { session.logout(); nav.resetTo('select'); }}
      />
    );
  }

  if (nav.screen === 'student-defense' || nav.screen === 'student-results') {
    if (!session.student) { nav.setScreen('student-access'); return null; }
    return (
      <StudentDefenseScreen
        student={session.student}
        defense={studentDefense}
        evaluation={juryEvaluations[session.student.matricule]}
        initialView={nav.screen === 'student-results' ? 'results' : 'convocation'}
        onNavigate={(screen) => nav.resetTo(screen)}
        onExit={() => nav.resetTo('student')}
      />
    );
  }

  if (nav.screen === 'student-profile') {
    if (!session.student) { nav.setScreen('student-access'); return null; }
    return (
      <StudentProfileScreen
        student={session.student}
        defense={studentDefense}
        pdfSubmission={session.pdfSubmission}
        onNavigate={(screen) => nav.resetTo(screen)}
        onExit={() => nav.resetTo('student')}
      />
    );
  }

  // ── Écran de sélection (accueil) ───────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A192F" />
      <View style={styles.container}>
        <Image
          source={require('./assets/images/Logo-emit.png')}
          style={styles.selectionLogo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Espace soutenances</Text>
        <Text style={styles.subtitle}>
          Choisissez votre espace pour accéder aux informations de soutenance.
        </Text>

        <View style={styles.options}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Accéder à l'espace étudiant"
            onPress={() => nav.setScreen('student-access')}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          >
            <Ionicons name="school-outline" size={30} color="#3B82F6" />
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Espace étudiant</Text>
              <Text style={styles.optionDescription}>
                Dépôt PDF, convocation, résultats et PV
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Accéder à l'espace évaluateur"
            onPress={() => nav.setScreen('jury-login')}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          >
            <Ionicons name="clipboard-outline" size={30} color="#3B82F6" />
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Espace évaluateur</Text>
              <Text style={styles.optionDescription}>
                Soutenances assignées et évaluations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </Pressable>
        </View>

        <Text style={styles.footer}>EMIT Fianarantsoa · 2026</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles (écran de sélection uniquement) ───────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  selectionLogo: {
    alignSelf: 'center',
    height: 88,
    width: 120,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#C9D9EA',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  options: {
    gap: 14,
    marginTop: 34,
  },
  option: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 18,
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionCopy: {
    flex: 1,
    marginHorizontal: 14,
  },
  optionTitle: {
    color: '#0A192F',
    fontSize: 17,
    fontWeight: '800',
  },
  optionDescription: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  footer: {
    color: '#8EADD0',
    fontSize: 12,
    marginTop: 40,
    textAlign: 'center',
  },
});
