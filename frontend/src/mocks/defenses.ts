import { Defense } from '../types';
import { mockStudents } from './students';
import { mockJurys } from './jurys';
import { mockRooms } from './rooms';

// TODO: connecter à l'API /api/defenses une fois le backend prêt
export const mockDefenses: Defense[] = [
  {
    id: 1,
    studentId: 1,
    juryId: 1,
    roomId: 1,
    date: '2026-11-11',
    heure: '09:00',
    duree: 45,
    status: 'Planifiée',
    student: mockStudents[0],
    jury: mockJurys[0],
    room: mockRooms[0]
  },
  {
    id: 2,
    studentId: 2,
    juryId: 2,
    roomId: 2,
    date: '2026-11-12',
    heure: '10:00',
    duree: 45,
    status: 'En cours',
    student: mockStudents[1],
    jury: mockJurys[1],
    room: mockRooms[1]
  },
  {
    id: 3,
    studentId: 3,
    juryId: null,
    roomId: 3,
    date: '2026-11-13',
    heure: '14:00',
    duree: 45,
    status: 'En attente',
    student: mockStudents[2],
    jury: null,
    room: mockRooms[2]
  },
  {
    id: 4,
    studentId: 4,
    juryId: null,
    roomId: 1,
    date: '2026-11-14',
    heure: '09:00',
    duree: 45,
    status: 'En attente',
    student: mockStudents[3],
    jury: null,
    room: mockRooms[0]
  },
  {
    id: 5,
    studentId: 5,
    juryId: null,
    roomId: 2,
    date: '2026-11-15',
    heure: '11:00',
    duree: 45,
    status: 'En attente',
    student: mockStudents[4],
    jury: null,
    room: mockRooms[1]
  }
];
