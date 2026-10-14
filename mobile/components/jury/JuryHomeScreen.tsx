import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { Colors, Fonts } from '../../constants/theme';
import { juryTabItems, juryTabBadges } from './juryNavigation';
import type { SoutenanceJury, SoutenanceStatut, StatsJury } from '../../types/jury';
import { demoDefenses } from '../../types/defenseWorkflow';

interface JuryHomeScreenProps {
  onNavigate: (screen: string, params?: SoutenanceJury) => void;
  onExit: () => void;
  teacherName: string;
  evaluatedMatricules: string[];
  adminAlerts: string[];
  onAbsenceReported: (defense: SoutenanceJury) => void;
}
// Données locales (Mock Data) — aucune requête réseau.
const statusStyles: Record<SoutenanceStatut, {
  label: string;
  backgroundColor: string;
  color: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}> = {
  en_cours: { label: 'En cours', backgroundColor: Colors.light.sky, color: Colors.light.background },
  evaluation_en_attente: { label: 'Évaluation en attente', backgroundColor: '#EFF6FF', color: '#2D84E0' },
  a_venir: { label: 'À venir', backgroundColor: Colors.light.surface, color: Colors.light.icon },
  evaluation_terminee: { label: 'Évaluation terminée', backgroundColor: Colors.light.primary, color: Colors.light.background, icon: 'checkmark-outline' },
  absence_signalee: { label: 'Absence signalée', backgroundColor: '#EFF6FF', color: Colors.light.primary },
};

type DefenseFilter = 'all' | 'today' | 'upcoming' | 'pending' | 'completed';

const StatCard = ({
  icon,
  label,
  value,
  onPress,
  active,
  urgent,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
  onPress: () => void;
  active: boolean;
  urgent?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.statCard, active && styles.statCardActive, urgent && styles.statCardUrgent, pressed && { opacity: 0.8 }]}
  >
    <View style={[styles.statIcon, urgent && styles.statIconUrgent]}>
      <Ionicons name={icon} size={20} color={urgent ? '#3B82F6' : Colors.light.tint} />
    </View>
    <Text style={[styles.statValue, urgent && styles.statValueUrgent]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Pressable>
);

const DefenseCard = ({ defense, onPress, onEvaluate, onAbsent, onBusy }: { defense: SoutenanceJury; onPress: () => void; onEvaluate: () => void; onAbsent: () => void; onBusy: () => void }) => {
  const status = statusStyles[defense.statut];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.defenseCard, pressed && { opacity: 0.8 }]}>
      <View style={styles.defenseHeader}>
        <View style={styles.defenseStudent}>
          <Text style={styles.fieldLabel}>Nom de l&apos;étudiant</Text>
          <Text style={styles.studentName}>{defense.etudiantNom}</Text>
          <View style={styles.studentMeta}>
            <Text style={styles.studentLevel}>{defense.niveau || 'Master 2'}</Text>
            <Text style={styles.studentRole}>{defense.role || 'Président'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
          {status.icon && <Ionicons name={status.icon} size={13} color={status.color} />}
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.fieldLabel}>Thème du mémoire</Text>
      <Text style={styles.thesisTitle}>{defense.theme}</Text>
      <View style={styles.logistics}>
        <View><Text style={styles.fieldLabel}>Date</Text><Text style={styles.logisticsValue}>{defense.date}</Text></View>
        <View><Text style={styles.fieldLabel}>Heure</Text><Text style={styles.logisticsValue}>{defense.heure}</Text></View>
        <View><Text style={styles.fieldLabel}>Salle</Text><Text style={styles.logisticsValue}>{defense.salle}</Text></View>
      </View>
      {(defense.statut === 'a_venir' || defense.statut === 'evaluation_en_attente') && (
        <View style={styles.actionButtonsRow}>
          {defense.statut === 'a_venir' && (
            <>
              <Pressable
                style={({ pressed }) => [styles.secondaryActionButton, pressed && { opacity: 0.8 }]}
                onPress={(event) => { event.stopPropagation(); onAbsent(); }}
              >
                <Ionicons name="person-remove-outline" size={16} color={Colors.light.tint} />
                <Text style={styles.secondaryActionButtonText}>Absent</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryActionButton, pressed && { opacity: 0.8 }]}
                onPress={(event) => { event.stopPropagation(); onBusy(); }}
              >
                <Ionicons name="time-outline" size={16} color={Colors.light.tint} />
                <Text style={styles.secondaryActionButtonText}>Occupé / Reporter</Text>
              </Pressable>
            </>
          )}
          <Pressable
            style={({ pressed }) => [styles.evaluateButton, pressed && { opacity: 0.8 }]}
            onPress={(event) => { event.stopPropagation(); onEvaluate(); }}
          >
            <Ionicons name="play-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.evaluateButtonText}>Évaluer</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

const JuryHomeScreen: React.FC<JuryHomeScreenProps> = ({ onNavigate, onExit, teacherName, evaluatedMatricules, adminAlerts, onAbsenceReported }) => {
  const [filter, setFilter] = useState<DefenseFilter>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reportedAbsences, setReportedAbsences] = useState<string[]>([]);
  const defenses = useMemo<SoutenanceJury[]>(() => demoDefenses
    .filter((defense) => defense.jury.some((member) => member.name === teacherName))
    .map((defense) => ({
      id: defense.id,
      studentMatricule: defense.studentMatricule,
      etudiantNom: defense.studentName,
      theme: defense.theme,
      date: defense.calendarDate,
      calendarDate: defense.calendarDate,
      heure: defense.time,
      salle: defense.room,
      statut: reportedAbsences.includes(defense.id)
        ? 'absence_signalee'
        : evaluatedMatricules.includes(defense.studentMatricule)
          ? 'evaluation_terminee'
          : defense.status,
      niveau: 'Master 2',
      role: defense.jury.find((member) => member.name === teacherName)?.role,
      director: defense.director,
      jury: defense.jury,
    })), [teacherName, evaluatedMatricules, reportedAbsences]);

  const notifications = [
    ...reportedAbsences.map((id) => {
      const defense = defenses.find((item) => item.id === id);
      return {
        id: `absence-${id}`,
        title: 'Absence signalée · démonstration locale',
        message: defense
          ? `${defense.etudiantNom} · ${defense.date} à ${defense.heure}. Le créneau reste inchangé.`
          : 'Votre absence a été signalée.',
        time: 'À l’instant',
      };
    }),
    ...adminAlerts.map((message, index) => ({
      id: `admin-alert-${index}`,
      title: 'Signalement transmis localement',
      message,
      time: 'À l’instant',
    })),
    ...defenses.slice(0, 2).map((defense) => ({
      id: `defense-${defense.id}`,
      title: 'Soutenance assignée',
      message: `${defense.etudiantNom} · ${defense.date} à ${defense.heure}`,
      time: 'À venir',
    })),
    { id: 3, title: 'Rappel de calendrier', message: 'Soutenances du 11 au 16 novembre 2026', time: 'Hier' },
  ];

  // Statistiques locales (Mock Data) : valeurs dérivées de la liste,
  // backlog d'évaluations en attente = 3 (chiffre prioritaire du jury).
  const stats: StatsJury = {
    soutenancesAujourdhui: defenses.filter((item) => item.date === '11 Nov 2026').length,
    soutenancesAVenir: defenses.filter((item) => item.statut === 'a_venir').length,
    evaluationsEnAttente: defenses.filter((item) => item.statut === 'evaluation_en_attente').length,
    evaluationsTerminees: defenses.filter((item) => item.statut === 'evaluation_terminee').length,
  };

  const filteredDefenses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return defenses.filter((defense) => {
      const matchesSearch = !normalizedSearch
        || defense.etudiantNom.toLowerCase().includes(normalizedSearch)
        || defense.salle.toLowerCase().includes(normalizedSearch);
      const matchesFilter =
        filter === 'all'
        || (filter === 'today' && defense.date === '11 Nov 2026')
        || (filter === 'upcoming' && defense.statut === 'a_venir')
        || (filter === 'pending' && defense.statut === 'evaluation_en_attente')
        || (filter === 'completed' && defense.statut === 'evaluation_terminee');
      const matchesDate = !selectedDate || defense.date === selectedDate;
      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [filter, search, selectedDate, defenses]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'defenses') {
      onNavigate('jury-students');
    } else if (tab === 'team') {
      onNavigate('jury-team');
    } else if (tab === 'evaluations') {
      onNavigate('jury-history');
    } else if (tab === 'profile') {
      onNavigate('jury-profile');
    } else {
      onNavigate('jury');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.tint} />
      <TopBar title="EMIT" showBackButton onBackPress={onExit} showNotification onNotificationPress={() => setShowNotifications(true)} />

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)}>
          <Pressable style={styles.notificationModal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <Pressable onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={24} color={Colors.light.icon} />
              </Pressable>
            </View>
            <ScrollView style={styles.notificationList}>
              {notifications.map((notif) => (
                <View key={notif.id} style={styles.notificationItem}>
                  <View style={styles.notificationIcon}>
                    <Ionicons name="notifications-outline" size={20} color={Colors.light.tint} />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationItemTitle}>{notif.title}</Text>
                    <Text style={styles.notificationItemMessage}>{notif.message}</Text>
                    <Text style={styles.notificationItemTime}>{notif.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.light.tint} />}
      >
        <View style={styles.juryHero}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/images/Logo-emit.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>EMIT – École de Management et d’Innovation Technologique</Text>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-outline" size={24} color={Colors.light.background} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.profileTitle}>{teacherName}</Text>
            <View style={styles.departmentBadge}>
              <Text style={styles.departmentBadgeText}>Département Informatique</Text>
            </View>
          </View>
        </View>
        <View style={styles.quickActions}>
          <QuickAction icon="today-outline" label="Aujourd’hui" onPress={() => setFilter('today')} />
          <QuickAction icon="people-outline" label="Mes étudiants" onPress={() => onNavigate('jury-students')} />
          <QuickAction icon="school-outline" label="Équipe jury" onPress={() => onNavigate('jury-team')} />
          <QuickAction icon="person-outline" label="Profil" onPress={() => onNavigate('jury-profile')} />
        </View>
        </View>

        <View style={styles.contentSheet}>
        <View style={styles.statsGrid}>
          <StatCard icon="calendar-outline" label="Soutenances aujourd'hui" value={stats.soutenancesAujourdhui} active={filter === 'today'} onPress={() => setFilter('today')} />
          <StatCard icon="calendar-clear-outline" label="Soutenances à venir" value={stats.soutenancesAVenir} active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
          <StatCard icon="clipboard-outline" label="Évaluations en attente" value={stats.evaluationsEnAttente} active={filter === 'pending'} urgent onPress={() => setFilter('pending')} />
          <StatCard icon="checkmark-circle-outline" label="Évaluations terminées" value={stats.evaluationsTerminees} active={filter === 'completed'} onPress={() => setFilter('completed')} />
        </View>

        {/* Calendrier des évaluations */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Calendrier des évaluations</Text>
            <Text style={styles.calendarSubtitle}>Novembre 2026</Text>
          </View>
          <View style={styles.calendarGrid}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <View key={index} style={styles.calendarDayHeader}>
                <Text style={styles.calendarDayHeaderText}>{day}</Text>
              </View>
            ))}
            {[...Array(42)].map((_, index) => {
              const dayNumber = index - 5;
              const hasDefense = defenses.some(d => d.date.includes(`${dayNumber} Nov`));
              const isToday = dayNumber === 11;
              const isPast = dayNumber < 11;
              const isInRange = dayNumber >= 1 && dayNumber <= 30;
              const isSelected = selectedDate === `${dayNumber} Nov 2026`;

              if (!isInRange) {
                return <View key={index} style={styles.calendarDayEmpty} />;
              }

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    const newDate = `${dayNumber} Nov 2026`;
                    setSelectedDate(selectedDate === newDate ? null : newDate);
                  }}
                  style={[
                    styles.calendarDay,
                    isToday && styles.calendarDayToday,
                    hasDefense && styles.calendarDayHasDefense,
                    isSelected && styles.calendarDaySelected
                  ]}
                >
                  <Text style={[
                    styles.calendarDayText,
                    isToday && styles.calendarDayTextToday,
                    isPast && styles.calendarDayTextPast,
                    isSelected && styles.calendarDayTextSelected
                  ]}>{dayNumber}</Text>
                  {hasDefense && <View style={[styles.calendarDot, isSelected && styles.calendarDotSelected]} />}
                </Pressable>
              );
            })}
          </View>
          {selectedDate && (
            <Pressable style={styles.clearDateButton} onPress={() => setSelectedDate(null)}>
              <Text style={styles.clearDateButtonText}>Effacer le filtre: {selectedDate}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.light.icon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un étudiant, une salle..."
            placeholderTextColor={Colors.light.icon}
            style={styles.searchInput}
          />
          {(filter !== 'all' || Boolean(search)) && (
            <Pressable onPress={() => { setFilter('all'); setSearch(''); }} style={({ pressed }) => pressed && { opacity: 0.8 }}>
              <Ionicons name="close-circle-outline" size={20} color={Colors.light.icon} />
            </Pressable>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes soutenances</Text>
          <Text style={styles.sectionCount}>{filteredDefenses.length}</Text>
        </View>

        <View style={styles.defensesList}>
          {filteredDefenses.map((defense) => (
            <DefenseCard
              key={defense.id}
              defense={defense}
              onPress={() => onNavigate('jury-defense', defense)}
              onEvaluate={() => onNavigate('jury-evaluation', defense)}
              onAbsent={() => Alert.alert(
                'Signaler une absence',
                `Confirmer votre absence pour ${defense.etudiantNom} le ${defense.date} à ${defense.heure} ? La date, l’heure et la salle ne seront pas modifiées.`,
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Signaler',
                    onPress: () => {
                      setReportedAbsences((current) => current.includes(defense.id) ? current : [...current, defense.id]);
                      onAbsenceReported(defense);
                      Alert.alert('Signalement enregistré localement', 'Aucun message n’est envoyé à la scolarité tant que le service n’est pas connecté. Le créneau reste inchangé.');
                    },
                  },
                ],
              )}
              onBusy={() => Alert.alert(
                'Signaler une indisponibilité',
                'La scolarité pourra examiner votre signalement. Aucune date, heure ou salle ne sera modifiée depuis cette application.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Confirmer', onPress: () => onAbsenceReported(defense) },
                ],
              )}
            />
          ))}
        </View>
        {filteredDefenses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={Colors.light.icon} />
            <Text style={styles.emptyText}>Aucune soutenance ne correspond à votre recherche.</Text>
          </View>
        )}
        </View>
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="home"
        badges={juryTabBadges}
        onTabChange={handleTabChange}
      />
    </SafeAreaView>
  );
};

const QuickAction = ({ icon, label, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.8 }]}>
    <View style={styles.quickActionIcon}>
      <Ionicons name={icon} size={21} color="#FFFFFF" />
    </View>
    <Text style={styles.quickActionLabel} numberOfLines={1}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.navy,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  juryHero: {
    backgroundColor: Colors.light.navy,
    paddingTop: 12,
    paddingBottom: 38,
  },
  contentSheet: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    minHeight: 600,
    padding: 18,
    paddingBottom: 28,
    gap: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    gap: 7,
  },
  quickActionIcon: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 23,
    elevation: 3,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  quickActionLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  institution: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 20,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  brandLogo: {
    backgroundColor: Colors.light.tint,
    borderRadius: 6,
    height: 40,
    marginRight: 10,
    width: 40,
  },
  brandText: {
    color: '#FFFFFF',
    flex: 1,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  greeting: {
    color: '#BFDBFE',
    fontFamily: Fonts?.sans,
    fontSize: 14,
  },
  profileTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  departmentBadge: {
    backgroundColor: '#EAF4FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  departmentBadgeText: {
    color: '#2D84E0',
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.icon,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '48%',
  },
  statCardActive: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  statCardUrgent: {
    borderLeftColor: '#2D84E0',
    borderLeftWidth: 4,
  },
  statIconUrgent: {
    backgroundColor: '#EAF4FF',
  },
  statValueUrgent: {
    color: '#2D84E0',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.icon,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: Colors.light.tint,
    flex: 1,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginBottom: 8,
    width: 36,
  },
  statValue: {
    color: Colors.light.tint,
    fontFamily: Fonts?.mono,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCount: {
    backgroundColor: Colors.light.tint,
    borderRadius: 999,
    color: Colors.light.background,
    fontFamily: Fonts?.mono,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defensesList: {
    marginBottom: 16,
  },
  defenseCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.icon,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  defenseHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  defenseStudent: {
    flex: 1,
    marginRight: 8,
  },
  fieldLabel: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    marginBottom: 4,
  },
  studentName: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  studentMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  studentLevel: {
    backgroundColor: Colors.light.sky,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: Colors.light.background,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  studentRole: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#1E3A8A',
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  thesisTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  logistics: {
    borderTopColor: Colors.light.icon,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  logisticsValue: {
    color: Colors.light.tint,
    fontFamily: Fonts?.mono,
    fontSize: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  secondaryActionButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    gap: 6,
  },
  secondaryActionButtonText: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  evaluateButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    gap: 6,
  },
  evaluateButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.icon,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  calendarSubtitle: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarDayHeaderText: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  calendarDayEmpty: {
    width: '14.28%',
    paddingVertical: 8,
  },
  calendarDay: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  calendarDayToday: {
    backgroundColor: Colors.light.tint,
  },
  calendarDayHasDefense: {
    backgroundColor: '#EAF4FF',
  },
  calendarDaySelected: {
    backgroundColor: Colors.light.tint,
  },
  calendarDayText: {
    color: Colors.light.tint,
    fontFamily: Fonts?.mono,
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: Colors.light.background,
  },
  calendarDayTextPast: {
    color: Colors.light.icon,
  },
  calendarDayTextSelected: {
    color: Colors.light.background,
  },
  calendarDot: {
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    height: 4,
    marginTop: 2,
    width: 4,
  },
  calendarDotSelected: {
    backgroundColor: Colors.light.background,
  },
  clearDateButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  clearDateButtonText: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationModal: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  notificationIcon: {
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationItemMessage: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    marginBottom: 4,
  },
  notificationItemTime: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 11,
  },
});

export default JuryHomeScreen;
