import type {
  DashboardActivity,
  DashboardDefense,
  DashboardProgress,
  DashboardStat,
} from '../types/Dashboard';
import { CalendarDays, GraduationCap, Scale, UserCheck } from 'lucide-react';

// TODO: connecter à l'API /api/admin/dashboard une fois le backend prêt
export const mockDashboardStats: DashboardStat[] = [
  { label: 'Total étudiants', value: 128, helper: '+12 cette promotion', tone: 'primary', icon: GraduationCap },
  { label: 'Enseignants', value: 32, helper: 'Corps enseignant actif', tone: 'sky', icon: UserCheck },
  { label: 'Jurys constitués', value: 18, helper: 'Pour la session 2025–2026', tone: 'muted', icon: Scale },
  { label: 'Soutenances planifiées', value: 42, helper: '18 cette semaine', tone: 'primary', icon: CalendarDays },
];

// TODO: connecter à l'API /api/admin/soutenances?upcoming=true une fois le backend prêt
export const mockUpcomingDefenses: DashboardDefense[] = [
  {
    id: 1,
    studentName: 'Aina Rakoto',
    subject: 'Plateforme de suivi académique',
    date: '18 juin 2026',
    time: '09:00',
    room: 'Salle B-204',
    status: 'Planifiée',
  },
  {
    id: 2,
    studentName: 'Mamy Randria',
    subject: 'Optimisation des services numériques',
    date: '18 juin 2026',
    time: '10:30',
    room: 'Salle B-205',
    status: 'Planifiée',
  },
  {
    id: 3,
    studentName: 'Soa Andrianina',
    subject: 'Sécurisation des données universitaires',
    date: '18 juin 2026',
    time: '14:00',
    room: 'Salle A-102',
    status: 'En attente',
    priority: 'urgent',
  },
];

// TODO: connecter à l'API /api/admin/evaluations/progress une fois le backend prêt
export const mockEvaluationProgress: DashboardProgress[] = [
  { label: 'Évaluations validées', completed: 86, total: 126 },
  { label: 'Évaluations en cours', completed: 24, total: 126 },
  { label: 'Évaluations restantes', completed: 16, total: 126 },
];

// TODO: connecter à l'API /api/admin/activity une fois le backend prêt
export const mockDashboardActivities: DashboardActivity[] = [
  { id: 1, action: 'Évaluation validée', detail: 'Aina Rakoto — note finale 15,5/20', time: 'Il y a 18 min' },
  { id: 2, action: 'Soutenance planifiée', detail: 'Mamy Randria — Salle B-205', time: 'Il y a 1 h' },
  { id: 3, action: 'Jury affecté', detail: 'Soutenance de Soa Andrianina', time: 'Il y a 2 h' },
  { id: 4, action: 'PV généré automatiquement', detail: 'PV-2026-024 — Aina Rakoto', time: 'Hier' },
];
