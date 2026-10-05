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
import { juryTabItems, JURY_ACCENT_BLUE } from './juryNavigation';
import { demoDefenses } from '../../types/defenseWorkflow';

interface ScreenProps { onBack: () => void; onNavigate: (screen: string) => void; teacherName: string }

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

const JuryTeamScreen: React.FC<ScreenProps> = ({ onBack, onNavigate, teacherName }) => {
  const jurySessions: JurySession[] = demoDefenses
    .filter((defense) => defense.jury.some((member) => member.name === teacherName))
    .map((defense) => ({
      id: defense.id,
      date: defense.date,
      time: defense.time,
      room: defense.room,
      studentName: defense.studentName,
      studentId: defense.studentMatricule,
      team: defense.jury,
    }));

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
                <Ionicons name="people-outline" size={16} color={JURY_ACCENT_BLUE} />
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
        accentColor={JURY_ACCENT_BLUE}
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
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: JURY_ACCENT_BLUE,
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
