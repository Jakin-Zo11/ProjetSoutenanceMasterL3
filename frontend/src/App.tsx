import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './components/pages/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import EtudiantsPage from './pages/admin/EtudiantsPage';
import EnseignantsPage from './pages/admin/EnseignantsPage';
import JurysPage from './pages/admin/JurysPage';
import SallesPage from './pages/admin/SallesPage';
import SoutenancesPage from './pages/admin/SoutenancesPage';
import CreneauxPage from './pages/admin/CreneauxPage';
import CalendrierPage from './pages/admin/CalendrierPage';
import AffectationJuryPage from './pages/admin/AffectationJuryPage';
import EvaluationsPage from './pages/admin/EvaluationsPage';
import ResultatsPage from './pages/admin/ResultatsPage';
import PvPage from './pages/admin/PvPage';
import { GestionIndisponibilitesCalendar } from './pages/enseignant/GestionIndisponibilitesCalendar';
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
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin" replace />} />
          <Route path="admin" element={<Dashboard />} />
          <Route path="admin/etudiants" element={<EtudiantsPage />} />
          <Route path="admin/enseignants" element={<EnseignantsPage />} />
          <Route path="admin/jurys" element={<JurysPage />} />
          <Route path="admin/salles" element={<SallesPage />} />
          <Route path="admin/soutenances" element={<SoutenancesPage />} />
          <Route path="admin/creneaux" element={<CreneauxPage />} />
          <Route path="admin/calendrier" element={<CalendrierPage />} />
          <Route path="admin/affectation-jury" element={<AffectationJuryPage />} />
          <Route path="admin/evaluations" element={<EvaluationsPage />} />
          <Route path="admin/resultats" element={<ResultatsPage />} />
          <Route path="admin/pv" element={<PvPage />} />

          {/* TODO (Lauris) : routes planification a activer une fois les pages codees */}
          <Route
            path="enseignant/indisponibilites"
            element={<GestionIndisponibilitesCalendar enseignantId={1} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;