import React from 'react';
import BottomNav from '../common/BottomNav';

interface StudentTabNavigatorProps {
  activeTab: 'home' | 'convocation' | 'results' | 'profile';
  onNavigate: (screen: 'student' | 'student-defense' | 'student-results' | 'student-profile') => void;
}

const tabs = [
  { id: 'home', icon: 'home-outline' as const, label: 'Accueil' },
  { id: 'convocation', icon: 'calendar-outline' as const, label: 'Convocation' },
  { id: 'results', icon: 'document-text-outline' as const, label: 'Résultats & PV' },
  { id: 'profile', icon: 'person-circle-outline' as const, label: 'Profil' },
];

const StudentTabNavigator: React.FC<StudentTabNavigatorProps> = ({ activeTab, onNavigate }) => (
  <BottomNav
    items={tabs}
    activeTab={activeTab}
    accentColor="#3B82F6"
    onTabChange={(tab) => {
      if (tab === 'convocation') onNavigate('student-defense');
      else if (tab === 'results') onNavigate('student-results');
      else if (tab === 'profile') onNavigate('student-profile');
      else onNavigate('student');
    }}
  />
);

export default StudentTabNavigator;
