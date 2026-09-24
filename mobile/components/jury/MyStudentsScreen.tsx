import React from 'react';
import {
  Colors } from '../../constants/theme';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { juryTabItems, juryTabBadges, JURY_ACCENT_RED } from './juryNavigation';

interface StudentCardProps {
  studentName: string;
  studentMatricule: string;
  thesisTitle: string;
  date: string;
  time: string;
  room: string;
  role: string;
  status: string;
  onPress: () => void;
}

interface Student {
  studentId: string;
  studentName: string;
  studentMatricule: string;
  thesisTitle: string;
  date: string;
  time: string;
  room: string;
  role: string;
  status: string;
}

const StudentCard: React.FC<StudentCardProps> = ({
  studentName,
  studentMatricule,
  thesisTitle,
  date,
  time,
  room,
  role,
  status,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      // Action urgente : badge rouge clair (#FEE2E2).
      case 'À évaluer': return '#FEE2E2';
      case 'Évalué': return Colors.light.navy;
      default: return '#FEE2E2';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'À évaluer': return JURY_ACCENT_RED;
      case 'Évalué': return Colors.light.white;
      default: return JURY_ACCENT_RED;
    }
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.studentCard, pressed && { opacity: 0.8 }]}>
      <View style={styles.studentAvatar}>
        <Text style={styles.studentAvatarText}>{studentName.charAt(0)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.studentMatricule}>{studentMatricule}</Text>
        <Text style={styles.studentThesis} numberOfLines={2}>{thesisTitle}</Text>
        <View style={styles.studentMeta}>
          <Text style={styles.studentRole}>{role}</Text>
          <Text style={styles.studentDate}>{date}</Text>
        </View>
        <View style={styles.convocationMeta}>
          <Text style={styles.studentDate}>{time}</Text>
          <Text style={styles.studentDate}>{room}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={[styles.statusBadgeText, { color: getStatusTextColor() }]}>{status}</Text>
      </View>
    </Pressable>
  );
};

interface ScreenProps {
  onBack: () => void;
  onOpenDefense: (student: Student) => void;
  onNavigate: (screen: string) => void;
}

const MyStudentsScreen: React.FC<ScreenProps> = ({ onBack, onOpenDefense, onNavigate }) => {
  // Données locales (Mock Data) — 3 soutenances affectées, aucun appel API / serveur externe.
  const students: Student[] = [
    {
      studentId: 'SOUT-2024-001',
      studentName: 'Alice Martin',
      studentMatricule: '001M24',
      thesisTitle: 'Plateforme web de gestion des soutenances à l’EMIT',
      date: '15 Déc 2024',
      time: '09:00',
      room: 'Salle A-101',
      role: 'Président',
      status: 'À évaluer',
    },
    {
      studentId: 'SOUT-2024-002',
      studentName: 'Pierre Leroy',
      studentMatricule: '002M24',
      thesisTitle: 'Application mobile de suivi académique des étudiants',
      date: '15 Déc 2024',
      time: '11:30',
      room: 'Salle B-205',
      role: 'Rapporteur',
      status: 'À évaluer',
    },
    {
      studentId: 'SOUT-2024-003',
      studentName: 'Jean Dupont',
      studentMatricule: '003M24',
      thesisTitle: 'Système d’information pour la scolarité EMIT',
      date: '16 Déc 2024',
      time: '14:00',
      room: 'Salle C-305',
      role: 'Examinateur',
      status: 'Évalué',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.navy} />
      <TopBar title="Mes étudiants" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.studentsList}>
          {students.map((student, index) => (
            <StudentCard
              key={index}
              {...student}
              onPress={() => onOpenDefense(student)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="defenses"
        badges={juryTabBadges}
        accentColor={JURY_ACCENT_RED}
        onTabChange={(tab) => {
          if (tab === 'home') onBack();
          if (tab === 'defenses') return;
          if (tab === 'evaluations') onNavigate('jury-history');
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
  studentsList: {
    padding: 20,
    gap: 12,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.navy,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.navy,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  studentMatricule: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  studentThesis: {
    color: Colors.light.navy,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  studentMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  convocationMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  studentRole: {
    fontSize: 12,
    color: Colors.light.primary,
    fontFamily: 'Inter-SemiBold',
  },
  studentDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    fontFamily: 'Inter-Regular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default MyStudentsScreen;
