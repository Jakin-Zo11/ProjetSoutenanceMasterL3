import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import { NAVIGATION_CONFIG } from '../components/admin/navigationConfig';

interface AdminLayoutProps {
  onLogout?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const page = NAVIGATION_CONFIG.flatMap((group) => group.items).find((item) => item.path === pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={page?.title ?? 'Administration'}
          subtitle={page?.subtitle ?? 'Système de gestion des soutenances'}
          onMenuToggle={() => setIsSidebarOpen((open) => !open)}
        />
        <main className={`min-h-0 flex-1 bg-[#F5F8FF] ${pathname === '/admin' ? 'overflow-hidden p-0' : 'overflow-y-auto p-5'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
