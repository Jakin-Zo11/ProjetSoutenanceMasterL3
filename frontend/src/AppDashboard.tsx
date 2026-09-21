import React, { useState } from 'react';
import LoginPage from './components/pages/LoginPage';
import Layout from './components/layout/Layout';

const AppDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Layout onLogout={handleLogout} />;
};

export default AppDashboard;
