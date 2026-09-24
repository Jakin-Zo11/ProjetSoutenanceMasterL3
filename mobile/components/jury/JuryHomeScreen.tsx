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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { Colors, Fonts } from '../../constants/theme';
import { juryTabItems, juryTabBadges, JURY_ACCENT_RED } from './juryNavigation';
import type { SoutenanceJury, SoutenanceStatut, StatsJury } from '../../types/jury';

interface JuryHomeScreenProps {
  onNavigate: (screen: string, params?: SoutenanceJury) => void;
  onExit: () => void;
}
// Données locales (Mock Data) — 3 soutenances, aucun appel API / serveur externe.
const defenses: SoutenanceJury[] = [
  {
    id: 'SOUT-2024-001',
    etudiantNom: 'Alice Martin',
    theme: 'Plateforme web de gestion des soutenances à l’EMIT',
    date: '15 Décembre',
    heure: '09:00',
    salle: 'Salle A-101',
    statut: 'en_cours',
  },
  {
    id: 'SOUT-2024-002',
    etudiantNom: 'Pierre Leroy',
    theme: 'Application mobile de suivi académique des étudiants',
    date: '15 Décembre',
    heure: '11:30',
    salle: 'Salle B-205',
    statut: 'evaluation_en_attente',
  },
  {
    id: 'SOUT-2024-003',
    etudiantNom: 'Jean Dupont',
    theme: 'Système d’information pour la scolarité EMIT',
    date: '16 Décembre',
    heure: '14:00',
    salle: 'Salle C-305',
    statut: 'a_venir',
  },
];

const statusStyles: Record<SoutenanceStatut, {
  label: string;
  backgroundColor: string;
  color: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}> = {
  en_cours: { label: 'En cours', backgroundColor: Colors.light.sky, color: Colors.light.background },
  // Action urgente du jury : badge rouge clair / texte rouge (#EF4444).
  evaluation_en_attente: { label: 'Évaluation en attente', backgroundColor: '#FEE2E2', color: JURY_ACCENT_RED },
  a_venir: { label: 'À venir', backgroundColor: Colors.light.surface, color: Colors.light.icon },
  evaluation_terminee: { label: 'Évaluation terminée', backgroundColor: Colors.light.primary, color: Colors.light.background, icon: 'checkmark-outline' },
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
      <Ionicons name={icon} size={20} color={urgent ? JURY_ACCENT_RED : Colors.light.tint} />
    </View>
    <Text style={[styles.statValue, urgent && styles.statValueUrgent]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Pressable>
);

const DefenseCard = ({ defense, onPress }: { defense: SoutenanceJury; onPress: () => void }) => {
  const status = statusStyles[defense.statut];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.defenseCard, pressed && { opacity: 0.8 }]}>
      <View style={styles.defenseHeader}>
        <View style={styles.defenseStudent}>
          <Text style={styles.fieldLabel}>Nom de l’étudiant</Text>
          <Text style={styles.studentName}>{defense.etudiantNom}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
          {status.icon && <Ionicons name={status.icon} size={13} color={status.color} />}
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.fieldLabel}>Thème du mémoire</Text>
      <Text style={styles.thesisTitle}>{defense.theme}</Text>

      <View style={styles.logistics}>
        <View>
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.logisticsValue}>{defense.date}</Text>
        </View>
        <View>
          <Text style={styles.fieldLabel}>Heure</Text>
          <Text style={styles.logisticsValue}>{defense.heure}</Text>
        </View>
        <View>
          <Text style={styles.fieldLabel}>Salle</Text>
          <Text style={styles.logisticsValue}>{defense.salle}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const JuryHomeScreen: React.FC<JuryHomeScreenProps> = ({ onNavigate, onExit }) => {
  const [filter, setFilter] = useState<DefenseFilter>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  // Statistiques locales (Mock Data) : valeurs dérivées de la liste,
  // backlog d'évaluations en attente = 8 (chiffre prioritaire du jury).
  const stats: StatsJury = {
    soutenancesAujourdhui: defenses.filter((item) => item.date === '15 Décembre').length,
    soutenancesAVenir: defenses.filter((item) => item.statut === 'a_venir').length,
    evaluationsEnAttente: 8,
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
        || (filter === 'today' && defense.date === '15 Décembre')
        || (filter === 'upcoming' && defense.statut === 'a_venir')
        || (filter === 'pending' && defense.statut === 'evaluation_en_attente')
        || (filter === 'completed' && defense.statut === 'evaluation_terminee');
      return matchesSearch && matchesFilter;
    });
  }, [filter, search]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'defenses') {
      onNavigate('jury-students');
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
      <TopBar title="EMIT" showBackButton onBackPress={onExit} showNotification />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.light.tint} />}
      >
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
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.profileTitle}>Évaluateur</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="calendar-outline" label="Soutenances aujourd’hui" value={stats.soutenancesAujourdhui} active={filter === 'today'} onPress={() => setFilter('today')} />
          <StatCard icon="calendar-clear-outline" label="Soutenances à venir" value={stats.soutenancesAVenir} active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
          <StatCard icon="clipboard-outline" label="Évaluations en attente" value={stats.evaluationsEnAttente} active={filter === 'pending'} urgent onPress={() => setFilter('pending')} />
          <StatCard icon="checkmark-circle-outline" label="Évaluations terminées" value={stats.evaluationsTerminees} active={filter === 'completed'} onPress={() => setFilter('completed')} />
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

        {filteredDefenses.map((defense) => (
          <DefenseCard
            key={defense.id}
            defense={defense}
            onPress={() => onNavigate('jury-defense', defense)}
          />
        ))}
        {filteredDefenses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={Colors.light.icon} />
            <Text style={styles.emptyText}>Aucune soutenance ne correspond à votre recherche.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="home"
        badges={juryTabBadges}
        accentColor={JURY_ACCENT_RED}
        onTabChange={handleTabChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
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
    color: Colors.light.tint,
    flex: 1,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginRight: 12,
    width: 56,
  },
  greeting: {
    color: Colors.light.icon,
    fontFamily: Fonts?.sans,
    fontSize: 14,
  },
  profileTitle: {
    color: Colors.light.tint,
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
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
    borderLeftColor: JURY_ACCENT_RED,
    borderLeftWidth: 4,
  },
  statIconUrgent: {
    backgroundColor: '#FEE2E2',
  },
  statValueUrgent: {
    color: JURY_ACCENT_RED,
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
});

export default JuryHomeScreen;
