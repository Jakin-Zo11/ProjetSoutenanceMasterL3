import { Student } from '../types';

// TODO: connecter à l'API /api/students une fois le backend prêt
export const mockStudents: Student[] = [
  {
    id: 1,
    matricule: '001I24',
    nom: 'Rakoto',
    prenom: 'Jean',
    email: 'jean.rakoto@emit.mg',
    telephone: '+261 34 00 000 01',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2024-2025',
    sujetThese: 'Optimisation des algorithmes de machine learning pour la prédiction de la demande énergétique',
    status: 'Planifiée'
  },
  {
    id: 2,
    matricule: '002I24',
    nom: 'Randrianasolo',
    prenom: 'Marie',
    email: 'marie.randrianasolo@emit.mg',
    telephone: '+261 34 00 000 02',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2024-2025',
    sujetThese: 'Développement d\'une application mobile de gestion des stocks pour les PME',
    status: 'En cours'
  },
  {
    id: 3,
    matricule: '003I24',
    nom: 'Ravelonarivo',
    prenom: 'Paul',
    email: 'paul.ravelonarivo@emit.mg',
    telephone: '+261 34 00 000 03',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2024-2025',
    sujetThese: 'Analyse des données de trafic routier pour l\'optimisation urbaine',
    status: 'En attente'
  },
  {
    id: 4,
    matricule: '004I24',
    nom: 'Rasoa',
    prenom: 'Fara',
    email: 'fara.rasoa@emit.mg',
    telephone: '+261 34 00 000 04',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2024-2025',
    sujetThese: 'Système de reconnaissance faciale pour le contrôle d\'accès',
    status: 'Terminé'
  },
  {
    id: 5,
    matricule: '005I24',
    nom: 'Andriamanitra',
    prenom: 'Luc',
    email: 'luc.andriamanitra@emit.mg',
    telephone: '+261 34 00 000 05',
    formation: 'Master 2 Informatique de Gestion',
    promotion: '2024-2025',
    sujetThese: 'Plateforme e-learning adaptative basée sur l\'IA',
    status: 'Publié'
  }
];
