import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  User,
  Scale,
  Building2,
  Calendar,
  Clock,
  CalendarDays,
  Users,
  BarChart3,
  Trophy,
  FileText,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activePage?: string;
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

const navGroups = [
  {
    label: 'PRINCIPAL',
    items: [{ id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard }],
  },
  {
    label: 'GESTION ACADÉMIQUE',
    items: [
      { id: 'students', label: 'Étudiants', icon: GraduationCap },
      { id: 'teachers', label: 'Enseignants', icon: User },
      { id: 'jurys', label: 'Jurys', icon: Scale },
    ],
  },
  {
    label: 'SOUTENANCES',
    items: [
      { id: 'rooms', label: 'Salles', icon: Building2 },
      { id: 'defenses', label: 'Soutenances', icon: Calendar },
      { id: 'slots', label: 'Créneaux', icon: Clock },
      { id: 'calendar', label: 'Calendrier', icon: CalendarDays },
      { id: 'assignment', label: 'Affectation jury', icon: Users },
    ],
  },
  {
    label: 'RÉSULTATS',
    items: [
      { id: 'evaluations', label: 'Évaluations', icon: BarChart3 },
      { id: 'results', label: 'Résultats', icon: Trophy },
      { id: 'reports', label: 'PV / Rapports', icon: FileText },
    ],
  },
];

const pagePaths: Record<string, string> = {
  dashboard: '/admin',
  students: '/admin/etudiants',
  teachers: '/admin/enseignants',
  jurys: '/admin/jurys',
  rooms: '/admin/salles',
  defenses: '/admin/soutenances',
  slots: '/admin/creneaux',
  calendar: '/admin/calendrier',
  assignment: '/admin/affectation-jury',
  evaluations: '/admin/evaluations',
  results: '/admin/resultats',
  reports: '/admin/pv',
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = activePage ?? Object.entries(pagePaths).find(([, path]) => path === location.pathname)?.[0] ?? 'dashboard';

  const handlePageChange = (page: string) => {
    onPageChange?.(page);
    navigate(pagePaths[page] ?? pagePaths.dashboard);
  };

  return <aside className="flex h-screen w-64 flex-col overflow-hidden bg-[#0D1F4E]">
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
      {navGroups.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-white/80">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'border-l-[3px] border-[#2D84E0] bg-[#2D84E0]/30 font-bold text-white'
                      : 'bg-transparent font-medium text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>

    <div className="border-t border-white/10 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D84E0]">
            <span className="text-sm font-semibold text-white">AM</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ahmed Mansouri</p>
            <p className="text-xs text-white/80">Administrateur</p>
          </div>
        </div>
        <button onClick={onLogout} className="rounded-lg p-2 text-white transition-colors hover:bg-white/10" aria-label="Se déconnecter">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  </aside>;
};

export default Sidebar;
