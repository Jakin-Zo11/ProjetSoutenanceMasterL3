import React, { useMemo, useState } from 'react';
import {
  Modal,
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
import BottomNav from '../common/BottomNav';
import { juryTabItems, juryTabBadges, JURY_ACCENT_BLUE } from './juryNavigation';
import { Colors, Fonts } from '../../constants/theme';
import { demoDefenses, type JuryEvaluation } from '../../types/defenseWorkflow';

interface Student {
  studentId: string;
  studentName: string;
  studentMatricule: string;
  thesisTitle: string;
  date: string;
  time: string;
  room: string;
  role: string;
  calendarDate: string;
  status: string;
  evaluation?: JuryEvaluation;
}

interface ScreenProps {
  onBack: () => void;
  onOpenDefense: (student: Student) => void;
  onNavigate: (screen: string) => void;
  onEvaluate: (student: Student) => void;
  teacherName: string;
  evaluations: Record<string, JuryEvaluation>;
  notifications: string[];
}

const isTodaySessionDate = (calendarDate: string) => {
  const [day, month] = calendarDate.split(' ');
  const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
  if (monthIndex < 0 || !day) return false;
  return new Date(2026, monthIndex, Number(day)).toDateString() === new Date().toDateString();
};

const MyStudentsScreen: React.FC<ScreenProps> = ({
  onBack,
  onOpenDefense,
  onNavigate,
  onEvaluate,
  teacherName,
  evaluations,
  notifications,
}) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'completed'>('pending');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const students = useMemo(() => demoDefenses
    .filter((defense) => defense.jury.some((member) => member.name === teacherName))
    .map((defense) => ({
      studentId: defense.id,
      studentName: defense.studentName,
      studentMatricule: defense.studentMatricule,
      thesisTitle: defense.theme,
      date: defense.date,
      time: defense.time,
      room: defense.room,
      calendarDate: defense.calendarDate,
      role: defense.jury.find((member) => member.name === teacherName)?.role ?? 'Membre du jury',
      evaluation: evaluations[defense.studentMatricule],
      status: evaluations[defense.studentMatricule]?.status === 'validated'
        ? 'Évalué & PV Généré'
        : evaluations[defense.studentMatricule]
          ? 'Évaluation en cours'
          : 'À évaluer',
    })), [teacherName, evaluations]);

  const todaysStudents = students.filter((student) => isTodaySessionDate(student.calendarDate));
  const pendingStudents = todaysStudents.filter((student) => student.evaluation?.status !== 'validated');
  const completedStudents = students.filter((student) => student.evaluation?.status === 'validated');
  const visibleStudents = activeFilter === 'pending' ? pendingStudents : completedStudents;

  const openEvaluation = (student: Student) => {
    onEvaluate(student);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.navy} />
      <TopBar
        title="Mes étudiants"
        showBackButton
        onBackPress={onBack}
        showNotification
        onNotificationPress={() => setNotificationsOpen(true)}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Étudiants affectés à votre jury</Text>
        <Text style={styles.subtitle}>
          Les évaluations validées et leurs PV sont conservés dans l’historique.
        </Text>

        <View style={styles.segmentedControl}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeFilter === 'pending' }}
            onPress={() => setActiveFilter('pending')}
            style={[styles.segment, activeFilter === 'pending' && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, activeFilter === 'pending' && styles.segmentTextActive]}>
              À Évaluer ({pendingStudents.length})
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeFilter === 'completed' }}
            onPress={() => setActiveFilter('completed')}
            style={[styles.segment, activeFilter === 'completed' && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, activeFilter === 'completed' && styles.segmentTextActive]}>
              Évalués / Historique ({completedStudents.length})
            </Text>
          </Pressable>
        </View>

        <Text style={styles.listCaption}>
          {activeFilter === 'pending'
            ? `Soutenances programmées aujourd’hui · ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}`
            : 'Notes validées · PV générés'}
        </Text>

        <View style={styles.studentsList}>
          {visibleStudents.map((student) => {
            const isCompleted = student.evaluation?.status === 'validated';
            return (
              <View key={student.studentMatricule} style={styles.studentCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Détails de ${student.studentName}`}
                  onPress={() => onOpenDefense(student)}
                  style={({ pressed }) => [styles.studentInfo, pressed && styles.pressed]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{student.studentName.charAt(0)}</Text>
                  </View>
                  <View style={styles.studentCopy}>
                    <Text style={styles.studentName}>{student.studentName}</Text>
                    <Text style={styles.matricule}>{student.studentMatricule}</Text>
                    <Text style={styles.theme} numberOfLines={2}>{student.thesisTitle}</Text>
                    <Text style={styles.schedule}>{student.date} · {student.time} · {student.room}</Text>
                    <Text style={styles.role}>{student.role}</Text>
                  </View>
                </Pressable>

                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, isCompleted ? styles.completedBadge : styles.pendingBadge]}>
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle-outline' : 'time-outline'}
                      size={16}
                      color={Colors.light.primary}
                    />
                    <Text style={styles.statusText}>
                      {isCompleted ? 'Évalué & PV Généré' : 'À évaluer'}
                    </Text>
                  </View>
                  {student.evaluation && isCompleted ? (
                    <Text style={styles.grade}>{student.evaluation.totalScore.toFixed(1)} / 20</Text>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openEvaluation(student)}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                  >
                    <Ionicons name={isCompleted ? 'eye-outline' : 'create-outline'} size={16} color={Colors.light.white} />
                    <Text style={styles.actionText}>{isCompleted ? 'Revoir la fiche' : 'Évaluer'}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          {visibleStudents.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name={activeFilter === 'pending' ? 'calendar-clear-outline' : 'clipboard-outline'}
                size={34}
                color={Colors.light.sky}
              />
              <Text style={styles.emptyTitle}>
                {activeFilter === 'pending' ? 'Aucune évaluation à faire aujourd’hui' : 'Aucune évaluation validée'}
              </Text>
              <Text style={styles.emptyText}>
                {activeFilter === 'pending'
                  ? 'Les autres créneaux restent disponibles depuis votre agenda.'
                  : 'Les étudiants apparaîtront ici après validation de leur évaluation.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="defenses"
        badges={juryTabBadges}
        accentColor={JURY_ACCENT_BLUE}
        onTabChange={(tab) => {
          if (tab === 'home') onBack();
          if (tab === 'defenses') return;
          if (tab === 'evaluations') onNavigate('jury-history');
          if (tab === 'profile') onNavigate('jury-profile');
        }}
      />

      <Modal visible={notificationsOpen} transparent animationType="slide" onRequestClose={() => setNotificationsOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setNotificationsOpen(false)}>
          <Pressable style={styles.notificationModal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer les notifications"
                onPress={() => setNotificationsOpen(false)}
              >
                <Ionicons name="close" size={24} color={Colors.light.navy} />
              </Pressable>
            </View>
            <ScrollView>
              {notifications.length ? notifications.map((message, index) => (
                <View key={`${index}-${message}`} style={styles.notificationRow}>
                  <Ionicons name="notifications-outline" size={20} color={Colors.light.sky} />
                  <Text style={styles.notificationText}>{message}</Text>
                </View>
              )) : (
                <Text style={styles.emptyText}>Aucune notification pour le moment.</Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.light.surface, flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 28 },
  heading: { color: Colors.light.navy, fontFamily: 'PlusJakartaSans-Bold', fontSize: 19 },
  subtitle: { color: Colors.light.tabIconDefault, fontFamily: 'Inter-Regular', fontSize: 13, lineHeight: 19, marginTop: 5 },
  segmentedControl: { backgroundColor: '#EFF6FF', borderRadius: 12, flexDirection: 'row', marginTop: 18, padding: 4 },
  segment: { alignItems: 'center', borderRadius: 9, flex: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 5 },
  segmentActive: { backgroundColor: Colors.light.navy },
  segmentText: { color: Colors.light.primary, fontFamily: 'Inter-SemiBold', fontSize: 12, textAlign: 'center' },
  segmentTextActive: { color: Colors.light.white },
  listCaption: { color: Colors.light.primary, fontFamily: 'Inter-SemiBold', fontSize: 12, marginTop: 16 },
  studentsList: { gap: 12, paddingTop: 10 },
  studentCard: { backgroundColor: Colors.light.white, borderColor: '#DDEAF7', borderRadius: 15, borderWidth: 1, padding: 14 },
  studentInfo: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  avatar: { alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 23, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { color: Colors.light.navy, fontFamily: 'PlusJakartaSans-Bold', fontSize: 19 },
  studentCopy: { flex: 1 },
  studentName: { color: Colors.light.navy, fontFamily: 'Inter-SemiBold', fontSize: 16 },
  matricule: { color: Colors.light.tabIconDefault, fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 3 },
  theme: { color: Colors.light.navy, fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 17, marginTop: 7 },
  schedule: { color: Colors.light.tabIconDefault, fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 8 },
  role: { color: Colors.light.primary, fontFamily: 'Inter-SemiBold', fontSize: 12, marginTop: 5 },
  cardFooter: { alignItems: 'center', borderTopColor: '#DDEAF7', borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', marginTop: 13, paddingTop: 12 },
  statusBadge: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 5, paddingHorizontal: 9, paddingVertical: 7 },
  pendingBadge: { backgroundColor: '#EFF6FF' },
  completedBadge: { backgroundColor: '#DBEAFE' },
  statusText: { color: Colors.light.primary, fontFamily: 'Inter-SemiBold', fontSize: 11 },
  grade: { color: Colors.light.navy, fontFamily: Fonts?.mono, fontSize: 14, fontWeight: '700' },
  actionButton: { alignItems: 'center', backgroundColor: Colors.light.primary, borderRadius: 9, flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 9 },
  actionText: { color: Colors.light.white, fontFamily: 'Inter-SemiBold', fontSize: 11 },
  pressed: { opacity: 0.8 },
  emptyState: { alignItems: 'center', backgroundColor: Colors.light.white, borderRadius: 14, gap: 9, padding: 24 },
  emptyTitle: { color: Colors.light.navy, fontFamily: 'Inter-SemiBold', fontSize: 15, textAlign: 'center' },
  emptyText: { color: Colors.light.tabIconDefault, fontFamily: 'Inter-Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  modalOverlay: { backgroundColor: 'rgba(10,25,47,0.45)', flex: 1, justifyContent: 'flex-end' },
  notificationModal: { backgroundColor: Colors.light.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', minHeight: 260, padding: 20 },
  modalHeader: { alignItems: 'center', borderBottomColor: '#DDEAF7', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 12 },
  modalTitle: { color: Colors.light.navy, fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 },
  notificationRow: { alignItems: 'flex-start', borderBottomColor: '#DDEAF7', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 14 },
  notificationText: { color: Colors.light.navy, flex: 1, fontFamily: 'Inter-Regular', fontSize: 13, lineHeight: 19 },
});

export default MyStudentsScreen;
