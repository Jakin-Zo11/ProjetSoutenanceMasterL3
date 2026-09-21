import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/admin') return { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble du système de gestion des soutenances' };
    if (path === '/admin/etudiants') return { title: 'Étudiants', subtitle: 'Gestion des étudiants inscrits aux soutenances' };
    if (path === '/admin/enseignants') return { title: 'Enseignants', subtitle: 'Gestion des enseignants et membres de jury' };
    if (path === '/admin/jurys') return { title: 'Jurys', subtitle: 'Gestion des jurys de soutenance' };
    if (path === '/admin/salles') return { title: 'Salles', subtitle: 'Gestion des salles de soutenance' };
    if (path === '/admin/soutenances') return { title: 'Soutenances', subtitle: 'Gestion des soutenances de master' };
    if (path === '/admin/creneaux') return { title: 'Créneaux', subtitle: 'Gestion des créneaux horaires de soutenance' };
    if (path === '/admin/calendrier') return { title: 'Calendrier', subtitle: 'Vue hebdomadaire des soutenances' };
    if (path === '/admin/affectation-jury') return { title: 'Affectation Jury', subtitle: 'Affectation des jurys aux soutenances' };
    if (path === '/admin/evaluations') return { title: 'Évaluations', subtitle: 'Gestion des évaluations des soutenances' };
    if (path === '/admin/resultats') return { title: 'Résultats', subtitle: 'Gestion et publication des résultats de soutenance' };
    if (path === '/admin/pv') return { title: 'PV / Rapports', subtitle: 'Gestion des procès-verbaux de soutenance' };
    return { title: 'Administration', subtitle: 'Système de gestion des soutenances' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Colonne droite */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={title} subtitle={subtitle} />

        {/* Outlet scrollable */}
        <main className="flex-1 overflow-y-auto bg-[#F0F5FB] p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
