import { Jury } from '../types';
import { mockTeachers } from './teachers';

// TODO: connecter à l'API /api/jurys une fois le backend prêt
export const mockJurys: Jury[] = [
  {
    id: 1,
    presidentId: 1,
    rapporteurId: 2,
    examinateurId: 3,
    president: mockTeachers[0],
    rapporteur: mockTeachers[1],
    examinateur: mockTeachers[2]
  },
  {
    id: 2,
    presidentId: 2,
    rapporteurId: 3,
    examinateurId: 4,
    president: mockTeachers[1],
    rapporteur: mockTeachers[2],
    examinateur: mockTeachers[3]
  },
  {
    id: 3,
    presidentId: 1,
    rapporteurId: 4,
    examinateurId: 3,
    president: mockTeachers[0],
    rapporteur: mockTeachers[3],
    examinateur: mockTeachers[2]
  }
];
