import { Teacher } from '../types';

// TODO: connecter à l'API /api/teachers une fois le backend prêt
export const mockTeachers: Teacher[] = [
  {
    id: 1,
    nom: 'Rasamoelina',
    prenom: 'Marc',
    email: 'marc.rasamoelina@emit.mg',
    telephone: '+261 34 00 001 01',
    specialite: 'Intelligence Artificielle',
    grade: 'Professeur',
    status: 'Actif'
  },
  {
    id: 2,
    nom: 'Rajaonarivelo',
    prenom: 'Sophie',
    email: 'sophie.rajaonarivelo@emit.mg',
    telephone: '+261 34 00 001 02',
    specialite: 'Base de Données',
    grade: 'Maître de Conférences',
    status: 'Actif'
  },
  {
    id: 3,
    nom: 'Rakotomamonjy',
    prenom: 'Jean-Pierre',
    email: 'jean-pierre.rakotomamonjy@emit.mg',
    telephone: '+261 34 00 001 03',
    specialite: 'Développement Web',
    grade: 'Maître de Conférences',
    status: 'Actif'
  },
  {
    id: 4,
    nom: 'Rasoarimanana',
    prenom: 'Christine',
    email: 'christine.rasoarimanana@emit.mg',
    telephone: '+261 34 00 001 04',
    specialite: 'Réseaux et Télécommunications',
    grade: 'Professeur',
    status: 'Actif'
  },
  {
    id: 5,
    nom: 'Andriamanjato',
    prenom: 'Henri',
    email: 'henri.andriamanjato@emit.mg',
    telephone: '+261 34 00 001 05',
    specialite: 'Sécurité Informatique',
    grade: 'Maître de Conférences',
    status: 'Inactif'
  }
];
