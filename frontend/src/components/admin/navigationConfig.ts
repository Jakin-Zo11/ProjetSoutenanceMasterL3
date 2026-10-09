import {
  Award,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  LayoutDashboard,
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
        id: 'evaluateurs',
        label: 'Évaluateurs',
        path: '/admin/evaluateurs',
        title: 'Évaluateurs',
        subtitle: 'Gestion des évaluateurs, de leurs rôles de soutenance et de leur accès mobile',
        icon: Users,
      },
    ],
  },
  {
    label: 'Soutenances',
    items: [
      {
        id: 'planification',
        label: 'Planification',
        path: '/admin/planification',
        title: 'Planification',
        subtitle: 'Affectation des soutenances : étudiants, créneaux, salles et évaluateurs',
        icon: UserRoundCheck,
      },
      {
        id: 'creneaux',
        label: 'Créneaux',
        path: '/admin/creneaux',
        title: 'Créneaux horaires',
        subtitle: 'Définition des plages horaires utilisées pour programmer les soutenances',
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
    ],
  },
  {
    label: 'Résultats',
    items: [
            {
        id: 'evaluations',
        label: 'Évaluation',
        path: '/admin/evaluations',
        title: 'Évaluation',
        subtitle: 'Suivi des évaluations et des notes',
        icon: ClipboardCheck,
      },
      {
        id: 'suivi_evaluations',
        label: 'Suivi des notes',
        path: '/admin/suivi-evaluations',
        title: 'Suivi des notes',
        subtitle: 'Tableau de suivi temps réel des notations par évaluateur',
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
