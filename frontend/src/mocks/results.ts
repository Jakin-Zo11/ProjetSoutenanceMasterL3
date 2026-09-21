import { Result } from '../types';
import { mockStudents } from './students';

// TODO: connecter à l'API /api/results une fois le backend prêt
export const mockResults: Result[] = [
  {
    id: 1,
    studentId: 4,
    moyenne: 15.5,
    mention: 'Bien',
    avisJury: 'Très bon travail, sujet bien maîtrisé',
    datePublication: '2025-01-12',
    status: 'Publié',
    student: mockStudents[3]
  },
  {
    id: 2,
    studentId: 5,
    moyenne: 16.5,
    mention: 'Très Bien',
    avisJury: 'Excellent travail, présentation claire',
    datePublication: '2025-01-10',
    status: 'Publié',
    student: mockStudents[4]
  },
  {
    id: 3,
    studentId: 1,
    moyenne: 0,
    mention: '',
    avisJury: '',
    datePublication: '',
    status: 'Non publié',
    student: mockStudents[0]
  },
  {
    id: 4,
    studentId: 2,
    moyenne: 0,
    mention: '',
    avisJury: '',
    datePublication: '',
    status: 'Non publié',
    student: mockStudents[1]
  }
];
