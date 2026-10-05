import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardPage from '../pages/DashboardPage';
import StudentsPage from '../pages/StudentsPage';
import SlotsPage from '../pages/SlotsPage';
import CalendarPage from '../pages/CalendarPage';
import AssignmentPage from '../pages/AssignmentPage';
import EvaluationsPage from '../pages/EvaluationsPage';
import ResultsPage from '../pages/ResultsPage';
import ReportsPage from '../pages/ReportsPage';
import { NAVIGATION_CONFIG } from '../admin/navigationConfig';
import { DefensesAndRoomsPage, TeachersAndJuriesPage } from '../../pages/admin/CombinedAdminViews';

interface LayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const page = NAVIGATION_CONFIG
    .flatMap((group) => group.items)
    .find((item) => item.id === activePage);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'etudiants':
        return <StudentsPage />;
      case 'enseignants_jurys':
        return <TeachersAndJuriesPage />;
      case 'soutenances_salles':
        return <DefensesAndRoomsPage />;
      case 'creneaux':
        return <SlotsPage />;
      case 'calendrier':
        return <CalendarPage />;
      case 'affectation':
        return <AssignmentPage />;
      case 'evaluations':
        return <EvaluationsPage />;
      case 'resultats_pv':
        return (
          <div className="space-y-6">
            <ResultsPage />
            <ReportsPage />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={activePage} onPageChange={setActivePage} onLogout={onLogout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={page?.title ?? 'Administration'}
          subtitle={page?.subtitle ?? 'Système de gestion des soutenances'}
        />
        <main className="flex-1 overflow-y-auto bg-[#F0F5FB] p-5">
          {children ?? renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Layout;
