import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { juryTabItems, JURY_ACCENT_RED } from './juryNavigation';

interface ScreenProps { onBack: () => void; onNavigate: (screen: string) => void }

interface JurySession {
  id: string;
  date: string;
  time: string;
  room: string;
  studentName: string;
  studentId: string;
  team: {
    name: string;
    role: string;
  }[];
}

const JuryTeamScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const jurySessions: JurySession[] = [
    {
      id: 'SESSION-001',
      date: '15 Décembre 2024',
      time: '09:00',
      room: 'Salle A-101',
      studentName: 'Alice Martin',
      studentId: 'ETU-2024-001',
      team: [
        { name: 'Prof. Randriamanana', role: 'Président' },
        { name: 'Dr. Rasoarimanana', role: 'Rapporteur' },
        { name: 'Prof. Rakoto', role: 'Examinateur' },
      ],
    },
    {
      id: 'SESSION-002',
      date: '15 Décembre 2024',
      time: '11:30',
      room: 'Salle B-205',
      studentName: 'Pierre Leroy',
      studentId: 'ETU-2024-002',
      team: [
        { name: 'Prof. Randriamanana', role: 'Président' },
        { name: 'Dr. Rasoarimanana', role: 'Rapporteur' },
        { name: 'Prof. Rakoto', role: 'Examinateur' },
      ],
    },
    {
      id: 'SESSION-003',
      date: '16 Décembre 2024',
      time: '14:00',
      room: 'Salle C-305',
      studentName: 'Jean Dupont',
      studentId: 'ETU-2024-003',
      team: [
        { name: 'Prof. Randriamanana', role: 'Président' },
        { name: 'Dr. Rasoarimanana', role: 'Rapporteur' },
        { name: 'Prof. Rakoto', role: 'Examinateur' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F4E" />
      <TopBar title="Équipe Jury" showBackButton onBackPress={onBack} showNotification />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {jurySessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={styles.studentName}>{session.studentName}</Text>
                <Text style={styles.sessionDate}>{session.date} à {session.time}</Text>
                <Text style={styles.sessionRoom}>{session.room}</Text>
              </View>
              <View style={styles.sessionBadge}>
                <Ionicons name="people-outline" size={16} color={JURY_ACCENT_RED} />
                <Text style={styles.sessionBadgeText}>{session.team.length} membres</Text>
              </View>
            </View>

            <View style={styles.teamList}>
              {session.team.map((member, index) => (
                <View key={index} style={styles.teamMember}>
                  <View style={styles.memberIcon}>
                    <Ionicons name="person-outline" size={20} color="#0D1F4E" />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNav
        items={juryTabItems}
        activeTab="team"
        accentColor={JURY_ACCENT_RED}
        onTabChange={(tab) => {
          if (tab === 'home') onNavigate('jury');
          else if (tab === 'defenses') onNavigate('jury-students');
          else if (tab === 'team') onNavigate('jury-team');
          else if (tab === 'evaluations') onNavigate('jury-history');
          else if (tab === 'profile') onNavigate('jury-profile');
        }}
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
  sessionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDEAF7',
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1F4E',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  sessionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'Inter-Regular',
  },
  sessionRoom: {
    fontSize: 12,
    color: '#1A4BA8',
    fontFamily: 'Inter-SemiBold',
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: JURY_ACCENT_RED,
    fontFamily: 'Inter-SemiBold',
  },
  teamList: {
    borderTopWidth: 1,
    borderTopColor: '#EAF4FF',
    paddingTop: 12,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1F4E',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  memberRole: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
});

export default JuryTeamScreen;
