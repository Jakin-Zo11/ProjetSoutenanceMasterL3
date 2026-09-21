import type { Status } from './index';
import type { LucideIcon } from 'lucide-react';

export interface DashboardStat {
  label: string;
  value: number;
  helper: string;
  tone: 'primary' | 'sky' | 'muted' | 'error';
  icon?: LucideIcon;
}

export interface DashboardDefense {
  id: number;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  room: string;
  status: Status;
  priority?: 'urgent';
}

export interface DashboardActivity {
  id: number;
  action: string;
  detail: string;
  time: string;
}

export interface DashboardProgress {
  label: string;
  completed: number;
  total: number;
}
