import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAVIGATION_CONFIG } from './navigationConfig';

interface SidebarProps {
  activePage?: string;
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, onLogout }) => {
  const isStateNavigation = Boolean(onPageChange);

  return <aside className="flex h-screen w-64 flex-col overflow-hidden bg-[#0A192F]">
    <div className="flex items-center space-x-3.5 border-b border-white/10 p-4">
      <img
        src="/logo.png"
        alt="Logo EMIT"
        className="h-14 w-14 shrink-0 object-contain"
      />
      <div className="min-w-0">
        <p className="text-xs font-bold leading-tight text-white">
          École de Management et d'Innovation Technologique
        </p>
        <p className="mt-0.5 text-[10px] text-white/60">
          Université de Fianarantsoa
        </p>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-3 py-4">
      {NAVIGATION_CONFIG.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-white/80">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const activeClassName = 'border-[#3B82F6] bg-[#3B82F6]/20 font-bold text-white';
              const inactiveClassName = 'border-transparent font-medium text-white/80 hover:bg-white/10 hover:text-white';
              const baseClassName = 'flex w-full items-center gap-3 rounded-r-lg border-l-[3px] px-3 py-2.5 text-sm transition-colors duration-200';
              return (
                isStateNavigation ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPageChange?.(item.id)}
                    aria-current={activePage === item.id ? 'page' : undefined}
                    className={`${baseClassName} ${activePage === item.id ? activeClassName : inactiveClassName}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) => `${baseClassName} ${isActive ? activeClassName : inactiveClassName}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              );
            })}
          </div>
        </div>
      ))}
    </div>

    <div className="border-t border-white/10 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3A8A]">
            <span className="text-sm font-semibold text-white">AM</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ahmed Mansouri</p>
            <p className="text-xs text-white/80">Administrateur</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  </aside>;
};

export default Sidebar;
