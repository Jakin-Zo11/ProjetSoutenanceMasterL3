import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './components/pages/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import DepotsPage from './pages/admin/DepotsPage';
import PlanificationPage from './pages/admin/PlanificationPage';
import PvPage from './pages/admin/PvPage';
import CalendarPage from './components/pages/CalendarPage';
import SlotsPage from './components/pages/SlotsPage';
import AssignmentPage from './components/pages/AssignmentPage';
import { DefensesAndRoomsPage, TeachersAndJuriesPage } from './pages/admin/CombinedAdminViews';
import { AdminDataProvider } from './context/AdminDataContext';
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <AdminDataProvider>
        <Routes>
          <Route path="/" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/admin" replace />} />
            <Route path="admin" element={<Dashboard />} />
            <Route path="admin/etudiants" element={<DepotsPage />} />
            <Route path="admin/enseignants-jurys" element={<TeachersAndJuriesPage />} />
            <Route path="admin/soutenances-salles" element={<DefensesAndRoomsPage />} />
            <Route path="admin/creneaux" element={<SlotsPage />} />
            <Route path="admin/calendrier" element={<CalendarPage />} />
            <Route path="admin/affectation" element={<PlanificationPage initialTab="assignment" />} />
            <Route path="admin/evaluations" element={<PvPage initialTab="evaluations" />} />
            <Route path="admin/resultats-pv" element={<PvPage initialTab="results" />} />
            <Route path="admin/depots" element={<Navigate to="/admin/etudiants" replace />} />
            <Route path="admin/planification" element={<Navigate to="/admin/affectation" replace />} />
            <Route path="admin/pv" element={<Navigate to="/admin/resultats-pv" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AdminDataProvider>
    </BrowserRouter>
  );
};

export default App;
