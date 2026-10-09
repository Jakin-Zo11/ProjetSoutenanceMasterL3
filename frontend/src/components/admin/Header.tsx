import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuToggle }) => {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-[#E5EAF5] bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Ouvrir le menu"
          className="rounded-xl p-2 text-[#0B1F4B] transition hover:bg-[#E0F2FE] lg:hidden"
        >
          <Menu size={21} aria-hidden="true" />
        </button>
        <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-[#0B1F4B] sm:text-xl" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="hidden truncate text-sm text-[#52627D] sm:block" style={{ fontFamily: 'Inter, sans-serif' }}>
            {subtitle}
          </p>
        )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden rounded-full border border-[#BAE6FD] bg-[#E0F2FE] px-3 py-1.5 md:block">
          <span className="text-xs font-semibold text-[#0B1F4B]" style={{ fontFamily: 'Inter, sans-serif' }}>
            SESSION | 11–16 NOV. 2026
          </span>
        </div>

        <label className="relative hidden xl:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52627D]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Rechercher..."
            aria-label="Rechercher dans l’administration"
            className="w-56 rounded-xl border border-[#E5EAF5] bg-[#F5F8FF] py-2 pl-9 pr-3 text-sm text-[#0B1F4B] outline-none transition placeholder:text-[#52627D] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </label>

        <button
          type="button"
          aria-label="Notifications, nouvelles alertes"
          className="relative rounded-xl p-2 text-[#0B1F4B] transition hover:bg-[#E0F2FE]"
        >
          <Bell size={20} aria-hidden="true" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB]">
            <span className="text-xs font-semibold text-white">AD</span>
          </div>
          <span className="hidden text-sm font-semibold text-[#0B1F4B] sm:block">Administrateur</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
