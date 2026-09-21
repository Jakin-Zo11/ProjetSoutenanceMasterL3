// Types pour le système de gestion des soutenances EMIT

export type Status = 'En attente' | 'Planifiée' | 'En cours' | 'Terminé' | 'Publié' | 'Annulée' | 'Reprogrammée';

export interface Student {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  formation: string;
  promotion: string;
  sujetThese: string;
  status: Status;
}

export interface Teacher {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  grade: string;
  status: 'Actif' | 'Inactif';
}

export interface Jury {
  id: number;
  presidentId: number;
  rapporteurId: number;
  examinateurId: number;
  president?: Teacher;
  rapporteur?: Teacher;
  examinateur?: Teacher;
}

export interface Room {
  id: number;
  nom: string;
  capacite: number;
  batiment: string;
  equipements: string[];
  disponible: boolean;
}

export interface Defense {
  id: number;
  studentId: number;
  juryId: number;
  roomId: number;
  date: string;
  heure: string;
  duree: number;
  status: Status;
  student?: Student;
  jury?: Jury;
  room?: Room;
}

export interface Slot {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  type: 'Soutenance' | 'Pause' | 'Reserve';
  actif: boolean;
}

export interface Evaluation {
  id: number;
  defenseId: number;
  juryId: number;
  noteContenu: number;
  noteMaitrise: number;
  noteRealisation: number;
  notePresentation: number;
  moyenne: number;
  avis: string;
  dateEvaluation: string;
  status: 'Soumise' | 'En attente' | 'En cours' | 'Conflit';
  defense?: Defense;
  jury?: Teacher;
}

export interface Result {
  id: number;
  studentId: number;
  moyenne: number;
  mention: string;
  avisJury: string;
  datePublication: string;
  status: 'Publié' | 'Non publié';
  student?: Student;
}

export interface Report {
  id: number;
  reference: string;
  studentId: number;
  defenseId: number;
  dateGeneration: string;
  roomId: number;
  status: 'Généré' | 'Non généré';
  student?: Student;
  defense?: Defense;
  room?: Room;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}
import type { LucideIcon } from 'lucide-react';
