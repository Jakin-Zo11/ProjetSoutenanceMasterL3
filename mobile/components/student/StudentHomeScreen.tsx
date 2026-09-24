import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { StudentProfile } from './StudentLoginScreen';
import { studentTabItems, navigateStudentTab } from './studentNavigation';

interface ShortcutCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  locked?: boolean;
  onPress: () => void;
}

interface StudentHomeScreenProps {
  student: StudentProfile;
  themeSubmitted: boolean;
  convocationReady: boolean;
  onNavigate: (screen: string) => void;
  onOpenTheme: () => void;
  onExit: () => void;
}

const ShortcutCard: React.FC<ShortcutCardProps> = ({ icon, title, locked, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.shortcutCard, locked && styles.shortcutCardLocked, pressed && { opacity: 0.8 }]}
  >
    <View style={styles.shortcutIcon}>
      <Ionicons name={icon} size={24} color="#0D1F4E" />
    </View>
    <Text style={styles.shortcutTitle}>{title}</Text>
    {locked ? <Text style={styles.lockedText}>Après soutenance</Text> : null}
  </Pressable>
);

const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({ student, themeSubmitted, convocationReady, onNavigate, onOpenTheme, onExit }) => {

  const shortcuts: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    screen: string;
    locked?: boolean;
  }[] = [
    { icon: 'calendar-outline', title: 'Ma soutenance', screen: 'student-defense', locked: !convocationReady },
    { icon: 'document-text-outline', title: 'Ma convocation', screen: 'student-convocation', locked: !convocationReady },
    { icon: 'book-outline', title: 'Mon sujet de thèse', screen: 'student-thesis' },
    { icon: 'stats-chart-outline', title: 'Mon résultat', screen: 'student-result', locked: true },
    { icon: 'create-outline', title: 'PV de soutenance', screen: 'student-pv', locked: true },
    { icon: 'notifications-outline', title: 'Notifications', screen: 'student-notifications', locked: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="EMIT" showBackButton onBackPress={onExit} showNotification={false} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingBlock}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.greeting}>Bonjour,</Text>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentMatricule}>Matricule: {student.matricule}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.8 }]}>
                <Ionicons name="search-outline" size={20} color="#0D1F4E" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.8 }]}
                onPress={() => onNavigate('student-notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color="#0D1F4E" />
                {convocationReady && <View style={styles.unreadBadge} />}
              </Pressable>
            </View>
          </View>
          <Text style={styles.pageHeading}>Suivi de Soutenance & Mémoire</Text>
        </View>

        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={22} color="#FFFFFF" />
            <Text style={styles.statLabel}>Dépôt</Text>
            <Text style={styles.statValue}>En cours</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.statLabel}>Avis encadreur</Text>
            <Text style={styles.statValue}>{themeSubmitted ? 'Validé' : 'En attente'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={22} color="#FFFFFF" />
            <Text style={styles.statLabel}>Jours restants</Text>
            <Text style={styles.statValue}>14 jours</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {[
            ['Tous', 'apps-outline'],
            ['Mon mémoire', 'book-outline'],
            ['Mon jury', 'people-outline'],
            ['Soutenance', 'calendar-outline'],
            ['Documents', 'document-text-outline'],
          ].map(([filter, icon], index) => (
            <View key={filter} style={[styles.filterChip, index === 0 && styles.filterChipActive]}>
              <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={15} color={index === 0 ? '#0D1F4E' : '#637799'} />
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.modulesHeader}>
          <View style={styles.modulesTitleRow}>
            <Text style={styles.modulesTitle}>Modules & Services</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>4</Text></View>
          </View>
          <Pressable style={({ pressed }) => [styles.submitAction, pressed && { opacity: 0.8 }]} onPress={onOpenTheme}>
            <Ionicons name="add" size={18} color="#2D84E0" />
            <Text style={styles.submitActionText}>Soumettre fichier</Text>
          </Pressable>
        </View>

        <View style={styles.servicesGrid}>
          <View style={styles.serviceCard}>
            <View style={styles.serviceTopRow}>
              <View style={styles.serviceIcon}><Ionicons name="book-outline" size={22} color="#2D84E0" /></View>
              <Ionicons name={themeSubmitted ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={themeSubmitted ? '#2D84E0' : '#637799'} />
            </View>
            <Text style={styles.serviceTitle}>Sujet de thèse</Text>
            <Text style={styles.serviceSubtitle}>{themeSubmitted ? 'Dernière version validée' : 'À renseigner'}</Text>
            <View style={styles.serviceBottomRow}>
              <Text style={styles.serviceStatusText}>{themeSubmitted ? 'Validé' : 'En attente'}</Text>
              <View style={styles.serviceStatus}><Ionicons name={themeSubmitted ? 'checkmark' : 'time-outline'} size={13} color="#1A4BA8" /></View>
            </View>
          </View>
          <View style={styles.serviceCard}>
            <View style={styles.serviceTopRow}>
              <View style={styles.serviceIcon}><Ionicons name="person-outline" size={22} color="#2D84E0" /></View>
              <Ionicons name="checkmark-circle" size={18} color="#2D84E0" />
            </View>
            <Text style={styles.serviceTitle}>Prof. Encadreur</Text>
            <Text style={styles.serviceSubtitle}>3 RDV validés</Text>
            <View style={styles.serviceBottomRow}>
              <Pressable style={({ pressed }) => [styles.serviceLink, pressed && { opacity: 0.8 }]}><Text style={styles.serviceLinkText}>Contacter</Text></Pressable>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.serviceCard, pressed && { opacity: 0.8 }]} onPress={() => onNavigate('student-defense')}>
            <View style={styles.serviceTopRow}>
              <View style={styles.serviceIcon}><Ionicons name="calendar-outline" size={22} color="#2D84E0" /></View>
              <Ionicons name="chevron-forward-circle-outline" size={18} color="#2D84E0" />
            </View>
            <Text style={styles.serviceTitle}>Jury assigné</Text>
            <Text style={styles.serviceSubtitle}>{convocationReady ? 'Salle C12 - 10h00' : 'En attente'}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.alertServiceCard, pressed && { opacity: 0.8 }]} onPress={() => onNavigate('student-convocation')}>
            <View style={styles.serviceTopRow}>
              <View style={styles.alertIcon}><Ionicons name="warning-outline" size={22} color="#EF4444" /></View>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            </View>
            <Text style={styles.serviceTitle}>Convocation</Text>
            <Text style={styles.alertSubtitle}>{convocationReady ? 'Disponible' : 'Action requise'}</Text>
          </Pressable>
        </View>

        {/* Existing detailed status and shortcuts */}
        <View style={styles.legacySection}>
          <Text style={styles.sectionTitle}>Détails de soutenance</Text>
          <View style={styles.defenseBadge}>
            <Text style={styles.defenseBadgeText}>{convocationReady ? 'Convocation disponible' : 'En attente de convocation'}</Text>
          </View>
          </View>
        <View style={styles.defenseCard}>
          <View style={styles.defenseInfoRow}>
            <View style={styles.defenseInfoItem}>
              <Text style={styles.defenseInfoLabel}>Date</Text>
                <Text style={styles.defenseInfoValue}>{convocationReady ? '20 Décembre 2024' : 'À venir'}</Text>
            </View>
            <View style={styles.defenseInfoItem}>
              <Text style={styles.defenseInfoLabel}>Heure</Text>
                <Text style={styles.defenseInfoValue}>{convocationReady ? '09:00' : 'À définir'}</Text>
            </View>
          </View>
          <View style={styles.defenseInfoRow}>
            <View style={styles.defenseInfoItem}>
              <Text style={styles.defenseInfoLabel}>Salle</Text>
                <Text style={styles.defenseInfoValue}>{convocationReady ? 'Salle A101' : 'À définir'}</Text>
            </View>
            <View style={styles.defenseInfoItem}>
              <Text style={styles.defenseInfoLabel}>Statut</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{convocationReady ? 'Confirmée' : 'Convocation attendue'}</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.convocationButton, pressed && { opacity: 0.8 }]}
            onPress={() => onNavigate('student-convocation')}
          >
            <Text style={styles.convocationButtonText}>Voir ma convocation</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Mon parcours</Text>
          <Text style={styles.profileName}>{student.name}</Text>
          <Text style={styles.profileMeta}>{student.email} · {student.status}</Text>
          <Text style={styles.profileValue}>{student.formation}</Text>
          <Text style={styles.profileMeta}>{student.promotion}</Text>
        </View>

        <View style={styles.themeCard}>
          <Text style={styles.cardTitle}>{themeSubmitted ? 'Thème validé' : 'Action requise'}</Text>
          <Text style={styles.themeDescription}>{themeSubmitted ? 'Votre thème est validé. La convocation sera disponible dans quelques instants.' : 'Vous devez renseigner votre thème de stage ou mémoire.'}</Text>
          {!themeSubmitted ? <Pressable style={({ pressed }) => [styles.themeButton, pressed && { opacity: 0.8 }]} onPress={onOpenTheme}><Text style={styles.themeButtonText}>Renseigner mon thème</Text></Pressable> : null}
        </View>

        {/* Notification Banner (if needed) */}
        {/* <View style={styles.notificationBanner}>
          <View style={styles.notificationBannerContent}>
            <Ionicons name="warning-outline" size={18} color="#92400E" />
            <Text style={styles.notificationBannerText}>Votre soutenance a été reprogrammée</Text>
          </View>
        </View> */}

        {/* Shortcuts */}
        <View style={styles.shortcutsSection}>
          <Text style={styles.sectionTitle}>Accès rapides</Text>
          <View style={styles.shortcutsGrid}>
            {shortcuts.map((shortcut) => (
              <ShortcutCard
                key={shortcut.screen}
                {...shortcut}
                onPress={() => onNavigate(shortcut.screen)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav
        items={studentTabItems}
        activeTab="home"
        onTabChange={(tab) => navigateStudentTab(tab, onNavigate)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0D1F4E',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#2D84E0',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  greeting: {
    color: '#DDEAF7',
    fontSize: 12,
    marginBottom: 2,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 4,
  },
  studentMatricule: {
    fontSize: 14,
    color: '#2D84E0',
    fontFamily: 'Inter-Regular',
  },
  pageHeading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 24,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
  },
  statsBanner: {
    backgroundColor: '#1A4BA8',
    borderRadius: 14,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    backgroundColor: '#FFFFFF55',
    height: '100%',
    width: 1,
  },
  statLabel: {
    color: '#DDEAF7',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },
  filters: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterChip: {
    alignItems: 'center',
    borderColor: '#DDEAF7',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: '#EAF4FF',
    borderColor: '#2D84E0',
  },
  filterText: {
    color: '#637799',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#0D1F4E',
    fontWeight: '700',
  },
  modulesHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  modulesTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  modulesTitle: {
    color: '#0D1F4E',
    fontSize: 17,
    fontWeight: '800',
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#2D84E0',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginLeft: 8,
    width: 24,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  submitAction: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  submitActionText: {
    color: '#2D84E0',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 3,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDEAF7',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    width: '48%',
    boxShadow: '0px 2px 8px rgba(13,31,78,0.06)',
    elevation: 2,
  },
  alertServiceCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    width: '48%',
  },
  serviceIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
    width: 40,
  },
  serviceTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  alertIcon: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
    width: 40,
  },
  serviceTitle: {
    color: '#0D1F4E',
    fontSize: 14,
    fontWeight: '800',
  },
  serviceSubtitle: {
    color: '#637799',
    fontSize: 12,
    marginTop: 5,
  },
  alertSubtitle: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  serviceStatus: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF4FF',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  serviceBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    minHeight: 24,
  },
  serviceStatusText: {
    color: '#1A4BA8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 12,
  },
  serviceLink: {
    marginTop: 12,
  },
  serviceLinkText: {
    color: '#2D84E0',
    fontSize: 12,
    fontWeight: '700',
  },
  legacySection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  defenseBadge: {
    backgroundColor: '#2D84E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  defenseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  defenseCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.06)',
    elevation: 4,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDEAF7',
    borderWidth: 1,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  themeCard: {
    backgroundColor: '#FFF8E8',
    borderColor: '#F2D18A',
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
  },
  cardTitle: {
    color: '#0D1F4E',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  profileName: {
    color: '#0D1F4E',
    fontSize: 18,
    fontWeight: '700',
  },
  profileValue: {
    color: '#1A4BA8',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 14,
  },
  profileMeta: {
    color: '#667085',
    fontSize: 12,
    marginTop: 4,
  },
  themeDescription: {
    color: '#6B4E16',
    fontSize: 13,
    lineHeight: 19,
  },
  themeButton: {
    alignItems: 'center',
    backgroundColor: '#E5B45F',
    borderRadius: 12,
    marginTop: 14,
    paddingVertical: 12,
  },
  themeButtonText: {
    color: '#0D1F4E',
    fontSize: 13,
    fontWeight: '700',
  },
  defenseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  convocationButton: {
    alignItems: 'center',
    backgroundColor: '#2D84E0',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
    paddingVertical: 12,
  },
  convocationButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8,
  },
  defenseInfoItem: {
    flex: 1,
  },
  defenseInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  defenseInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1F4E',
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
  notificationBanner: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  notificationBannerText: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
  },
  notificationBannerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  shortcutsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1F4E',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shortcutCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDEAF7',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  shortcutCardLocked: {
    opacity: 0.48,
  },
  shortcutIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EAF4FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  shortcutIconText: {
    fontSize: 24,
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1F4E',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  lockedText: {
    color: '#667085',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default StudentHomeScreen;
