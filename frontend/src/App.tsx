import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './components/pages/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import DepotsPage from './pages/admin/DepotsPage';
import PlanificationPage from './pages/admin/PlanificationPage';
import PvPage from './pages/admin/PvPage';
import EvaluationPage from './pages/admin/EvaluationPage';
import CreneauxPage from './pages/admin/CreneauxPage';
import CalendarPage from './components/pages/CalendarPage';
import { DefensesAndRoomsPage, EvaluatorsPage } from './pages/admin/CombinedAdminViews';
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
            <Route path="admin/evaluateurs" element={<EvaluatorsPage />} />
            <Route path="admin/enseignants-jurys" element={<Navigate to="/admin/evaluateurs" replace />} />
            <Route path="admin/soutenances-salles" element={<DefensesAndRoomsPage />} />
            <Route path="admin/creneaux" element={<CreneauxPage />} />
            <Route path="admin/calendrier" element={<CalendarPage />} />
            <Route path="admin/planification" element={<PlanificationPage />} />
            <Route path="admin/affectation" element={<Navigate to="/admin/planification" replace />} />
                        <Route path="admin/evaluations" element={<PvPage initialTab="evaluations" />} />
            <Route path="admin/suivi-evaluations" element={<EvaluationPage />} />
            <Route path="admin/resultats-pv" element={<PvPage initialTab="results" />} />
            <Route path="admin/depots" element={<Navigate to="/admin/etudiants" replace />} />
            <Route path="admin/pv" element={<Navigate to="/admin/resultats-pv" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AdminDataProvider>
    </BrowserRouter>
  );
};

export default App;
