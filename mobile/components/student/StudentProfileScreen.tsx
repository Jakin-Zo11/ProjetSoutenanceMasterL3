import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { studentTabItems, navigateStudentTab } from './studentNavigation';
import { updateStudentProfile, logoutStudent } from '../../services/studentApi';
import type { StudentProfile } from './StudentLoginScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProfileScreenProps {
  student: StudentProfile;
  onNavigate: (screen: string) => void;
  onExit: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Initiales depuis le nom complet — ex: "RAKOTO Jean" → "RJ" */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  // Prend la première lettre du premier et du dernier mot
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Traduit le statut backend en libellé lisible */
function formatStatus(status: string): string {
  return status === 'actif' ? 'Actif' : 'Inactif';
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  locked?: boolean;
  last?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, locked, last }) => (
  <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueRow}>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value || '—'}
      </Text>
      {locked && (
        <Ionicons name="lock-closed" size={12} color="#9CA3AF" style={styles.lockIcon} />
      )}
    </View>
  </View>
);

interface SectionHeaderProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  iconColor?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  iconName,
  title,
  iconColor = '#1A4BA8',
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIconBubble, { backgroundColor: `${iconColor}18` }]}>
      <Ionicons name={iconName} size={16} color={iconColor} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ─── Écran principal ──────────────────────────────────────────────────────────

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({
  student,
  onNavigate,
  onExit,
}) => {
  // État local des champs éditables — initialisé depuis les données du backend
  const [email,     setEmail]     = useState(student.email);
  const [telephone, setTelephone] = useState(student.telephone);

  const [isEditing,  setIsEditing]  = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);
  const [saveError,  setSaveError]  = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initials = getInitials(student.name);

  // ── Édition ────────────────────────────────────────────────────────────────

  const handleEdit = () => {
    setSaveError('');
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Réinitialise les champs à la valeur d'origine
    setEmail(student.email);
    setTelephone(student.telephone);
    setSaveError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await updateStudentProfile({ email, telephone });
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossible de sauvegarder. Vérifiez votre connexion.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Déconnexion ────────────────────────────────────────────────────────────

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            logoutStudent();   // efface le token en mémoire
            onExit();
          },
        },
      ],
    );
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Mon profil" showNotification={false} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header avatar ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.headerName}>{student.name}</Text>
          <Text style={styles.headerMatricule}>{student.matricule}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>{formatStatus(student.status)}</Text>
          </View>
        </View>

        {/* ── Pill matricule (verrouillé) ── */}
        <View style={styles.matriculePill}>
          <Ionicons name="card-outline" size={15} color="#1A4BA8" />
          <Text style={styles.matriculePillText}>{student.matricule}</Text>
          <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
        </View>

        {/* ── Section : Informations verrouillées ── */}
        <View style={styles.section}>
          <SectionHeader
            iconName="person-outline"
            title="Identité (non modifiable)"
            iconColor="#1A4BA8"
          />
          <View style={styles.sectionBody}>
            <InfoRow label="Nom complet"  value={student.name}       locked />
            <InfoRow label="Matricule"    value={student.matricule}  locked last />
          </View>
        </View>

        {/* ── Section : Contact (modifiable) ── */}
        <View style={styles.section}>
          <SectionHeader
            iconName="call-outline"
            title="Contact"
            iconColor="#0891B2"
          />
          <View style={styles.sectionBody}>
            {/* Email */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="exemple@email.com"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue} numberOfLines={1}>
                  {email || '—'}
                </Text>
              )}
            </View>

            {/* Téléphone */}
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                  placeholder="+261 34 00 000 00"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue} numberOfLines={1}>
                  {telephone || '—'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Section : Formation ── */}
        <View style={styles.section}>
          <SectionHeader
            iconName="school-outline"
            title="Formation"
            iconColor="#7C3AED"
          />
          <View style={styles.sectionBody}>
            <InfoRow label="Filière"    value={student.formation} locked />
            <InfoRow label="Promotion"  value={student.promotion} locked last />
          </View>
        </View>

        {/* ── Feedback sauvegarde ── */}
        {saveSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.successText}>Profil mis à jour avec succès.</Text>
          </View>
        )}
        {!!saveError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#B42318" />
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        )}

        {/* ── Boutons d'action ── */}
        <View style={styles.actionsSection}>
          {isEditing ? (
            /* Mode édition : Annuler + Enregistrer */
            <View style={styles.editActions}>
              <Pressable
                onPress={handleCancel}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveButton,
                  isSaving && { opacity: 0.6 },
                  pressed && !isSaving && { opacity: 0.85 },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            /* Mode lecture : Modifier */
            <Pressable
              onPress={handleEdit}
              style={({ pressed }) => [
                styles.editButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="create-outline" size={18} color="#1A4BA8" />
              <Text style={styles.editButtonText}>Modifier mes coordonnées</Text>
            </Pressable>
          )}

          {/* Déconnexion */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
          >
            <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNav
        items={studentTabItems}
        activeTab="profile"
        onTabChange={(tab) => navigateStudentTab(tab, onNavigate)}
      />
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FF' },
  scrollView: { flex: 1 },

  // Header
  profileHeader: {
    backgroundColor: '#0D1F4E',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#2D84E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1A4BA8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerMatricule: {
    fontSize: 14,
    color: '#95C5F2',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45,132,224,0.2)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },

  // Pill matricule
  matriculePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: -18,
    gap: 8,
    elevation: 4,
    shadowColor: '#0D1F4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  matriculePillText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1F4E',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 2,
  },

  // Sections
  section: { marginHorizontal: 20, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#0D1F4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  // Lignes info
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
    gap: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1F4E',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
  lockIcon: { marginLeft: 2 },

  // Input mode édition
  editInput: {
    flex: 2,
    fontSize: 14,
    color: '#0D1F4E',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    borderBottomWidth: 1.5,
    borderBottomColor: '#2D84E0',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },

  // Banners feedback
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  successText: {
    fontSize: 13,
    color: '#059669',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFF1F0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDA29B',
  },
  errorText: {
    fontSize: 13,
    color: '#B42318',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },

  // Actions
  actionsSection: { marginHorizontal: 20, marginTop: 24, gap: 12 },
  editActions: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A4BA8',
    elevation: 3,
    shadowColor: '#1A4BA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1A4BA8',
    elevation: 2,
    shadowColor: '#0D1F4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacer: { height: 24 },
});

export default StudentProfileScreen;
