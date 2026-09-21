import { Report } from '../types';
import { mockStudents } from './students';
import { mockDefenses } from './defenses';
import { mockRooms } from './rooms';

// TODO: connecter à l'API /api/reports une fois le backend prêt
export const mockReports: Report[] = [
  {
    id: 1,
    reference: 'PV-2025-001',
    studentId: 4,
    defenseId: 4,
    dateGeneration: '2025-01-12',
    roomId: 1,
    status: 'Généré',
    student: mockStudents[3],
    defense: mockDefenses[3],
    room: mockRooms[0]
  },
  {
    id: 2,
    reference: 'PV-2025-002',
    studentId: 5,
    defenseId: 5,
    dateGeneration: '2025-01-10',
    roomId: 2,
    status: 'Généré',
    student: mockStudents[4],
    defense: mockDefenses[4],
    room: mockRooms[1]
  },
  {
    id: 3,
    reference: 'PV-2025-003',
    studentId: 1,
    defenseId: 1,
    dateGeneration: '',
    roomId: 1,
    status: 'Non généré',
    student: mockStudents[0],
    defense: mockDefenses[0],
    room: mockRooms[0]
  },
  {
    id: 4,
    reference: 'PV-2025-004',
    studentId: 2,
    defenseId: 2,
    dateGeneration: '',
    roomId: 2,
    status: 'Non généré',
    student: mockStudents[1],
    defense: mockDefenses[1],
    room: mockRooms[1]
  }
];
