import React from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-[#DDEAF7] px-6 py-3 flex items-center justify-between">
      {/* Gauche — Titre de la page */}
      <div>
        <h1 className="text-xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {title}
        </h1>
        <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {subtitle}
        </p>
      </div>

      {/* Droite — Badge, Recherche, Notifications, Avatar */}
      <div className="flex items-center gap-4">
        {/* Badge Session */}
        <span className="px-3 py-1.5 bg-[#F0F5FB] border border-[#DDEAF7] text-[#637799] text-xs font-medium rounded-lg">
          EMIT | 2024 – 2025
        </span>

        {/* Input Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#637799]" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg text-sm w-[190px] focus:outline-none focus:ring-2 focus:ring-[#2D84E0] focus:border-transparent"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* Icône Cloche avec notification */}
        <button className="relative p-2 text-[#637799] hover:text-[#0B1D3A] hover:bg-[#F0F5FB] rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 bg-[#2D84E0] rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">AM</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
