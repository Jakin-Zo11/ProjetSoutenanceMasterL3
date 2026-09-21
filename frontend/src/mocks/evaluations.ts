import { Evaluation } from '../types';
import { mockDefenses } from './defenses';
import { mockTeachers } from './teachers';

// TODO: connecter à l'API /api/evaluations une fois le backend prêt
export const mockEvaluations: Evaluation[] = [
  {
    id: 1,
    defenseId: 4,
    juryId: 1,
    noteContenu: 16,
    noteMaitrise: 15,
    noteRealisation: 17,
    notePresentation: 14,
    moyenne: 15.5,
    avis: 'Très bon travail, sujet bien maîtrisé',
    dateEvaluation: '2025-01-10',
    status: 'Soumise',
    defense: mockDefenses[3],
    jury: mockTeachers[0]
  },
  {
    id: 2,
    defenseId: 5,
    juryId: 2,
    noteContenu: 18,
    noteMaitrise: 17,
    noteRealisation: 16,
    notePresentation: 15,
    moyenne: 16.5,
    avis: 'Excellent travail, présentation claire',
    dateEvaluation: '2025-01-08',
    status: 'Soumise',
    defense: mockDefenses[4],
    jury: mockTeachers[1]
  },
  {
    id: 3,
    defenseId: 1,
    juryId: 1,
    noteContenu: 0,
    noteMaitrise: 0,
    noteRealisation: 0,
    notePresentation: 0,
    moyenne: 0,
    avis: '',
    dateEvaluation: '',
    status: 'En attente',
    defense: mockDefenses[0],
    jury: mockTeachers[0]
  },
  {
    id: 4,
    defenseId: 2,
    juryId: 2,
    noteContenu: 0,
    noteMaitrise: 0,
    noteRealisation: 0,
    notePresentation: 0,
    moyenne: 0,
    avis: '',
    dateEvaluation: '',
    status: 'En cours',
    defense: mockDefenses[1],
    jury: mockTeachers[1]
  }
];
