import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../common/BottomNav';

const NAVY = '#0D1F4E';
const PRIMARY_BLUE = '#1A4BA8';
const SKY_BLUE = '#2D84E0';
const LIGHT_BLUE = '#EAF4FF';
const PAGE_BACKGROUND = LIGHT_BLUE;

export interface TeacherDefense {
  id: string;
  studentId: string;
  studentMatricule: string;
  studentName: string;
  program: string;
  thesisTitle: string;
  date: string;
  time: string;
  room: string;
  role: string;
  status: 'upcoming' | 'in_progress' | 'finished';
}

interface TeacherHomeScreenProps {
  onEvaluate: (defense: TeacherDefense) => void;
  onExit: () => void;
  evaluations?: Record<string, { status: 'draft' | 'completed' | 'validated' }>;
  sessionAvailability?: Record<string, 'absent' | 'reschedule'>;
  onSessionAvailabilityChange?: (defenseId: string, status?: 'absent' | 'reschedule') => void;
  validationNotice?: string | null;
  onDismissValidationNotice?: () => void;
}

type DayOption = {
  offset: number;
  label: string;
};

type ScheduledDefense = Omit<TeacherDefense, 'date'> & { dayOffset: number };

const teacherName = 'Dr. Fatou Ba';
const department = 'Département Informatique';

export const teacherSchedule: ScheduledDefense[] = [
  {
    id: 'SOUT-2024-001',
    studentId: 'SOUT-2024-001',
    studentMatricule: '000I24',
    studentName: 'Alice Martin',
    program: 'Master 2 - Informatique',
    thesisTitle: 'Plateforme web de gestion des soutenances à l’EMIT',
    dayOffset: 0,
    time: '09:00',
    room: 'Salle A-101',
    role: 'Président',
    status: 'in_progress',
  },
  {
    id: 'SOUT-2024-002',
    studentId: 'SOUT-2024-002',
    studentMatricule: '001I24',
    studentName: 'Pierre Leroy',
    program: 'L3 - Informatique',
    thesisTitle: 'Application mobile de suivi académique des étudiants',
    dayOffset: 0,
    time: '11:30',
    room: 'Salle B-205',
    role: 'Rapporteur',
    status: 'upcoming',
  },
  {
    id: 'SOUT-2024-003',
    studentId: 'SOUT-2024-003',
    studentMatricule: '002I24',
    studentName: 'Jean Dupont',
    program: 'Master 2 - Informatique',
    thesisTitle: 'Système d’information pour la scolarité EMIT',
    dayOffset: 1,
    time: '14:00',
    room: 'Salle C-305',
    role: 'Encadrant',
    status: 'upcoming',
  },
];

const navItems = [
  { id: 'home', icon: 'home-outline' as const, label: 'Accueil' },
  { id: 'evaluations', icon: 'clipboard-outline' as const, label: 'Évaluations' },
  { id: 'students', icon: 'people-outline' as const, label: 'Étudiants' },
  { id: 'profile', icon: 'person-outline' as const, label: 'Profil' },
];

const statusInfo: Record<TeacherDefense['status'], { label: string; color: string; background: string }> = {
  upcoming: { label: 'À venir', color: '#637799', background: LIGHT_BLUE },
  in_progress: { label: 'En cours', color: PRIMARY_BLUE, background: LIGHT_BLUE },
  finished: { label: 'Terminée', color: NAVY, background: '#DCEBFA' },
};

const juryMembers = [
  { name: 'Prof. Randriamanana', role: 'Président' },
  { name: 'Dr. Rasoarimanana', role: 'Rapporteur' },
  { name: 'Prof. Rakoto', role: 'Examinateur' },
];

const teacherNotifications = [
  { id: 'reminder-today', title: 'Rappel de soutenance', message: 'Une soutenance est prévue aujourd’hui à 09:00, salle A-101.' },
  { id: 'room-update', title: 'Mise à jour de salle', message: 'Vérifiez la salle B-205 pour la soutenance de 11:30.' },
  { id: 'reminder-tomorrow', title: 'Prochaine soutenance', message: 'Une soutenance est prévue demain à 14:00, salle C-305.' },
];

const getDayDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
};

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', options).format(date);

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
}) => (
  <View style={styles.statCard}>
    <View style={styles.statIcon}>
      <Ionicons name={icon} size={17} color={PRIMARY_BLUE} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  onEvaluate,
  onExit,
  evaluations = {},
  sessionAvailability = {},
  onSessionAvailabilityChange,
  validationNotice,
  onDismissValidationNotice,
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStudentId, setSelectedStudentId] = useState(teacherSchedule[0]?.studentId ?? '');
  const [studentDetailSection, setStudentDetailSection] = useState<'convocation' | 'thesis' | 'jury'>('convocation');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const unreadNotificationCount = teacherNotifications.length - readNotificationIds.length;
  const pendingCount = teacherSchedule.filter((defense) => (
    !evaluations[defense.studentId]
  )).length;
  const inProgressCount = teacherSchedule.filter((defense) => (
    evaluations[defense.studentId]?.status === 'draft'
    || evaluations[defense.studentId]?.status === 'completed'
  )).length;
  const validatedCount = teacherSchedule.filter((defense) => (
    evaluations[defense.studentId]?.status === 'validated'
  )).length;
  const dayOptions: DayOption[] = [
    { offset: 0, label: 'Aujourd’hui' },
    { offset: 1, label: 'Demain' },
    { offset: 2, label: formatDate(getDayDate(2), { weekday: 'long' }) },
  ];

  const selectedDate = getDayDate(selectedDay);
  const selectedDefenses = teacherSchedule
    .filter((defense) => defense.dayOffset === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const openEvaluation = (defense: ScheduledDefense) => {
    onEvaluate({
      ...defense,
      date: formatDate(getDayDate(defense.dayOffset), { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  };

  const renderDashboard = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeTitle}>Bonjour, Dr. Fatou Ba</Text>
          <Text style={styles.welcomeSubtitle}>Membre du jury · voici votre planning.</Text>
        </View>
        <View style={styles.departmentBadge}>
          <Ionicons name="school-outline" size={15} color={PRIMARY_BLUE} />
          <Text style={styles.departmentText} numberOfLines={2}>{department}</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Calendrier & planning</Text>
          <Text style={styles.sectionSubtitle}>Vos créneaux attribués</Text>
        </View>
        <View style={styles.calendarIcon}>
          <Ionicons name="calendar" size={19} color={PRIMARY_BLUE} />
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.monthRow}>
          <Text style={styles.monthText}>
            {formatDate(selectedDate, { month: 'long', year: 'numeric' })}
          </Text>
          <Text style={styles.dayCount}>{selectedDefenses.length} créneau{selectedDefenses.length > 1 ? 'x' : ''}</Text>
        </View>
        <View style={styles.daySelector}>
          {dayOptions.map((day) => {
            const selected = selectedDay === day.offset;
            const date = getDayDate(day.offset);
            return (
              <Pressable
                key={day.offset}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedDay(day.offset)}
                style={({ pressed }) => [
                  styles.dayButton,
                  selected && styles.dayButtonSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]} numberOfLines={1}>
                  {day.label}
                </Text>
                <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                  {formatDate(date, { day: '2-digit' })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.sectionTitle}>Mes soutenances à évaluer</Text>
        <Text style={styles.dateLabel}>
          {formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {selectedDefenses.length > 0 ? selectedDefenses.map((defense) => {
        const evaluationStatus = evaluations[defense.studentId]?.status;
        const unavailableStatus = sessionAvailability[defense.id];
        const validated = evaluationStatus === 'validated';
        const status = unavailableStatus
          ? { label: unavailableStatus === 'absent' ? 'Absent' : 'À reporter', color: NAVY, background: '#DCEBFA' }
          : statusInfo[validated ? 'finished' : evaluationStatus ? 'in_progress' : defense.status];
        return (
          <View key={defense.id} style={styles.defenseCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeText}>{defense.time}</Text>
                <View style={styles.timeRule} />
                <Text style={styles.durationText}>Soutenance</Text>
              </View>
              <View style={styles.cardStudent}>
                <Text style={styles.studentName}>{defense.studentName}</Text>
                <Text style={styles.programText}>{defense.program}</Text>
                <Text style={styles.thesisText}>{defense.thesisTitle}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#637799" />
                <Text style={styles.detailText}>{defense.room}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Ionicons name="ribbon-outline" size={15} color={PRIMARY_BLUE} />
                <Text style={styles.roleText}>{defense.role}</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Évaluer ${defense.studentName}`}
              disabled={Boolean(unavailableStatus)}
              onPress={() => openEvaluation(defense)}
              style={({ pressed }) => [styles.evaluateButton, unavailableStatus && styles.disabledButton, pressed && styles.pressed]}
            >
              <Ionicons name={validated ? 'eye-outline' : 'create-outline'} size={17} color="#FFFFFF" />
              <Text style={styles.evaluateButtonText}>{unavailableStatus ? 'Indisponibilité signalée' : validated ? 'Consulter l’évaluation' : 'Évaluer'}</Text>
              {!unavailableStatus && <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />}
            </Pressable>
            <View style={styles.availabilityActions}>
              {unavailableStatus ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onSessionAvailabilityChange?.(defense.id, undefined)}
                  style={({ pressed }) => [styles.availabilityButton, pressed && styles.pressed]}
                >
                  <Ionicons name="refresh-outline" size={15} color={PRIMARY_BLUE} />
                  <Text style={styles.availabilityButtonText}>Rétablir ma disponibilité</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onSessionAvailabilityChange?.(defense.id, 'absent')}
                    style={({ pressed }) => [styles.availabilityButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="person-remove-outline" size={15} color={PRIMARY_BLUE} />
                    <Text style={styles.availabilityButtonText}>Absent</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onSessionAvailabilityChange?.(defense.id, 'reschedule')}
                    style={({ pressed }) => [styles.availabilityButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="calendar-outline" size={15} color={PRIMARY_BLUE} />
                    <Text style={styles.availabilityButtonText}>Occupé / Reporter</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        );
      }) : (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-clear-outline" size={28} color="#637799" />
          <Text style={styles.emptyTitle}>Aucune soutenance prévue</Text>
          <Text style={styles.emptyText}>Aucun créneau ne vous est attribué pour cette journée.</Text>
        </View>
      )}

      <View style={styles.evaluationsHeading}>
        <Text style={styles.sectionTitle}>Évaluations</Text>
        <Text style={styles.sectionSubtitle}>Suivi des grilles et des procès-verbaux</Text>
      </View>
      <View style={styles.statsRow}>
        <StatCard icon="hourglass-outline" label="À évaluer" value={pendingCount} />
        <StatCard icon="create-outline" label="En cours" value={inProgressCount} />
        <StatCard icon="checkmark-circle-outline" label="Terminées" value={validatedCount} />
      </View>
    </ScrollView>
  );

  const renderStudents = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Mes étudiants</Text>
      <Text style={styles.sectionSubtitle}>Étudiants affectés à votre jury</Text>
      {teacherSchedule.map((defense) => {
        const selected = selectedStudentId === defense.studentId;
        return (
          <Pressable
            key={defense.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => setSelectedStudentId(defense.studentId)}
            style={({ pressed }) => [styles.memberCard, selected && styles.selectedStudentCard, pressed && styles.pressed]}
          >
            <View style={styles.memberIcon}>
              <Ionicons name="person-outline" size={20} color={PRIMARY_BLUE} />
            </View>
            <View style={styles.memberCopy}>
              <Text style={styles.memberName}>{defense.studentName}</Text>
              <Text style={styles.memberRole}>{defense.program}</Text>
            </View>
            <Ionicons name={selected ? 'chevron-up-circle' : 'chevron-forward-circle-outline'} size={24} color={SKY_BLUE} />
          </Pressable>
        );
      })}
      {(() => {
        const defense = teacherSchedule.find((item) => item.studentId === selectedStudentId);
        if (!defense) return null;
        return (
          <View style={styles.studentDetailCard}>
            <Text style={styles.sectionTitle}>{defense.studentName}</Text>
            <Text style={styles.programText}>{defense.program}</Text>
            <View style={styles.detailTabs}>
              {([
                ['convocation', 'Convocation'],
                ['thesis', 'Mémoire / résumé'],
                ['jury', 'Membres du jury'],
              ] as const).map(([section, label]) => (
                <Pressable
                  key={section}
                  accessibilityRole="button"
                  accessibilityState={{ selected: studentDetailSection === section }}
                  onPress={() => setStudentDetailSection(section)}
                  style={[styles.detailTab, studentDetailSection === section && styles.detailTabSelected]}
                >
                  <Text style={[styles.detailTabText, studentDetailSection === section && styles.detailTabTextSelected]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {studentDetailSection === 'convocation' && (
              <View style={styles.studentDetailContent}>
                <ProfileRow label="Date" value={formatDate(getDayDate(defense.dayOffset), { day: 'numeric', month: 'long', year: 'numeric' })} />
                <ProfileRow label="Heure" value={defense.time} />
                <ProfileRow label="Salle" value={defense.room} last />
              </View>
            )}
            {studentDetailSection === 'thesis' && (
              <View style={styles.studentDetailContent}>
                <ProfileRow label="Thème du mémoire" value={defense.thesisTitle} />
                <Text style={styles.infoLabel}>Résumé</Text>
                <Text style={styles.summaryText}>
                  Ce mémoire présente la démarche, la conception et la réalisation de {defense.thesisTitle.toLowerCase()}.
                </Text>
              </View>
            )}
            {studentDetailSection === 'jury' && (
              <View style={styles.studentDetailContent}>
                {juryMembers.map((member) => (
                  <ProfileRow key={`${defense.id}-${member.role}`} label={member.role} value={member.name} />
                ))}
              </View>
            )}
          </View>
        );
      })()}
    </ScrollView>
  );

  const renderEvaluations = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Mes évaluations</Text>
      <Text style={styles.sectionSubtitle}>Suivi des grilles et procès-verbaux</Text>
      {teacherSchedule.map((defense) => {
        const evaluationStatus = evaluations[defense.studentId]?.status;
        const status = evaluationStatus === 'validated'
          ? statusInfo.finished
          : evaluationStatus
            ? statusInfo.in_progress
            : statusInfo.upcoming;
        return (
          <View key={defense.id} style={styles.memberCard}>
            <View style={styles.memberIcon}>
              <Ionicons name="document-text-outline" size={20} color={PRIMARY_BLUE} />
            </View>
            <View style={styles.memberCopy}>
              <Text style={styles.memberName}>{defense.studentName}</Text>
              <Text style={styles.memberRole}>{evaluationStatus === 'validated' ? 'Évaluation validée · PV transmis' : evaluationStatus === 'completed' ? 'Évaluation terminée · à valider' : evaluationStatus === 'draft' ? 'Évaluation en cours · brouillon sauvegardé' : 'À évaluer'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir la grille de ${defense.studentName}`}
              onPress={() => openEvaluation(defense)}
              style={({ pressed }) => [styles.smallEvaluateButton, pressed && styles.pressed]}
            >
              <Text style={styles.smallEvaluateButtonText}>Évaluer</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitials}>FB</Text>
        </View>
        <Text style={styles.profileName}>{teacherName}</Text>
        <Text style={styles.profileGrade}>Membre du jury</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Informations professionnelles</Text>
        <ProfileRow label="Département" value={department} />
        <ProfileRow label="Rôle" value="Membre du jury" />
        <ProfileRow label="Établissement" value="EMIT Fianarantsoa" last />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onExit}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
      >
        <Ionicons name="log-out-outline" size={18} color={PRIMARY_BLUE} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo-emit.png')} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Mon espace Jury</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'home'
              ? 'Bonjour, Dr. Fatou Ba · Membre du jury'
              : activeTab === 'evaluations'
                ? 'MES ÉVALUATIONS'
                : activeTab === 'students'
                  ? 'MES ÉTUDIANTS'
                  : 'MON PROFIL'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Notifications, ${unreadNotificationCount} non lue${unreadNotificationCount === 1 ? '' : 's'}`}
          onPress={() => setNotificationsOpen(true)}
          style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
        >
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          {unreadNotificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadNotificationCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
      {activeTab === 'home'
        ? renderDashboard()
        : activeTab === 'evaluations'
          ? renderEvaluations()
          : activeTab === 'students'
            ? renderStudents()
            : renderProfile()}
      <BottomNav
        items={navItems}
        activeTab={activeTab}
        accentColor={PRIMARY_BLUE}
        onTabChange={(tab) => setActiveTab(tab)}
      />
      <Modal
        visible={notificationsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.notificationPanel}>
            <View style={styles.notificationHeader}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setNotificationsOpen(false)}>
                <Ionicons name="close-circle-outline" size={25} color={PRIMARY_BLUE} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {teacherNotifications.map((notification) => {
                const isRead = readNotificationIds.includes(notification.id);
                return (
                  <Pressable
                    key={notification.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isRead }}
                    onPress={() => setReadNotificationIds((current) => (
                      isRead ? current : [...current, notification.id]
                    ))}
                    style={[styles.notificationItem, !isRead && styles.unreadNotification]}
                  >
                    <View style={styles.notificationIcon}>
                      <Ionicons name="notifications-outline" size={18} color={PRIMARY_BLUE} />
                    </View>
                    <View style={styles.notificationCopy}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                    </View>
                    {!isRead && <View style={styles.unreadDot} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={Boolean(validationNotice)}
        transparent
        animationType="fade"
        onRequestClose={onDismissValidationNotice}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.notificationPanel}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle-outline" size={38} color={PRIMARY_BLUE} />
            </View>
            <Text style={styles.sectionTitle}>Évaluation validée</Text>
            <Text style={styles.successMessage}>{validationNotice}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onDismissValidationNotice}
              style={({ pressed }) => [styles.successButton, pressed && styles.pressed]}
            >
              <Text style={styles.successButtonText}>Continuer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const ProfileRow = ({ label, value, last = false }: { label: string; value: string; last?: boolean }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BACKGROUND },
  header: { alignItems: 'center', backgroundColor: NAVY, flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingVertical: 12 },
  headerLogo: { height: 38, width: 42 },
  headerCopy: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  headerSubtitle: { color: '#BFDBFE', fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginTop: 2 },
  content: { padding: 16, paddingBottom: 24 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  welcomeCopy: { flex: 1, paddingRight: 8 },
  welcomeTitle: { color: NAVY, fontSize: 21, fontWeight: '800' },
  welcomeSubtitle: { color: '#637799', fontSize: 12, marginTop: 4 },
  departmentBadge: {
    alignItems: 'center',
    backgroundColor: LIGHT_BLUE,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    maxWidth: 145,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  departmentText: { color: PRIMARY_BLUE, flexShrink: 1, fontSize: 10, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  evaluationsHeading: { marginBottom: 12, marginTop: 8 },
  statCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDEAF7',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: '0px 2px 6px rgba(15, 23, 42, 0.05)',
    elevation: 2,
    flex: 1,
    minHeight: 104,
    padding: 10,
  },
  statIcon: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderRadius: 9, height: 28, justifyContent: 'center', width: 28 },
  statValue: { color: NAVY, fontSize: 20, fontWeight: '800', marginTop: 6 },
  statLabel: { color: '#637799', fontSize: 10, lineHeight: 14, marginTop: 1 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: NAVY, fontSize: 17, fontWeight: '800' },
  sectionSubtitle: { color: '#637799', fontSize: 12, marginTop: 3 },
  calendarIcon: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDEAF7',
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: '0px 2px 6px rgba(15, 23, 42, 0.05)',
    elevation: 2,
    marginBottom: 22,
    padding: 14,
  },
  monthRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  monthText: { color: NAVY, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  dayCount: { color: '#637799', fontSize: 11 },
  daySelector: { flexDirection: 'row', gap: 8 },
  dayButton: { alignItems: 'center', borderColor: '#DDEAF7', borderRadius: 12, borderWidth: 1, flex: 1, paddingVertical: 9 },
  dayButtonSelected: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
  dayLabel: { color: '#637799', fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  dayLabelSelected: { color: '#FFFFFF' },
  dayNumber: { color: NAVY, fontSize: 17, fontWeight: '800', marginTop: 3 },
  dayNumberSelected: { color: '#FFFFFF' },
  listHeading: { marginBottom: 12 },
  dateLabel: { color: '#637799', fontSize: 12, marginTop: 3, textTransform: 'capitalize' },
  defenseCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDEAF7',
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: '0px 2px 6px rgba(15, 23, 42, 0.06)',
    elevation: 2,
    marginBottom: 12,
    padding: 14,
  },
  cardTopRow: { flexDirection: 'row', marginBottom: 12 },
  timeBlock: { alignItems: 'center', borderRightColor: '#DDEAF7', borderRightWidth: 1, marginRight: 12, paddingRight: 12, width: 72 },
  timeText: { color: PRIMARY_BLUE, fontSize: 16, fontWeight: '800' },
  timeRule: { backgroundColor: '#BFDBFE', height: 1, marginVertical: 6, width: 30 },
  durationText: { color: '#637799', fontSize: 9, textAlign: 'center' },
  cardStudent: { flex: 1 },
  studentName: { color: NAVY, fontSize: 15, fontWeight: '800' },
  programText: { color: '#637799', fontSize: 11, marginTop: 3 },
  thesisText: { color: PRIMARY_BLUE, fontSize: 11, lineHeight: 16, marginTop: 5 },
  statusBadge: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, flexDirection: 'row', gap: 5, marginTop: 7, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot: { borderRadius: 4, height: 7, width: 7 },
  statusText: { fontSize: 10, fontWeight: '700' },
  detailsRow: { alignItems: 'center', borderTopColor: '#DDEAF7', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  detailItem: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  detailText: { color: PRIMARY_BLUE, fontSize: 11 },
  roleBadge: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderRadius: 8, flexDirection: 'row', gap: 4, paddingHorizontal: 8, paddingVertical: 5 },
  roleText: { color: PRIMARY_BLUE, fontSize: 10, fontWeight: '700' },
  evaluateButton: { alignItems: 'center', backgroundColor: SKY_BLUE, borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 13, minHeight: 44, paddingHorizontal: 12 },
  evaluateButtonText: { color: '#FFFFFF', flex: 1, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  disabledButton: { backgroundColor: PRIMARY_BLUE },
  availabilityActions: { flexDirection: 'row', gap: 8, marginTop: 9 },
  availabilityButton: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderColor: '#BFDBFE', borderRadius: 9, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 38, paddingHorizontal: 6 },
  availabilityButtonText: { color: PRIMARY_BLUE, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.82 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 26 },
  emptyTitle: { color: NAVY, fontSize: 14, fontWeight: '700', marginTop: 10 },
  emptyText: { color: '#637799', fontSize: 12, lineHeight: 18, marginTop: 4, textAlign: 'center' },
  memberCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DDEAF7', borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginTop: 12, padding: 14 },
  selectedStudentCard: { borderColor: SKY_BLUE, borderWidth: 2 },
  memberIcon: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderRadius: 22, height: 44, justifyContent: 'center', marginRight: 12, width: 44 },
  memberCopy: { flex: 1 },
  memberName: { color: NAVY, fontSize: 14, fontWeight: '700' },
  memberRole: { color: '#637799', fontSize: 12, marginTop: 3 },
  studentDetailCard: { backgroundColor: '#FFFFFF', borderColor: '#DDEAF7', borderRadius: 16, borderWidth: 1, marginTop: 18, padding: 16 },
  detailTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  detailTab: { backgroundColor: LIGHT_BLUE, borderColor: '#BFDBFE', borderRadius: 9, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 8 },
  detailTabSelected: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
  detailTabText: { color: PRIMARY_BLUE, fontSize: 10, fontWeight: '700' },
  detailTabTextSelected: { color: '#FFFFFF' },
  studentDetailContent: { borderTopColor: '#DDEAF7', borderTopWidth: 1, marginTop: 12, paddingTop: 6 },
  summaryText: { color: PRIMARY_BLUE, fontSize: 12, lineHeight: 18, marginTop: 6 },
  smallEvaluateButton: { backgroundColor: SKY_BLUE, borderRadius: 8, marginLeft: 8, paddingHorizontal: 10, paddingVertical: 8 },
  smallEvaluateButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  notificationButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  notificationBadge: { alignItems: 'center', backgroundColor: SKY_BLUE, borderColor: NAVY, borderRadius: 9, borderWidth: 1, height: 18, justifyContent: 'center', minWidth: 18, paddingHorizontal: 3, position: 'absolute', right: 0, top: 0 },
  notificationBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(13, 31, 78, 0.55)', flex: 1, justifyContent: 'center', padding: 20 },
  notificationPanel: { backgroundColor: '#FFFFFF', borderRadius: 18, maxHeight: '75%', padding: 16, width: '100%' },
  notificationHeader: { alignItems: 'center', borderBottomColor: '#DDEAF7', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 12 },
  notificationItem: { alignItems: 'flex-start', borderBottomColor: '#DDEAF7', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 12 },
  unreadNotification: { backgroundColor: LIGHT_BLUE },
  notificationIcon: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  notificationCopy: { flex: 1 },
  notificationTitle: { color: NAVY, fontSize: 13, fontWeight: '700' },
  notificationMessage: { color: PRIMARY_BLUE, fontSize: 11, lineHeight: 16, marginTop: 4 },
  unreadDot: { backgroundColor: SKY_BLUE, borderRadius: 4, height: 8, marginTop: 5, width: 8 },
  successIcon: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderRadius: 30, height: 60, justifyContent: 'center', marginBottom: 12, width: 60 },
  successMessage: { color: PRIMARY_BLUE, fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  successButton: { alignItems: 'center', backgroundColor: PRIMARY_BLUE, borderRadius: 10, marginTop: 18, minHeight: 44, justifyContent: 'center', paddingHorizontal: 24 },
  successButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  profileCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, boxShadow: '0px 2px 6px rgba(15, 23, 42, 0.05)', elevation: 2, marginBottom: 16, padding: 24 },
  profileAvatar: { alignItems: 'center', backgroundColor: LIGHT_BLUE, borderRadius: 38, height: 76, justifyContent: 'center', width: 76 },
  profileInitials: { color: PRIMARY_BLUE, fontSize: 25, fontWeight: '800' },
  profileName: { color: NAVY, fontSize: 17, fontWeight: '800', marginTop: 12 },
  profileGrade: { color: '#637799', fontSize: 12, marginTop: 4 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingTop: 16 },
  infoTitle: { color: NAVY, fontSize: 14, fontWeight: '800', marginBottom: 5 },
  infoRow: { paddingVertical: 13 },
  infoRowBorder: { borderBottomColor: '#DDEAF7', borderBottomWidth: 1 },
  infoLabel: { color: '#637799', fontSize: 11 },
  infoValue: { color: NAVY, fontSize: 13, fontWeight: '600', marginTop: 4 },
  logoutButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#BFDBFE', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16, padding: 13 },
  logoutText: { color: PRIMARY_BLUE, fontSize: 13, fontWeight: '700' },
});

export default TeacherHomeScreen;
