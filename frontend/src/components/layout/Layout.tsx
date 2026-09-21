import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardPage from '../pages/DashboardPage';
import StudentsPage from '../pages/StudentsPage';
import TeachersPage from '../pages/TeachersPage';
import JurysPage from '../pages/JurysPage';
import RoomsPage from '../pages/RoomsPage';
import DefensesPage from '../pages/DefensesPage';
import SlotsPage from '../pages/SlotsPage';
import CalendarPage from '../pages/CalendarPage';
import AssignmentPage from '../pages/AssignmentPage';
import EvaluationsPage from '../pages/EvaluationsPage';
import ResultsPage from '../pages/ResultsPage';
import ReportsPage from '../pages/ReportsPage';

interface LayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');

  const getPageInfo = () => {
    const pageInfo: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble du système de gestion des soutenances' },
      students: { title: 'Étudiants', subtitle: 'Gestion des étudiants inscrits' },
      teachers: { title: 'Enseignants', subtitle: 'Administration du corps enseignant' },
      jurys: { title: 'Jurys', subtitle: 'Gestion des membres de jury' },
      rooms: { title: 'Salles', subtitle: 'Administration des espaces de soutenance' },
      defenses: { title: 'Soutenances', subtitle: 'Planification et suivi des soutenances' },
      slots: { title: 'Créneaux', subtitle: 'Gestion des créneaux horaires' },
      calendar: { title: 'Calendrier', subtitle: 'Vue calendrier des soutenances' },
      assignment: { title: 'Affectation jury', subtitle: 'Affectation des jurys aux soutenances' },
      evaluations: { title: 'Évaluations', subtitle: 'Suivi des évaluations en cours' },
      results: { title: 'Résultats', subtitle: 'Consultation et publication des résultats' },
      reports: { title: 'PV / Rapports', subtitle: 'Gestion des procès-verbaux et rapports' }
    };

    return pageInfo[activePage] || pageInfo.dashboard;
  };

  const { title, subtitle } = getPageInfo();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'students':
        return <StudentsPage />;
      case 'teachers':
        return <TeachersPage />;
      case 'jurys':
        return <JurysPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'defenses':
        return <DefensesPage />;
      case 'slots':
        return <SlotsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'assignment':
        return <AssignmentPage />;
      case 'evaluations':
        return <EvaluationsPage />;
      case 'results':
        return <ResultsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#637799] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sélectionnez une page
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar fixe */}
      <Sidebar activePage={activePage} onPageChange={setActivePage} onLogout={onLogout} />

      {/* Colonne droite */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header fixe */}
        <Header title={title} subtitle={subtitle} />

        {/* Main scrollable */}
        <main className="flex-1 overflow-y-auto bg-[#F0F5FB] p-5">
          {children || renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Layout;
