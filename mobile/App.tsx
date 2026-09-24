import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  Image,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import StudentHomeScreen from './components/student/StudentHomeScreen';
import JuryHomeScreen from './components/jury/JuryHomeScreen';
import JuryLoginScreen from './components/jury/JuryLoginScreen';
import JuryProfileScreen from './components/jury/JuryProfileScreen';
import MyConvocationScreen from './components/student/MyConvocationScreen';
import MyDefenseScreen from './components/student/MyDefenseScreen';
import MyPvScreen from './components/student/MyPvScreen';
import MyResultScreen from './components/student/MyResultScreen';
import MyThesisScreen from './components/student/MyThesisScreen';
import NotificationsScreen from './components/student/NotificationsScreen';
import StudentProfileScreen from './components/student/StudentProfileScreen';
import StudentLoginScreen, { StudentProfile } from './components/student/StudentLoginScreen';
import StudentThemeScreen from './components/student/StudentThemeScreen';
import DefenseDetailsScreen from './components/jury/DefenseDetailsScreen';
import HistoryScreen from './components/jury/HistoryScreen';
import MyStudentsScreen from './components/jury/MyStudentsScreen';
import EvaluationFormScreen from './components/jury/EvaluationFormScreen';
import SubmissionConfirmationScreen from './components/jury/SubmissionConfirmationScreen';

type MobileScreen =
  | 'select' | 'student-access' | 'student-theme' | 'jury-login' | 'student' | 'jury'
  | 'student-defense' | 'student-convocation' | 'student-thesis'
  | 'student-result' | 'student-pv' | 'student-notifications' | 'student-profile'
  | 'jury-defense' | 'jury-history' | 'jury-students' | 'jury-evaluation' | 'jury-confirmation'
  | 'jury-profile';

type JuryDefense = {
  studentId: string;
  studentName: string;
  thesisTitle: string;
  date: string;
  time: string;
  room: string;
  status: string;
};

type JuryEvaluation = {
  studentName: string;
  date: string;
  scores: Record<'oralPresentation' | 'memoryContent' | 'subjectMastery', string>;
  remarks: string;
  average: number;
  mention: string;
  evaluee: true;
};

export default function App() {
  const [screen, setScreen] = useState<MobileScreen>('select');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [themeSubmitted, setThemeSubmitted] = useState(false);
  const [submittedTheme, setSubmittedTheme] = useState('');
  const [convocationReady, setConvocationReady] = useState(false);
  const [screenHistory, setScreenHistory] = useState<MobileScreen[]>([]);
  const [selectedJuryDefense, setSelectedJuryDefense] = useState<JuryDefense | null>(null);
  const [juryEvaluations, setJuryEvaluations] = useState<Record<string, JuryEvaluation>>({});
  const lastJuryBackPress = useRef(0);

  const navigateTo = (nextScreen: MobileScreen) => {
    setScreenHistory((history) => [...history, screen]);
    setScreen(nextScreen);
  };

  const goBack = () => {
    setScreenHistory((history) => {
      if (history.length === 0) return history;
      const previousScreen = history[history.length - 1];
      setScreen(previousScreen);
      return history.slice(0, -1);
    });
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const isJuryScreen = screen === 'jury'
        || screen === 'jury-defense'
        || screen === 'jury-history'
        || screen === 'jury-students'
        || screen === 'jury-evaluation'
        || screen === 'jury-confirmation'
        || screen === 'jury-profile';

      if (!isJuryScreen) {
        if (screenHistory.length === 0) return false;
        goBack();
        return true;
      }

      if (screenHistory.length > 0) {
        goBack();
        return true;
      }

      const now = Date.now();
      if (now - lastJuryBackPress.current < 2000) {
        return false;
      }

      lastJuryBackPress.current = now;
      ToastAndroid.show('Appuyez encore pour quitter', ToastAndroid.SHORT);
      return true;
    });
    return () => subscription.remove();
  }, [screen, screenHistory]);

  // Aucun setState synchrone dans l'effet : le timer souscrit simplement à un
  // système externe (setTimeout). La réinitialisation de convocationReady est
  // effectuée lors de la remise à zéro du thème (voir onExit), comme convenu
  // dans le handler d'événement plutôt que pendant un rendu en cascade.
  useEffect(() => {
    if (!themeSubmitted) return undefined;
    const timer = setTimeout(() => setConvocationReady(true), 15000);
    return () => clearTimeout(timer);
  }, [themeSubmitted]);

  if (screen === 'student-access') {
    return <StudentLoginScreen onSuccess={(profile) => { setStudent(profile); setScreen('student'); }} onBack={() => setScreen('select')} />;
  }

  if (screen === 'jury-login') {
    return <JuryLoginScreen onSuccess={() => { setScreenHistory([]); setScreen('jury'); }} onBack={() => setScreen('select')} />;
  }

  if (screen === 'student-theme') {
    return <StudentThemeScreen onBack={() => setScreen('student')} onSubmit={(theme) => { setSubmittedTheme(theme); setThemeSubmitted(true); setScreen('student'); }} />;
  }

  if (screen === 'jury') {
    return (
      <JuryHomeScreen
        onNavigate={(nextScreen, params) => {
          if (params) {
            setSelectedJuryDefense({
              studentId: params.id,
              studentName: params.etudiantNom,
              thesisTitle: params.theme,
              date: params.date,
              time: params.heure,
              room: params.salle,
              status: params.statut,
            });
          }
          if (nextScreen === 'jury') {
            setScreen('jury');
            setScreenHistory([]);
            return;
          }
          navigateTo(nextScreen as MobileScreen);
        }}
        onExit={() => setScreen('select')}
      />
    );
  }

  const goToStudentHome = () => setScreen('student');
  const goToJuryHome = () => {
    setScreenHistory([]);
    setScreen('jury');
  };

  if (screen === 'student-defense')   return <MyDefenseScreen onBack={goToStudentHome} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} />;
  if (screen === 'student-convocation') return <MyConvocationScreen onBack={goToStudentHome} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} />;
  if (screen === 'student-thesis') return <MyThesisScreen submittedTheme={submittedTheme} onBack={goToStudentHome} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} />;
  if (screen === 'student-result') return <MyResultScreen onBack={goToStudentHome} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} />;
  if (screen === 'student-pv') return <MyPvScreen onBack={goToStudentHome} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} />;
  if (screen === 'student-notifications') return <NotificationsScreen convocationReady={convocationReady} onBack={goToStudentHome} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} />;
  if (screen === 'student-profile') return <StudentProfileScreen onBack={goToStudentHome} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} />;
  const navigateJuryTab = (nextScreen: string) => {
    if (nextScreen === 'jury') {
      goToJuryHome();
      return;
    }
    navigateTo(nextScreen as MobileScreen);
  };

  if (screen === 'jury-defense') {
    const evaluation = selectedJuryDefense ? juryEvaluations[selectedJuryDefense.studentId] : undefined;
    return (
      <DefenseDetailsScreen
        onBack={goToJuryHome}
        onNavigate={navigateJuryTab}
        onEvaluate={() => navigateTo('jury-evaluation')}
        defense={selectedJuryDefense ?? undefined}
        evaluation={evaluation}
      />
    );
  }
  if (screen === 'jury-history') return <HistoryScreen onBack={goToJuryHome} onNavigate={navigateJuryTab} evaluatedEvaluations={juryEvaluations} />;
  if (screen === 'jury-profile') return <JuryProfileScreen onBack={goToJuryHome} onNavigate={navigateJuryTab} />;
  if (screen === 'jury-students') {
    return (
      <MyStudentsScreen
        onBack={goToJuryHome}
        onNavigate={navigateJuryTab}
        onOpenDefense={(student) => {
          setSelectedJuryDefense({
            studentId: student.studentId,
            studentName: student.studentName,
            thesisTitle: student.thesisTitle,
            date: student.date,
            time: student.time,
            room: student.room,
            status: student.status,
          });
          navigateTo('jury-defense');
        }}
      />
    );
  }
  if (screen === 'jury-evaluation') {
    const evaluation = selectedJuryDefense ? juryEvaluations[selectedJuryDefense.studentId] : undefined;
    return (
      <EvaluationFormScreen
        onBack={goToJuryHome}
        onNavigate={navigateJuryTab}
        evaluatedEvaluation={evaluation}
        onSubmitted={(submittedEvaluation) => {
          if (!selectedJuryDefense) return;
          setJuryEvaluations((current) => ({
            ...current,
            [selectedJuryDefense.studentId]: submittedEvaluation,
          }));
          setSelectedJuryDefense((current) => current ? { ...current, status: 'evaluation_terminee' } : current);
          navigateTo('jury-defense');
        }}
        defense={selectedJuryDefense ?? undefined}
      />
    );
  }
  if (screen === 'jury-confirmation') return <SubmissionConfirmationScreen onBack={goToJuryHome} />;

  if (screen === 'student') {
    if (!student) {
      return <StudentLoginScreen onSuccess={(profile) => { setStudent(profile); setScreen('student'); }} onBack={() => setScreen('select')} />;
    }
    return <StudentHomeScreen student={student} themeSubmitted={themeSubmitted} convocationReady={convocationReady} onNavigate={(nextScreen) => navigateTo(nextScreen as MobileScreen)} onOpenTheme={() => navigateTo('student-theme')} onExit={() => { setStudent(null); setThemeSubmitted(false); setSubmittedTheme(''); setConvocationReady(false); setScreen('select'); setScreenHistory([]); }} />;
  }

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
            onPress={() => setScreen('student-access')}
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
            onPress={() => setScreen('jury-login')}
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
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#2D84E0',
    borderRadius: 22,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  selectionLogo: {
    alignSelf: 'center',
    height: 88,
    width: 120,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  brand: {
    color: '#95C5F2',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 18,
    textAlign: 'center',
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
  optionIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  optionCopy: {
    flex: 1,
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
  arrow: {
    color: '#2D84E0',
    fontSize: 30,
    marginLeft: 8,
  },
  footer: {
    color: '#8EADD0',
    fontSize: 12,
    marginTop: 40,
    textAlign: 'center',
  },
});
