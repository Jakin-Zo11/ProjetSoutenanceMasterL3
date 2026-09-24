import React, { useState } from 'react';
import {
  Colors } from '../../constants/theme';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import { juryTabItems, juryTabBadges, JURY_ACCENT_RED } from './juryNavigation';

interface ScreenProps {
  onBack: () => void;
  onEvaluate: () => void;
  onNavigate: (screen: string) => void;
  defense?: {
    studentId: string;
    studentName: string;
    thesisTitle: string;
    date: string;
    time: string;
    room: string;
    status?: string;
  };
  evaluation?: {
    evaluee: true;
    average: number;
    mention: string;
  };
}

const DefenseDetailsScreen: React.FC<ScreenProps> = ({ onBack, onEvaluate, onNavigate, defense, evaluation }) => {
  // Données locales (Mock Data) — aucune requête réseau.
  const defenseData = {
    studentName: defense?.studentName ?? 'Alice Martin',
    studentMatricule: '001M24',
    date: defense?.date ?? '15 Décembre 2024',
    time: defense?.time ?? '09:00',
    room: defense?.room ?? 'Salle A-101',
    role: 'Président',
    thesisTitle: defense?.thesisTitle ?? 'Plateforme web de gestion des soutenances à l’EMIT',
    director: 'Prof. Randriamanana',
  };
  const juryMembers = [
    { role: 'Président', name: 'Prof. Randriamanana' },
    { role: 'Examinateur', name: 'Dr. M. Rakoto' },
    { role: 'Rapporteur', name: 'Dr. L. Andriamihaja' },
  ];
  const isEvaluated = Boolean(evaluation?.evaluee || defense?.status === 'evaluation_terminee');
  const [incidentVisible, setIncidentVisible] = useState(false);
  const [incident, setIncident] = useState('');
  const [documentVisible, setDocumentVisible] = useState(false);

  const submitIncident = () => {
    if (!incident.trim()) {
      Alert.alert('Description requise', 'Décrivez le problème avant de l’envoyer.');
      return;
    }
    // TODO: remplacer ce mock par l’envoi de la notification à l’administration.
    console.log('Jury incident reported to administration:', {
      studentId: defense?.studentId ?? defenseData.studentMatricule,
      message: incident.trim(),
    });
    setIncident('');
    setIncidentVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.navy} />
      <TopBar title="Détails soutenance" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Student Info Card */}
        <View style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>{defenseData.studentName.charAt(0)}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{defenseData.studentName}</Text>
            <Text style={styles.studentMatricule}>{defenseData.studentMatricule}</Text>
          </View>
        </View>

        {/* Defense Info Card */}
        <View style={styles.defenseCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.light.sky} />
            <Text style={styles.cardTitle}>Convocation</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{defenseData.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Heure</Text>
              <Text style={styles.infoValue}>{defenseData.time}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Salle</Text>
              <Text style={styles.infoValue}>{defenseData.room}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rôle</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{defenseData.role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Thesis Card */}
        <View style={styles.thesisCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="book-outline" size={20} color={Colors.light.sky} />
            <Text style={styles.cardTitle}>Thème / mémoire à évaluer</Text>
          </View>

          <Text style={styles.thesisTitle}>{defenseData.thesisTitle}</Text>
          <View style={styles.thesisMeta}>
            <Text style={styles.thesisLabel}>Directeur :</Text>
            <Text style={styles.thesisValue}>{defenseData.director}</Text>
          </View>
          <Text style={styles.descriptionLabel}>Description du mémoire</Text>
          <Text style={styles.descriptionText}>
            Ce mémoire présente une solution numérique pour organiser les soutenances,
            centraliser les convocations et faciliter le suivi des évaluations par les
            membres du jury.
          </Text>
          <Pressable style={({ pressed }) => [styles.documentButton, pressed && { opacity: 0.8 }]} onPress={() => setDocumentVisible(true)}>
            <Ionicons name="document-outline" size={18} color={Colors.light.white} />
            <Text style={styles.documentButtonText}>Consulter la rédaction</Text>
          </Pressable>
        </View>
        <View style={styles.juryCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="people-outline" size={20} color={Colors.light.sky} />
            <Text style={styles.cardTitle}>Composition du jury</Text>
          </View>
          {juryMembers.map((member) => (
            <View key={member.role} style={styles.juryRow}>
              <Text style={styles.juryRole}>{member.role}</Text>
              <Text style={styles.juryName}>{member.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusSummary}>
          <Text style={styles.infoLabel}>Statut</Text>
          <Text style={styles.statusSummaryText}>{isEvaluated ? 'Terminée' : 'En attente'}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.reportButton, pressed && { opacity: 0.8 }]}
          onPress={() => setIncidentVisible(true)}
        >
          <Ionicons name="warning-outline" size={18} color={Colors.light.error} />
          <Text style={styles.reportButtonText}>Signaler une indisponibilité ou un problème</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.stickyAction}>
        <Pressable style={({ pressed }) => [styles.evaluateButton, pressed && { opacity: 0.8 }]} onPress={onEvaluate}>
          <View style={styles.evaluateButtonContent}>
            <Ionicons name={isEvaluated ? 'eye-outline' : 'create-outline'} size={18} color={Colors.light.white} />
            <Text style={styles.evaluateButtonText}>{isEvaluated ? 'Voir mon évaluation' : 'Commencer l’évaluation'}</Text>
          </View>
        </Pressable>
      </View>

      <BottomNav
        items={juryTabItems}
        activeTab="defenses"
        badges={juryTabBadges}
        accentColor={JURY_ACCENT_RED}
        onTabChange={(tab) => {
          if (tab === 'home') onBack();
          if (tab === 'evaluations') onNavigate('jury-history');
          if (tab === 'profile') onNavigate('jury-profile');
        }}
      />
      <Modal visible={documentVisible} transparent animationType="slide" onRequestClose={() => setDocumentVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Aperçu du document</Text>
            <Text style={styles.modalHint}>
              La rédaction du mémoire sera disponible ici lorsque l’intégration documentaire sera prête.
            </Text>
            {/* TODO: remplacer cet aperçu par le document réel. */}
            <Pressable onPress={() => setDocumentVisible(false)} style={({ pressed }) => [styles.sendButton, pressed && { opacity: 0.8 }]}>
              <Text style={styles.sendButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={incidentVisible} transparent animationType="slide" onRequestClose={() => setIncidentVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Signaler un problème</Text>
            <Text style={styles.modalHint}>Retard de salle, absence d’un membre ou problème technique.</Text>
            <TextInput
              value={incident}
              onChangeText={setIncident}
              placeholder="Décrivez le problème..."
              placeholderTextColor={Colors.light.tabIconDefault}
              multiline
              textAlignVertical="top"
              style={styles.incidentInput}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIncidentVisible(false)} style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable onPress={submitIncident} style={({ pressed }) => [styles.sendButton, pressed && { opacity: 0.8 }]}>
                <Ionicons name="send-outline" size={17} color={Colors.light.white} />
                <Text style={styles.sendButtonText}>Envoyer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  studentCard: {
    backgroundColor: Colors.light.white,
    margin: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  studentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.navy,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.navy,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  studentMatricule: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontFamily: 'Inter-Regular',
  },
  defenseCard: {
    backgroundColor: Colors.light.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  thesisCard: {
    backgroundColor: Colors.light.white,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  juryCard: {
    backgroundColor: Colors.light.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    elevation: 4,
  },
  juryRow: {
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  juryRole: {
    color: Colors.light.tabIconDefault,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  juryName: {
    color: Colors.light.navy,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.navy,
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.navy,
    fontFamily: 'Inter-SemiBold',
  },
  roleBadge: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    fontFamily: 'Inter-SemiBold',
  },
  thesisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.navy,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  thesisMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  thesisLabel: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontFamily: 'Inter-Regular',
  },
  thesisValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.navy,
    fontFamily: 'Inter-SemiBold',
  },
  descriptionLabel: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 13,
    color: Colors.light.muted,
    fontFamily: 'Inter-SemiBold',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
  },
  documentButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.sky,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  documentButtonText: {
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  stickyAction: {
    backgroundColor: Colors.light.surface,
    paddingTop: 8,
  },
  statusSummary: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSummaryText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  evaluateButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(26,75,168,0.3)',
    elevation: 8,
  },
  evaluateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
  },
  evaluateButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  reportButton: {
    alignItems: 'center',
    borderColor: Colors.light.error,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
  },
  reportButtonText: {
    color: Colors.light.error,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    marginLeft: 8,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(13, 31, 78, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: Colors.light.navy,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    marginBottom: 6,
  },
  modalHint: {
    color: Colors.light.tabIconDefault,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginBottom: 14,
  },
  incidentInput: {
    borderColor: Colors.light.border,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.light.navy,
    minHeight: 110,
    padding: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelButton: {
    alignItems: 'center',
    // Bouton d'annulation : touche rouge (#EF4444).
    backgroundColor: '#FEE2E2',
    borderColor: JURY_ACCENT_RED,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 13,
  },
  cancelButtonText: {
    color: JURY_ACCENT_RED,
    fontFamily: 'Inter-SemiBold',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  sendButtonText: {
    color: Colors.light.white,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
});

export default DefenseDetailsScreen;
