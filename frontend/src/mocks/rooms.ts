import { Room } from '../types';

// TODO: connecter à l'API /api/rooms une fois le backend prêt
export const mockRooms: Room[] = [
  {
    id: 1,
    nom: 'Salle A101',
    capacite: 30,
    batiment: 'Bâtiment A',
    equipements: ['Vidéoprojecteur', 'Tableau blanc', 'WiFi', 'Climatisation'],
    disponible: true
  },
  {
    id: 2,
    nom: 'Salle A102',
    capacite: 25,
    batiment: 'Bâtiment A',
    equipements: ['Vidéoprojecteur', 'Tableau blanc', 'WiFi'],
    disponible: true
  },
  {
    id: 3,
    nom: 'Amphithéâtre B1',
    capacite: 100,
    batiment: 'Bâtiment B',
    equipements: ['Vidéoprojecteur', 'Système son', 'Microphones', 'WiFi', 'Climatisation'],
    disponible: true
  },
  {
    id: 4,
    nom: 'Salle C205',
    capacite: 20,
    batiment: 'Bâtiment C',
    equipements: ['Vidéoprojecteur', 'Tableau blanc', 'WiFi'],
    disponible: false
  },
  {
    id: 5,
    nom: 'Salle D301',
    capacite: 15,
    batiment: 'Bâtiment D',
    equipements: ['Tableau blanc', 'WiFi'],
    disponible: true
  }
];
