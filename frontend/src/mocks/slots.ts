import { Slot } from '../types';

// TODO: connecter à l'API /api/slots une fois le backend prêt
export const mockSlots: Slot[] = [
  {
    id: 1,
    jour: 'Lundi',
    heureDebut: '08:00',
    heureFin: '09:00',
    type: 'Soutenance',
    actif: true
  },
  {
    id: 2,
    jour: 'Lundi',
    heureDebut: '09:00',
    heureFin: '10:00',
    type: 'Soutenance',
    actif: true
  },
  {
    id: 3,
    jour: 'Lundi',
    heureDebut: '10:00',
    heureFin: '10:30',
    type: 'Pause',
    actif: true
  },
  {
    id: 4,
    jour: 'Lundi',
    heureDebut: '10:30',
    heureFin: '11:30',
    type: 'Soutenance',
    actif: true
  },
  {
    id: 5,
    jour: 'Lundi',
    heureDebut: '11:30',
    heureFin: '12:00',
    type: 'Soutenance',
    actif: true
  },
  {
    id: 6,
    jour: 'Lundi',
    heureDebut: '12:00',
    heureFin: '14:00',
    type: 'Pause',
    actif: true
  },
  {
    id: 7,
    jour: 'Lundi',
    heureDebut: '14:00',
    heureFin: '15:00',
    type: 'Soutenance',
    actif: true
  },
  {
    id: 8,
    jour: 'Lundi',
    heureDebut: '15:00',
    heureFin: '16:00',
    type: 'Soutenance',
    actif: true
  },
  {
    id: 9,
    jour: 'Mardi',
    heureDebut: '08:00',
    heureFin: '09:00',
    type: 'Soutenance',
    actif: true
  },
  {
    id: 10,
    jour: 'Mardi',
    heureDebut: '09:00',
    heureFin: '10:00',
    type: 'Soutenance',
    actif: false
  }
];
