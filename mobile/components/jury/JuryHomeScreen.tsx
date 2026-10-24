import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  StatusBar,
  Pressable,
  Modal,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import evaluationApi from '../../services/evaluationApi';
import { storage } from '../../utils/storage';
import type { SoutenanceJury, SoutenanceStatut } from '../../types/jury';
import { demoDefenses } from '../../types/defenseWorkflow';
import { juryTabItems, juryTabBadges } from './juryNavigation';

interface JuryHomeScreenProps {
  onNavigate: (screen: string, params?: SoutenanceJury) => void;
  onExit: () => void;
  teacherName: string;
  evaluatedMatricules: string[];
  adminAlerts: string[];
  onAbsenceReported: (defense: SoutenanceJury) => void;
}

interface ApiEvaluation {
  id: number;
  soutenance_id: number;
  student_name: string;
  theme: string;
  date: string;
  heure: string;
  salle: string;
  status: string;
  note_generale: number | null;
  commentary: string | null;
}

interface DefenseCardInfo {
  id: string;
  student_name: string;
  theme: string;
  date: string;
  heure: string;
  salle: string;
  statut: SoutenanceStatut;
  note_generale: number;
  commentaire: string | null;
  isEditable: boolean;
  isValidNote: boolean;
  studentMatricule?: string;
}

const apiStatusToUI: Record<string, SoutenanceStatut> = {
  draft: 'evaluation_en_attente',
  validated: 'evaluation_terminee',
  locked: 'evaluation_terminee',
};

const JuryHomeScreen: React.FC<JuryHomeScreenProps> = ({
  onNavigate,
  onExit,
  teacherName,
  evaluatedMatricules,
  adminAlerts,
  onAbsenceReported,
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reportedAbsences, setReportedAbsences] = useState<string[]>([]);
  const [defenses, setDefenses] = useState<DefenseCardInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapDemoToCards = useCallback((): DefenseCardInfo[] => {
    return demoDefenses
      .filter((defense) => defense.jury.some((member) => member.name === teacherName))
      .map((defense): DefenseCardInfo => ({
        id: defense.id,
        student_name: defense.studentName,
        theme: defense.theme,
        date: defense.calendarDate ?? defense.date,
        heure: defense.time,
        salle: defense.room,
        statut: reportedAbsences.includes(defense.id)
          ? 'absence_signalee'
          : evaluatedMatricules.includes(defense.studentMatricule)
            ? 'evaluation_terminee'
            : ('a_venir' as SoutenanceStatut),
        note_generale: 0,
        commentaire: null,
        isEditable: false,
        isValidNote: false,
        studentMatricule: defense.studentMatricule,
      }));
  }, [teacherName, evaluatedMatricules, reportedAbsences]);

  const mapApiToCards = (assigned: ApiEvaluation[]): DefenseCardInfo[] =>
    assigned.map((evaluation) => {
      const isEditable = evaluation.status !== 'validated' && evaluation.status !== 'locked';
      const isValidNote = evaluation.note_generale !== null && evaluation.note_generale >= 0;
      return {
        id: String(evaluation.soutenance_id),
        student_name: evaluation.student_name,
        theme: evaluation.theme,
        date: evaluation.date,
        heure: evaluation.heure,
        salle: evaluation.salle,
        statut: apiStatusToUI[evaluation.status] ?? 'evaluation_en_attente',
        note_generale: evaluation.note_generale ?? 0,
        commentaire: evaluation.commentary ?? null,
        isEditable,
        isValidNote,
      };
    });

  const loadDefenses = useCallback(async () => {
    setError(null);
    try {
      const token = await storage.getItemAsync('emit_jury_sanctum_token');
      if (!token) {
        setDefenses(mapDemoToCards());
        return;
      }
      const assigned = await evaluationApi.listAssignedEvaluations(token);
      setDefenses(mapApiToCards(assigned as ApiEvaluation[]));
    } catch (err) {
      console.error('Erreur chargement évaluations:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger les soutenances');
      setDefenses(mapDemoToCards());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
 }, [mapDemoToCards]);

  useEffect(() => {
    void loadDefenses();
  }, [loadDefenses]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadDefenses();
  };

  const handleSaveNote = async (defenseId: string, note: number, commentaire: string) => {
    try {
      const token = await storage.getItemAsync('emit_jury_sanctum_token');
      if (!token) {
        Alert.alert('Non connecté', 'Connectez-vous pour enregistrer une note.');
        return;
      }
      await evaluationApi.saveJuryNote(token, parseInt(defenseId, 10), note, commentaire);
      Alert.alert('Succès', 'Note enregistrée.');
      await loadDefenses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l’enregistrement';
      Alert.alert('Erreur', message);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'defenses' || tab === 'students') {
      onNavigate('jury-students');
    } else if (tab === 'team') {
      onNavigate('jury-team');
    } else if (tab === 'evaluations' || tab === 'history') {
      onNavigate('jury-history');
    } else if (tab === 'profile') {
      onNavigate('jury-profile');
    } else {
      onNavigate('jury');
    }
  };

  const filteredDefenses = useMemo(() => {
    let list = defenses;
    if (filter === 'today') {
      list = list.filter((d) => d.date.toLowerCase().includes('11 nov') || d.date.includes(new Date().getDate().toString()));
    } else if (filter === 'upcoming') {
      list = list.filter((d) => d.statut === 'a_venir');
    } else if (filter === 'pending') {
      list = list.filter((d) => d.statut === 'evaluation_en_attente');
    } else if (filter === 'completed') {
      list = list.filter((d) => d.statut === 'evaluation_terminee');
    }
    if (selectedDate) {
      list = list.filter((d) => d.date.includes(selectedDate.replace(' 2026', '')) || d.date === selectedDate);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.student_name.toLowerCase().includes(q) ||
          d.salle.toLowerCase().includes(q) ||
          d.theme.toLowerCase().includes(q),
      );
    }
    return list;
  }, [defenses, filter, search, selectedDate]);

  const toSoutenanceParams = (defense: DefenseCardInfo): SoutenanceJury =>
    ({
      id: defense.id,
      etudiantNom: defense.student_name,
      studentMatricule: defense.studentMatricule ?? defense.id,
      theme: defense.theme,
      date: defense.date,
      heure: defense.heure,
      salle: defense.salle,
      statut: defense.statut,
    }) as SoutenanceJury;

  const notifications = [
    ...adminAlerts.map((msg, i) => ({
      id: `admin-${i}`,
      title: 'Scolarité',
      message: msg,
      time: 'Récent',
    })),
    ...defenses.slice(0, 3).map((d) => ({
      id: d.id,
      title: 'Soutenance',
      message: `${d.student_name} — ${d.date} à ${d.heure}`,
      time: d.date,
    })),
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement des soutenances…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A192F" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onExit} style={styles.headerBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Espace Jury</Text>
        <Pressable onPress={() => setShowNotifications(true)} style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          {notifications.length > 0 && <View style={styles.badgeDot} />}
        </Pressable>
      </View>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} transparent animationType="slide" onRequestClose={() => setShowNotifications(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)}>
          <Pressable style={styles.notificationModal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <Pressable onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>
            <ScrollView style={styles.notificationList}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyText}>Aucune notification</Text>
              ) : (
                notifications.map((notif) => (
                  <View key={notif.id} style={styles.notificationItem}>
                    <Ionicons name="notifications-outline" size={20} color="#3B82F6" />
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationItemTitle}>{notif.title}</Text>
                      <Text style={styles.notificationItemMessage}>{notif.message}</Text>
                      <Text style={styles.notificationItemTime}>{notif.time}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        {/* Hero */}
        <View style={styles.juryHero}>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={28} color="#FFFFFF" />
            </View>
             <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.profileTitle}>{teacherName}</Text>
              <Text style={styles.departmentBadgeText}>Département Informatique</Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>Données de démonstration affichées</Text>
          </View>
        ) : null}

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Aujourd'hui"
            value={defenses.filter((d) => d.date.toLowerCase().includes('11 nov')).length}
            active={filter === 'today'}
            onPress={() => setFilter('today')}
          />
          <StatCard
            label="À venir"
            value={defenses.filter((d) => d.statut === 'a_venir').length}
            active={filter === 'upcoming'}
            onPress={() => setFilter('upcoming')}
          />
          <StatCard
            label="En attente"
            value={defenses.filter((d) => d.statut === 'evaluation_en_attente').length}
            active={filter === 'pending'}
            onPress={() => setFilter('pending')}
          />
          <StatCard
            label="Terminées"
            value={defenses.filter((d) => d.statut === 'evaluation_terminee').length}
            active={filter === 'completed'}
            onPress={() => setFilter('completed')}
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un étudiant, une salle…"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {(filter !== 'all' || search.length > 0) && (
            <Pressable onPress={() => { setFilter('all'); setSearch(''); setSelectedDate(null); }}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </Pressable>
          )}
        </View>

        {/* Liste */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes soutenances</Text>
          <Text style={styles.sectionCount}>{filteredDefenses.length}</Text>
        </View>

        {filteredDefenses.map((defense) => (
          <DefenseCard
            key={defense.id}
            defense={defense}
            onPress={() => onNavigate('jury-defense', toSoutenanceParams(defense))}
            onEvaluate={() => onNavigate('jury-evaluation', toSoutenanceParams(defense))}
            onAbsent={() =>
              Alert.alert(
                'Signaler une absence',
                `Confirmer votre absence pour ${defense.student_name} le ${defense.date} à ${defense.heure} ?`,
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Signaler',
                    onPress: () => {
                      setReportedAbsences((cur) => (cur.includes(defense.id) ? cur : [...cur, defense.id]));
                      onAbsenceReported(toSoutenanceParams(defense));
                      Alert.alert('Enregistré localement', 'Le créneau n’est pas modifié depuis l’app.');
                    },
                  },
                ],
              )
            }
          />
        ))}

        {filteredDefenses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyText}>Aucune soutenance trouvée.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom nav simple */}
      <View style={styles.bottomNav}>
        {(juryTabItems ?? [
          { id: 'home', label: 'Accueil', icon: 'home-outline' },
          { id: 'students', label: 'Étudiants', icon: 'people-outline' },
          { id: 'history', label: 'Historique', icon: 'time-outline' },
          { id: 'profile', label: 'Profil', icon: 'person-outline' },
        ]).map((item: { id: string; label: string; icon?: string }) => (
          <Pressable key={item.id} style={styles.bottomNavItem} onPress={() => handleTabChange(item.id)}>
            <Ionicons
              name={(item.icon as keyof typeof Ionicons.glyphMap) || 'ellipse-outline'}
              size={22}
              color={item.id === 'home' ? '#3B82F6' : '#64748B'}
            />
            <Text style={[styles.bottomNavLabel, item.id === 'home' && styles.bottomNavLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
};

/* ——— Sous-composants ——— */

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={20} color="#3B82F6" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function StatCard({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: number;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.statCard, active && styles.statCardActive]} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function DefenseCard({
  defense,
  onPress,
  onEvaluate,
  onAbsent,
}: {
  defense: DefenseCardInfo;
  onPress: () => void;
  onEvaluate: () => void;
  onAbsent: () => void;
}) {
  return (
    <Pressable style={styles.defenseCard} onPress={onPress}>
      <View style={styles.defenseCardHeader}>
        <Text style={styles.defenseStudent}>{defense.student_name}</Text>
        <View style={[styles.statusPill, defense.statut === 'evaluation_terminee' && styles.statusDone]}>
          <Text style={styles.statusText}>{defense.statut.replace(/_/g, ' ')}</Text>
        </View>
      </View>
      <Text style={styles.defenseTheme} numberOfLines={2}>{defense.theme}</Text>
      <Text style={styles.defenseMeta}>
        {defense.date} · {defense.heure} · {defense.salle}
      </Text>
      {defense.isValidNote && (
        <Text style={styles.defenseNote}>Note : {defense.note_generale}/20</Text>
      )}
      <View style={styles.defenseActions}>
        <Pressable style={styles.actionBtn} onPress={onEvaluate}>
          <Text style={styles.actionBtnText}>Évaluer</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.actionBtnGhost]} onPress={onAbsent}>
          <Text style={styles.actionBtnGhostText}>Absence</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A192F',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: { padding: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: { paddingBottom: 100 },
  juryHero: {
    backgroundColor: '#0A192F',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { marginLeft: 14 },
  greeting: { color: '#94A3B8', fontSize: 13 },
  profileTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  departmentBadgeText: { color: '#64748B', fontSize: 12, marginTop: 2 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: { color: '#CBD5E1', fontSize: 11, textAlign: 'center' },
  errorBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  errorText: { color: '#92400E', fontWeight: '600' },
  errorHint: { color: '#B45309', fontSize: 12, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0A192F' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: '#0A192F' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0A192F' },
  sectionCount: { fontSize: 14, color: '#64748B' },
  defenseCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  defenseCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  defenseStudent: { fontSize: 16, fontWeight: '700', color: '#0A192F', flex: 1 },
  statusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDone: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 10, color: '#92400E', textTransform: 'capitalize' },
  defenseTheme: { color: '#475569', fontSize: 13, marginTop: 6 },
  defenseMeta: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  defenseNote: { color: '#3B82F6', fontWeight: '600', marginTop: 6 },
  defenseActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  actionBtnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#CBD5E1' },
  actionBtnGhostText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94A3B8', marginTop: 8, textAlign: 'center' },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  bottomNavItem: { flex: 1, alignItems: 'center' },
  bottomNavLabel: { fontSize: 10, color: '#64748B', marginTop: 2 },
  bottomNavLabelActive: { color: '#3B82F6', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  notificationModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  notificationTitle: { fontSize: 18, fontWeight: '700' },
  notificationList: { maxHeight: 300 },
  notificationItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  notificationContent: { marginLeft: 12, flex: 1 },
  notificationItemTitle: { fontWeight: '600', color: '#0A192F' },
  notificationItemMessage: { color: '#64748B', fontSize: 13, marginTop: 2 },
  notificationItemTime: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
});

export default JuryHomeScreen;