import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import { NAVIGATION_CONFIG } from '../components/admin/navigationConfig';

interface AdminLayoutProps {
  onLogout?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const { pathname } = useLocation();
  const page = NAVIGATION_CONFIG.flatMap((group) => group.items).find((item) => item.path === pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={page?.title ?? 'Administration'}
          subtitle={page?.subtitle ?? 'Système de gestion des soutenances'}
        />
        <main className="flex-1 overflow-y-auto bg-[#F0F5FB] p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
