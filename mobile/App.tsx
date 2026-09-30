/**
 * App.tsx — Shell de l'application EMIT (MVVM)
 *
 * Ce fichier est un orchestrateur pur : il n'a plus d'état métier inline.
 * Toute la logique est déléguée à deux ViewModels :
 *   • useAppNavigation  → gestion de la pile d'écrans + bouton retour Android
 *   • useStudentSession → profil connecté, thème soumis, timer convocation
 *
 * Le rendu conditionnel `if (screen === '...')` est conservé tel quel :
 * c'est le pattern de navigation choisi pour ce projet (pas d'expo-router).
 */

import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── ViewModels ───────────────────────────────────────────────────────────────
import { useAppNavigation } from './hooks/useAppNavigation';
import { useStudentSession } from './hooks/useStudentSession';

// ── Composants étudiant ──────────────────────────────────────────────────────
import StudentHomeScreen    from './components/student/StudentHomeScreen';
import StudentLoginScreen   from './components/student/StudentLoginScreen';
import StudentThemeScreen   from './components/student/StudentThemeScreen';
import StudentProfileScreen from './components/student/StudentProfileScreen';
import MyConvocationScreen  from './components/student/MyConvocationScreen';
import MyDefenseScreen      from './components/student/MyDefenseScreen';
import MyPvScreen           from './components/student/MyPvScreen';
import MyResultScreen       from './components/student/MyResultScreen';
import MyThesisScreen       from './components/student/MyThesisScreen';
import NotificationsScreen  from './components/student/NotificationsScreen';

// ── Composants jury ──────────────────────────────────────────────────────────
import JuryHomeScreen               from './components/jury/JuryHomeScreen';
import JuryLoginScreen              from './components/jury/JuryLoginScreen';
import JuryProfileScreen            from './components/jury/JuryProfileScreen';
import DefenseDetailsScreen         from './components/jury/DefenseDetailsScreen';
import EvaluationFormScreen         from './components/jury/EvaluationFormScreen';
import HistoryScreen                from './components/jury/HistoryScreen';
import MyStudentsScreen             from './components/jury/MyStudentsScreen';
import SubmissionConfirmationScreen  from './components/jury/SubmissionConfirmationScreen';

// ── Types partagés ───────────────────────────────────────────────────────────
import type { MobileScreen } from './hooks/useAppNavigation';
import type { SoutenanceJury } from './types/jury';
import { useState } from 'react';

// ── Type jury local (données sélectionnées pour DefenseDetails / Evaluation) ─

type JuryDefense = {
  studentId:   string;
  studentName: string;
  thesisTitle: string;
  date:        string;
  time:        string;
  room:        string;
  status:      string;
};

type JuryEvaluation = {
  studentName: string;
  date:        string;
  scores:      Record<'oralPresentation' | 'memoryContent' | 'subjectMastery', string>;
  remarks:     string;
  average:     number;
  mention:     string;
  evaluee:     true;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // ── ViewModels ─────────────────────────────────────────────────────────────
  const nav     = useAppNavigation('select');
  const session = useStudentSession();

  // État jury resté ici car propre à l'espace jury (pas de ViewModel jury encore)
  const [selectedJuryDefense, setSelectedJuryDefense] =
    useState<JuryDefense | null>(null);
  const [juryEvaluations, setJuryEvaluations] =
    useState<Record<string, JuryEvaluation>>({});

  // ── Helpers de navigation ──────────────────────────────────────────────────
  const goToStudentHome = () => nav.resetTo('student');
  const goToJuryHome    = () => nav.resetTo('jury');

  const navigate = (next: string) => nav.navigateTo(next as MobileScreen);

  const navigateJuryTab = (next: string) => {
    if (next === 'jury') { goToJuryHome(); return; }
    nav.navigateTo(next as MobileScreen);
  };

  // ── Écrans publics ─────────────────────────────────────────────────────────

  if (nav.screen === 'student-access') {
    return (
      <StudentLoginScreen
        onSuccess={(profile) => { session.login(profile); nav.setScreen('student'); }}
        onBack={() => nav.setScreen('select')}
      />
    );
  }

  if (nav.screen === 'jury-login') {
    return (
      <JuryLoginScreen
        onSuccess={() => { nav.resetTo('jury'); }}
        onBack={() => nav.setScreen('select')}
      />
    );
  }

  // ── Écrans étudiant ────────────────────────────────────────────────────────

  if (nav.screen === 'student-theme') {
    return (
      <StudentThemeScreen
        onBack={() => nav.setScreen('student')}
        onSubmit={(theme) => { session.submitTheme(theme); nav.setScreen('student'); }}
      />
    );
  }

  if (nav.screen === 'student-defense') {
    return <MyDefenseScreen onBack={goToStudentHome} onNavigate={navigate} />;
  }
  if (nav.screen === 'student-convocation') {
    return <MyConvocationScreen onBack={goToStudentHome} onNavigate={navigate} />;
  }
  if (nav.screen === 'student-thesis') {
    return (
      <MyThesisScreen
        submittedTheme={session.submittedTheme}
        onBack={goToStudentHome}
        onNavigate={navigate}
      />
    );
  }
  if (nav.screen === 'student-result') {
    return <MyResultScreen onBack={goToStudentHome} onNavigate={navigate} />;
  }
  if (nav.screen === 'student-pv') {
    return <MyPvScreen onBack={goToStudentHome} onNavigate={navigate} />;
  }
  if (nav.screen === 'student-notifications') {
    return (
      <NotificationsScreen
        convocationReady={session.convocationReady}
        onBack={goToStudentHome}
        onNavigate={navigate}
      />
    );
  }
  if (nav.screen === 'student-profile') {
    if (!session.student) { nav.setScreen('student-access'); return null; }
    return (
      <StudentProfileScreen
        student={session.student}
        onNavigate={navigate}
        onExit={() => { session.logout(); nav.resetTo('select'); }}
      />
    );
  }

  // ── Écrans jury ────────────────────────────────────────────────────────────

  if (nav.screen === 'jury') {
    return (
      <JuryHomeScreen
        onNavigate={(nextScreen, params) => {
          if (params) {
            setSelectedJuryDefense({
              studentId:   params.id,
              studentName: params.etudiantNom,
              thesisTitle: params.theme,
              date:        params.date,
              time:        params.heure,
              room:        params.salle,
              status:      params.statut,
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
    const evaluation = selectedJuryDefense
      ? juryEvaluations[selectedJuryDefense.studentId]
      : undefined;
    return (
      <DefenseDetailsScreen
        onBack={goToJuryHome}
        onNavigate={navigateJuryTab}
        onEvaluate={() => nav.navigateTo('jury-evaluation')}
        defense={selectedJuryDefense ?? undefined}
        evaluation={evaluation}
      />
    );
  }

  if (nav.screen === 'jury-history') {
    return (
      <HistoryScreen
        onBack={goToJuryHome}
        onNavigate={navigateJuryTab}
        evaluatedEvaluations={juryEvaluations}
      />
    );
  }

  if (nav.screen === 'jury-profile') {
    return <JuryProfileScreen onBack={goToJuryHome} onNavigate={navigateJuryTab} />;
  }

  if (nav.screen === 'jury-students') {
    return (
      <MyStudentsScreen
        onBack={goToJuryHome}
        onNavigate={navigateJuryTab}
        onOpenDefense={(s) => {
          setSelectedJuryDefense({
            studentId:   s.studentId,
            studentName: s.studentName,
            thesisTitle: s.thesisTitle,
            date:        s.date,
            time:        s.time,
            room:        s.room,
            status:      s.status,
          });
          nav.navigateTo('jury-defense');
        }}
      />
    );
  }

  if (nav.screen === 'jury-evaluation') {
    const evaluation = selectedJuryDefense
      ? juryEvaluations[selectedJuryDefense.studentId]
      : undefined;
    return (
      <EvaluationFormScreen
        onBack={goToJuryHome}
        onNavigate={navigateJuryTab}
        evaluatedEvaluation={evaluation}
        onSubmitted={(submitted) => {
          if (!selectedJuryDefense) return;
          setJuryEvaluations((cur) => ({
            ...cur,
            [selectedJuryDefense.studentId]: submitted,
          }));
          setSelectedJuryDefense((cur) =>
            cur ? { ...cur, status: 'evaluation_terminee' } : cur,
          );
          nav.navigateTo('jury-defense');
        }}
        defense={selectedJuryDefense ?? undefined}
      />
    );
  }

  if (nav.screen === 'jury-confirmation') {
    return <SubmissionConfirmationScreen onBack={goToJuryHome} />;
  }

  // ── Accueil étudiant ───────────────────────────────────────────────────────

  if (nav.screen === 'student') {
    if (!session.student) {
      return (
        <StudentLoginScreen
          onSuccess={(profile) => { session.login(profile); nav.setScreen('student'); }}
          onBack={() => nav.setScreen('select')}
        />
      );
    }
    return (
      <StudentHomeScreen
        student={session.student}
        themeSubmitted={session.themeSubmitted}
        convocationReady={session.convocationReady}
        onNavigate={navigate}
        onOpenTheme={() => nav.navigateTo('student-theme')}
        onExit={() => { session.logout(); nav.resetTo('select'); }}
      />
    );
  }

  // ── Écran de sélection (accueil) ───────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
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
            <Ionicons name="school-outline" size={30} color="#2D84E0" />
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Espace étudiant</Text>
              <Text style={styles.optionDescription}>
                Convocation, soutenance, sujet et résultats
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
            <Ionicons name="clipboard-outline" size={30} color="#2D84E0" />
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
    backgroundColor: '#0D1F4E',
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
    color: '#0D1F4E',
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
