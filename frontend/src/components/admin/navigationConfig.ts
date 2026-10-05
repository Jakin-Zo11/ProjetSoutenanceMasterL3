import {
  Award,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Presentation,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface AdminNavigationItem {
  id: string;
  label: string;
  path: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export interface AdminNavigationGroup {
  label: string;
  items: AdminNavigationItem[];
}

export const NAVIGATION_CONFIG: AdminNavigationGroup[] = [
  {
    label: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Tableau de bord',
        path: '/admin',
        title: 'Tableau de bord',
        subtitle: "Vue d'ensemble du système de gestion des soutenances",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Gestion académique',
    items: [
      {
        id: 'etudiants',
        label: 'Étudiants',
        path: '/admin/etudiants',
        title: 'Étudiants',
        subtitle: 'Gestion des matricules, thèmes et dépôts PDF',
        icon: GraduationCap,
      },
      {
        id: 'enseignants_jurys',
        label: 'Enseignants & Jurys',
        path: '/admin/enseignants-jurys',
        title: 'Enseignants & Jurys',
        subtitle: 'Gestion du corps enseignant et des compositions de jury',
        icon: Users,
      },
    ],
  },
  {
    label: 'Soutenances',
    items: [
      {
        id: 'soutenances_salles',
        label: 'Soutenances & Salles',
        path: '/admin/soutenances-salles',
        title: 'Soutenances & Salles',
        subtitle: 'Suivi des soutenances et gestion des salles',
        icon: Presentation,
      },
      {
        id: 'creneaux',
        label: 'Créneaux',
        path: '/admin/creneaux',
        title: 'Créneaux',
        subtitle: 'Gestion des créneaux horaires de la session',
        icon: Clock3,
      },
      {
        id: 'calendrier',
        label: 'Calendrier',
        path: '/admin/calendrier',
        title: 'Calendrier',
        subtitle: 'Vue calendrier des soutenances planifiées',
        icon: CalendarDays,
      },
      {
        id: 'affectation',
        label: 'Affectation jury',
        path: '/admin/affectation',
        title: 'Affectation jury',
        subtitle: 'Affectation des jurys aux soutenances',
        icon: UserRoundCheck,
      },
    ],
  },
  {
    label: 'Résultats',
    items: [
      {
        id: 'evaluations',
        label: 'Évaluations',
        path: '/admin/evaluations',
        title: 'Évaluations',
        subtitle: 'Suivi des évaluations et des notes',
        icon: ClipboardCheck,
      },
      {
        id: 'resultats_pv',
        label: 'Résultats & PV',
        path: '/admin/resultats-pv',
        title: 'Résultats & PV',
        subtitle: 'Publication des résultats et gestion des procès-verbaux',
        icon: Award,
      },
    ],
  },
];
