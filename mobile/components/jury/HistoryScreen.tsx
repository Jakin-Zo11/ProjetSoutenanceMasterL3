import React from 'react';
import { Colors } from '../../constants/theme';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { juryTabItems, juryTabBadges, JURY_ACCENT_RED } from './juryNavigation';

interface HistoryItemProps {
  studentName: string;
  date: string;
  role: string;
  grade: string;
  mention: string;
  status: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ studentName, date, role, grade, mention, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Soumis': return Colors.light.success;
      case 'Archivé': return Colors.light.tabIconDefault;
      default: return Colors.light.tabIconDefault;
    }
  };

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyInfo}>
        <Text style={styles.studentName}>{studentName}</Text>
        <View style={styles.historyMeta}>
          <Text style={styles.historyRole}>{role}</Text>
          <Text style={styles.historyDate}>{date}</Text>
        </View>
      </View>
      <View style={styles.historyGrades}>
        <Text style={styles.historyGrade}>{grade}</Text>
        <Text style={styles.historyMention}>{mention}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusBadgeText}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

interface ScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  evaluatedEvaluations?: Record<string, { studentName: string; date: string; average: number; mention: string; evaluee: true }>;
}

const HistoryScreen: React.FC<ScreenProps> = ({ onBack, onNavigate, evaluatedEvaluations = {} }) => {
  // Données locales (Mock Data) — fiches d'évaluation avec notes saisies,
  // moyennes calculées et mentions. Aucun appel API / serveur externe.
  const getMentionLabel = (average: number) => {
    if (average >= 16) return 'Très Bien';
    if (average >= 14) return 'Bien';
    if (average >= 10) return 'Assez Bien';
    return 'Ajourné / Rattrapage';
  };
  const evaluatedHistory = Object.entries(evaluatedEvaluations).map(([studentId, evaluation]) => ({
    studentName: evaluation.studentName || studentId,
    date: evaluation.date,
    role: 'Évaluateur',
    grade: `${evaluation.average.toFixed(1)}/20`,
    mention: evaluation.mention || getMentionLabel(evaluation.average),
    status: 'Terminée',
  }));
  const historyData = [
    ...evaluatedHistory,
    {
      studentName: 'Jean Dupont',
      date: '16 Déc 2024',
      role: 'Examinateur',
      grade: '16.5/20',
      mention: 'Très Bien',
      status: 'Soumis',
    },
    {
      studentName: 'Alice Martin',
      date: '15 Déc 2024',
      role: 'Président',
      grade: '15.5/20',
      mention: 'Bien',
      status: 'Soumis',
    },
    {
      studentName: 'Pierre Leroy',
      date: '15 Déc 2024',
      role: 'Rapporteur',
      grade: '13.5/20',
      mention: 'Assez Bien',
      status: 'Archivé',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.navy} />
      <TopBar title="Historique" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.historyList}>
          {historyData.map((item, index) => (
            <HistoryItem key={index} {...item} />
          ))}
        </View>
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="evaluations"
        badges={juryTabBadges}
        accentColor={JURY_ACCENT_RED}
        onTabChange={(tab) => {
          if (tab === 'home') onBack();
          if (tab === 'defenses') onNavigate('jury-students');
          if (tab === 'profile') onNavigate('jury-profile');
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
  scrollView: {
    flex: 1,
  },
  historyList: {
    padding: 20,
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  historyInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.navy,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  historyMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  historyRole: {
    fontSize: 12,
    color: Colors.light.primary,
    fontFamily: 'Inter-SemiBold',
  },
  historyDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    fontFamily: 'Inter-Regular',
  },
  historyGrades: {
    alignItems: 'flex-end',
  },
  historyGrade: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.navy,
    marginBottom: 2,
    fontFamily: 'JetBrainsMono-Bold',
  },
  historyMention: {
    fontSize: 11,
    color: Colors.light.primary,
    marginBottom: 6,
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
  },
});

export default HistoryScreen;
