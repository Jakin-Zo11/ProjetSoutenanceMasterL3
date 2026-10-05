export type EvaluationCriterion = 'presentation' | 'technical' | 'answers';

export type EvaluationScores = Record<EvaluationCriterion, string>;

export interface DefenseJuryMember {
  name: string;
  role: 'Président' | 'Rapporteur' | 'Examinateur';
}

export interface DemoDefense {
  id: string;
  studentMatricule: string;
  studentName: string;
  theme: string;
  director: string;
  date: string;
  calendarDate: string;
  time: string;
  room: string;
  status: 'a_venir' | 'evaluation_en_attente' | 'evaluation_terminee';
  jury: DefenseJuryMember[];
}

export interface JuryEvaluation {
  studentName: string;
  studentMatricule: string;
  date: string;
  scores: EvaluationScores;
  remarks: string;
  totalScore: number;
  mention: string;
  evaluee: true;
  status: 'draft' | 'validated';
}

export const demoDefenses: DemoDefense[] = [
  {
    id: 'SOUT-2026-001',
    studentMatricule: '001I24',
    studentName: 'Jean Rakoto',
    theme: 'Optimisation des algorithmes de machine learning pour la prédiction de la demande énergétique',
    director: 'Prof. Marc Rasamoelina',
    date: '11 novembre 2026',
    calendarDate: '11 Nov 2026',
    time: '09:00',
    room: 'Salle A-101',
    status: 'a_venir',
    jury: [
      { role: 'Président', name: 'Dr. Randriamanana' },
      { role: 'Rapporteur', name: 'Prof. Sophie Rajaonarivelo' },
      { role: 'Examinateur', name: 'Prof. Jean-Pierre Rakotomamonjy' },
    ],
  },
  {
    id: 'SOUT-2026-002',
    studentMatricule: '002I24',
    studentName: 'Marie Randrianasolo',
    theme: 'Développement d’une application mobile de gestion des stocks pour les PME',
    director: 'Prof. Marc Rasamoelina',
    date: '12 novembre 2026',
    calendarDate: '12 Nov 2026',
    time: '10:00',
    room: 'Salle B-205',
    status: 'a_venir',
    jury: [
      { role: 'Président', name: 'Prof. Sophie Rajaonarivelo' },
      { role: 'Rapporteur', name: 'Dr. Randriamanana' },
      { role: 'Examinateur', name: 'Prof. Jean-Pierre Rakotomamonjy' },
    ],
  },
  {
    id: 'SOUT-2026-003',
    studentMatricule: '003I24',
    studentName: 'Paul Ravelonarivo',
    theme: 'Analyse des données de trafic routier pour l’optimisation urbaine',
    director: 'Prof. Marc Rasamoelina',
    date: '13 novembre 2026',
    calendarDate: '13 Nov 2026',
    time: '14:00',
    room: 'Salle C-305',
    status: 'a_venir',
    jury: [
      { role: 'Président', name: 'Prof. Jean-Pierre Rakotomamonjy' },
      { role: 'Rapporteur', name: 'Dr. Randriamanana' },
      { role: 'Examinateur', name: 'Prof. Sophie Rajaonarivelo' },
    ],
  },
  {
    id: 'SOUT-2026-004',
    studentMatricule: '004I24',
    studentName: 'Fara Rasoa',
    theme: 'Système de reconnaissance faciale pour le contrôle d’accès',
    director: 'Prof. Marc Rasamoelina',
    date: '15 novembre 2026',
    calendarDate: '15 Nov 2026',
    time: '09:00',
    room: 'Salle A-102',
    status: 'evaluation_en_attente',
    jury: [
      { role: 'Président', name: 'Dr. Randriamanana' },
      { role: 'Rapporteur', name: 'Prof. Sophie Rajaonarivelo' },
      { role: 'Examinateur', name: 'Prof. Jean-Pierre Rakotomamonjy' },
    ],
  },
  {
    id: 'SOUT-2026-005',
    studentMatricule: '005I24',
    studentName: 'Luc Andriamanitra',
    theme: 'Plateforme e-learning adaptative basée sur l’intelligence artificielle',
    director: 'Prof. Marc Rasamoelina',
    date: '16 novembre 2026',
    calendarDate: '16 Nov 2026',
    time: '11:00',
    room: 'Salle B-206',
    status: 'evaluation_en_attente',
    jury: [
      { role: 'Président', name: 'Prof. Sophie Rajaonarivelo' },
      { role: 'Rapporteur', name: 'Dr. Randriamanana' },
      { role: 'Examinateur', name: 'Prof. Jean-Pierre Rakotomamonjy' },
    ],
  },
];
