import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-[#DDEAF7] px-6 py-3 flex justify-between items-center">
      {/* Gauche - Titre */}
      <div>
        <h1 className="text-xl font-bold text-[#0B1D3A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Droite - Actions */}
      <div className="flex items-center gap-4">
        {/* Badge EMIT */}
        <div className="px-3 py-1 rounded-full bg-[#EAF4FF] border border-[#2D84E0]">
          <span className="text-xs font-semibold text-[#1A4BA8]" style={{ fontFamily: 'Inter, sans-serif' }}>
            EMIT | 2024–2025
          </span>
        </div>

        {/* Input recherche (mocké) */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-64 px-4 py-2 bg-[#F0F5FB] border border-[#DDEAF7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D84E0] focus:border-transparent"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* Icône notification avec point rouge */}
        <button className="relative p-2 rounded-lg hover:bg-[#F0F5FB] transition-colors">
          <Bell size={20} className="text-[#1A4BA8]" aria-hidden="true" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full"></span>
        </button>

        {/* Avatar utilisateur */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2D84E0' }}>
          <span className="text-white font-semibold text-sm">AD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
