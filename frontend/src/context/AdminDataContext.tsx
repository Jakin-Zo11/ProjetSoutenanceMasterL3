import React, { createContext, useContext, useState, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Student {
  id: number;
  matricule: string;
  fullName: string;
  filiere: string;
  promotion: string;
  themeTitle: string;
  company?: string;
  pdfUrl?: string;
  submissionStatus: 'WAITING' | 'PDF_SUBMITTED' | 'SCHEDULED' | 'EVALUATED';
}

export type EvaluatorRole = 'PRESIDENT' | 'RAPPORTEUR' | 'EXAMINER' | 'ENCADREUR';

export interface Teacher {
  id: number;
  prenom: string;
  nom: string;
  specialite: string;
  grade: string;
  email: string;
  telephone: string;
  status: string;
  isAvailable: boolean;
  role?: EvaluatorRole;
}

export interface Planning {
  id: number;
  studentId: number;
  teacherIds: number[];
  room: string;
  date: string;
  slotTime: string;
  status: string;
}

export interface Evaluation {
  id: number;
  slotId: number;
  studentId: number;
  presentationScore: number; // /5
  technicalScore: number; // /10
  answersScore: number; // /5
  totalScore: number; // /20
  comments: string;
}

export interface EvaluatorSubmission {
  role: EvaluatorRole;
  presentationScore?: number; // /5
  technicalScore?: number; // /10
  answersScore?: number; // /5
  comments?: string;
  isCompleted: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  submittedAt?: string;
}

export interface JuryMember {
  id: number;
  teacherName: string;
  role: EvaluatorRole;
  isAvailable: boolean;
}

export interface DefenseSlot {
  id: number;
  studentId: number;
  studentName: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  status: string;
  jury: JuryMember[];
}

export interface Pv {
  id: number;
  studentMatricule: string;
  score: number;
  mention: string;
  pdfUrl: string;
}

export interface Session {
  startDate: string;
  endDate: string;
}

export interface TimeSlot {
  id: number;
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
}

export interface Room {
  id: number;
  nom: string;
  capacite: number;
  batiment: string;
  equipements: string[];
  disponible: boolean;
}

export type AbsenceStatus = 'REPLACED' | 'UNRESOLVED';

export interface EvaluatorAbsence {
  id: number;
  teacherId: number;
  teacherName: string;
  defenseSlotId: number;
  studentId: number;
  studentName: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  role: EvaluatorRole;
  motif: string;
  declaredAt: string;
  status: AbsenceStatus;
  replacementId?: number;
  replacementName?: string;
}

export interface TeamNotification {
  id: number;
  absenceId: number;
  title: string;
  message: string;
  recipients: string[];
  createdAt: string;
}

export interface DeclareAbsenceInput {
  defenseSlotId: number;
  teacherId: number;
  motif: string;
}

export const EVALUATOR_ROLE_LABELS: Record<EvaluatorRole, string> = {
  PRESIDENT: 'Président',
  RAPPORTEUR: 'Rapporteur',
  EXAMINER: 'Examinateur',
  ENCADREUR: 'Encadreur',
};

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

interface AdminDataContextType {
  session: Session;
  students: Student[];
  teachers: Teacher[];
  plannings: Planning[];
  evaluations: Evaluation[];
  pvs: Pv[];
  defenseSlots: DefenseSlot[];
  timeSlots: TimeSlot[];
  rooms: Room[];
  absences: EvaluatorAbsence[];
  notifications: TeamNotification[];
  assignJuryToSlot: (slotId: number, juryIds: number[]) => void;
  replaceJuryMember: (slotId: number, oldTeacherId: number, newTeacherId: number) => void;
  uploadStudentPdf: (matricule: string, fileUrl: string) => Promise<void>;
  submitEvaluation: (slotId: number, scoreData: Omit<Evaluation, 'id'>) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  updateTeacher: (id: number, teacher: Partial<Omit<Teacher, 'id'>>) => Promise<void>;
  deleteTeacher: (id: number) => Promise<void>;
  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => Promise<void>;
  updateTimeSlot: (id: number, timeSlot: Partial<Omit<TimeSlot, 'id'>>) => Promise<void>;
  deleteTimeSlot: (id: number) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  addDefenseSlot: (slot: Omit<DefenseSlot, 'id'>) => Promise<void>;
  updateDefenseSlot: (id: number, slot: Partial<Omit<DefenseSlot, 'id'>>) => Promise<void>;
  sendConvocations: (slotId: number) => Promise<void>;
  assignJuryBatch: (slotIds: number[], members: JuryMember[]) => Promise<void>;
  declareAbsence: (input: DeclareAbsenceInput) => Promise<EvaluatorAbsence>;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────

interface AdminDataProviderProps {
  children: ReactNode;
}

export const AdminDataProvider: React.FC<AdminDataProviderProps> = ({ children }) => {
  const [session] = useState<Session>({
    startDate: '2026-11-11',
    endDate: '2026-11-16',
  });

  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      matricule: '001I26',
      fullName: 'Jean Rakoto',
      filiere: 'Master 2 Informatique de Gestion',
      promotion: '2025-2026',
      themeTitle: 'Optimisation des algorithmes de machine learning pour la prédiction de la demande énergétique',
      company: 'EMIT',
      pdfUrl: undefined,
      submissionStatus: 'WAITING',
    },
    {
      id: 2,
      matricule: '002I26',
      fullName: 'Marie Randrianasolo',
      filiere: 'Master 2 Informatique de Gestion',
      promotion: '2025-2026',
      themeTitle: 'Développement d\'une application mobile de gestion des stocks pour les PME',
      company: 'Tech Solutions',
      pdfUrl: undefined,
      submissionStatus: 'WAITING',
    },
    {
      id: 3,
      matricule: '003I26',
      fullName: 'Paul Ravelonarivo',
      filiere: 'Master 2 Informatique de Gestion',
      promotion: '2025-2026',
      themeTitle: 'Analyse des données de trafic routier pour l\'optimisation urbaine',
      company: 'City Planning',
      pdfUrl: undefined,
      submissionStatus: 'WAITING',
    },
    {
      id: 4,
      matricule: '004I26',
      fullName: 'Fara Rasoa',
      filiere: 'Master 2 Informatique de Gestion',
      promotion: '2025-2026',
      themeTitle: 'Système de reconnaissance faciale pour le contrôle d\'accès',
      company: 'SecureTech',
      pdfUrl: '/mock-files/pv-004I26.pdf',
      submissionStatus: 'PDF_SUBMITTED',
    },
    {
      id: 5,
      matricule: '005I26',
      fullName: 'Luc Andriamanitra',
      filiere: 'Master 2 Informatique de Gestion',
      promotion: '2025-2026',
      themeTitle: 'Plateforme e-learning adaptative basée sur l\'IA',
      company: 'AI Solutions',
      pdfUrl: '/mock-files/pv-005I26.pdf',
      submissionStatus: 'PDF_SUBMITTED',
    },
  ]);

  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 1, prenom: 'Marc', nom: 'Rasamoelina', specialite: 'Informatique', grade: 'Professeur', email: 'marc.rasamoelina@emit.mg', telephone: '+261 34 00 000 01', status: 'Actif', isAvailable: true, role: 'PRESIDENT' },
    { id: 2, prenom: 'Sophie', nom: 'Rajaonarivelo', specialite: 'Informatique', grade: 'Maître de conférences', email: 'sophie.rajaonarivelo@emit.mg', telephone: '+261 34 00 000 02', status: 'Actif', isAvailable: true, role: 'RAPPORTEUR' },
    { id: 3, prenom: 'Jean-Pierre', nom: 'Rakotomamonjy', specialite: 'Informatique', grade: 'Professeur', email: 'jean-pierre.rakotomamonjy@emit.mg', telephone: '+261 34 00 000 03', status: 'Actif', isAvailable: true, role: 'EXAMINER' },
    { id: 4, prenom: 'Marie', nom: 'Randria', specialite: 'Gestion', grade: 'Maître de conférences', email: 'marie.randria@emit.mg', telephone: '+261 34 00 000 04', status: 'Actif', isAvailable: false, role: 'ENCADREUR' },
    { id: 5, prenom: 'Naina', nom: 'Rakotoson', specialite: 'Informatique', grade: 'Professeur', email: 'naina.rakotoson@emit.mg', telephone: '+261 34 00 000 05', status: 'Actif', isAvailable: true, role: 'PRESIDENT' },
    { id: 6, prenom: 'Hery', nom: 'Andrianina', specialite: 'Informatique', grade: 'Maître de conférences', email: 'hery.andrianina@emit.mg', telephone: '+261 34 00 000 06', status: 'Actif', isAvailable: true, role: 'RAPPORTEUR' },
    { id: 7, prenom: 'Fanja', nom: 'Rasolo', specialite: 'Gestion', grade: 'Maître de conférences', email: 'fanja.rasolo@emit.mg', telephone: '+261 34 00 000 07', status: 'Actif', isAvailable: true, role: 'EXAMINER' },
    { id: 8, prenom: 'Tiana', nom: 'Rajaona', specialite: 'Informatique', grade: 'Professeur', email: 'tiana.rajaona@emit.mg', telephone: '+261 34 00 000 08', status: 'Actif', isAvailable: true, role: 'ENCADREUR' },
  ]);

  const [plannings, setPlannings] = useState<Planning[]>([
    {
      id: 1,
      studentId: 1,
      teacherIds: [1, 2, 3],
      room: 'Salle A-101',
      date: '2026-11-11',
      slotTime: '09:00',
      status: 'SCHEDULED',
    },
    {
      id: 2,
      studentId: 2,
      teacherIds: [2, 3, 4],
      room: 'Salle B-205',
      date: '2026-11-11',
      slotTime: '10:30',
      status: 'SCHEDULED',
    },
  ]);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const [pvs, setPvs] = useState<Pv[]>([
    {
      id: 1,
      studentMatricule: '004I26',
      score: 16,
      mention: 'Très Bien',
      pdfUrl: '/mock-files/pv-004I26.pdf',
    },
  ]);

  const [defenseSlots, setDefenseSlots] = useState<DefenseSlot[]>([
    {
      id: 1,
      studentId: 1,
      studentName: 'Jean Rakoto',
      date: '2026-11-11',
      timeStart: '09:00',
      timeEnd: '10:30',
      room: 'Salle A-101',
      status: 'SCHEDULED',
      jury: [
        { id: 1, teacherName: 'Marc Rasamoelina', role: 'PRESIDENT', isAvailable: true },
        { id: 2, teacherName: 'Sophie Rajaonarivelo', role: 'RAPPORTEUR', isAvailable: true },
        { id: 3, teacherName: 'Jean-Pierre Rakotomamonjy', role: 'EXAMINER', isAvailable: true },
      ],
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'Marie Randrianasolo',
      date: '2026-11-11',
      timeStart: '10:30',
      timeEnd: '12:00',
      room: 'Salle B-205',
      status: 'SCHEDULED',
      jury: [
        { id: 2, teacherName: 'Sophie Rajaonarivelo', role: 'PRESIDENT', isAvailable: true },
        { id: 3, teacherName: 'Jean-Pierre Rakotomamonjy', role: 'RAPPORTEUR', isAvailable: true },
        { id: 4, teacherName: 'Marie Randria', role: 'EXAMINER', isAvailable: false },
      ],
    },
  ]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, startTime: '08:00', endTime: '10:00' },
    { id: 2, startTime: '10:15', endTime: '12:15' },
    { id: 3, startTime: '13:30', endTime: '15:30' },
    { id: 4, startTime: '15:45', endTime: '17:45' },
  ]);

  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, nom: 'Salle A-101', capacite: 40, batiment: 'Bâtiment A', equipements: ['Vidéoprojecteur', 'Tableau'], disponible: true },
    { id: 2, nom: 'Salle B-205', capacite: 30, batiment: 'Bâtiment B', equipements: ['Vidéoprojecteur'], disponible: true },
    { id: 3, nom: 'Amphi C', capacite: 120, batiment: 'Bâtiment C', equipements: ['Vidéoprojecteur', 'Sono'], disponible: false },
  ]);

  const assignJuryToSlot = (slotId: number, juryIds: number[]) => {
    setPlannings(prev =>
      prev.map(plan =>
        plan.id === slotId ? { ...plan, teacherIds: juryIds } : plan
      )
    );
  };

  const replaceJuryMember = (slotId: number, oldTeacherId: number, newTeacherId: number) => {
    setPlannings(prev =>
      prev.map(plan =>
        plan.id === slotId
          ? { ...plan, teacherIds: plan.teacherIds.map(id => id === oldTeacherId ? newTeacherId : id) }
          : plan
      )
    );
  };

  const uploadStudentPdf = async (matricule: string, fileUrl: string) => {
    setStudents(prev =>
      prev.map(student =>
        student.matricule === matricule
          ? { ...student, pdfUrl: fileUrl, submissionStatus: 'PDF_SUBMITTED' }
          : student
      )
    );
  };

  const submitEvaluation = (slotId: number, scoreData: Omit<Evaluation, 'id'>) => {
    const totalScore = scoreData.presentationScore + scoreData.technicalScore + scoreData.answersScore;
    const mention = totalScore >= 16 ? 'Très Bien' : totalScore >= 14 ? 'Bien' : totalScore >= 12 ? 'Assez Bien' : 'Passable';
    
    const newEvaluation: Evaluation = {
      id: Date.now(),
      slotId,
      studentId: plannings.find(p => p.id === slotId)?.studentId || 0,
      ...scoreData,
      totalScore,
    };

    setEvaluations(prev => [...prev, newEvaluation]);

    // Générer automatiquement le PV
    const planning = plannings.find(p => p.id === slotId);
    const student = students.find(s => s.id === planning?.studentId);
    if (student) {
      const newPv: Pv = {
        id: Date.now(),
        studentMatricule: student.matricule,
        score: totalScore,
        mention,
        pdfUrl: `/mock-files/pv-${student.matricule}.pdf`,
      };
      setPvs(prev => [...prev, newPv]);
    }
  };

  const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: Date.now(),
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const updateTeacher = async (id: number, teacher: Partial<Omit<Teacher, 'id'>>) => {
    setTeachers(prev => prev.map(entry => entry.id === id ? { ...entry, ...teacher } : entry));
  };

  const deleteTeacher = async (id: number) => {
    setTeachers(prev => prev.filter(entry => entry.id !== id));
    setDefenseSlots(prev => prev.map(slot => ({
      ...slot,
      jury: slot.jury.filter(member => member.id !== id),
    })));
    setPlannings(prev => prev.map(plan => ({
      ...plan,
      teacherIds: plan.teacherIds.filter(teacherId => teacherId !== id),
    })));
  };

  const assignJuryBatch = async (slotIds: number[], members: JuryMember[]) => {
    setDefenseSlots(prev =>
      prev.map(slot =>
        slotIds.includes(slot.id)
          ? { ...slot, jury: members, status: 'SCHEDULED' }
          : slot
      )
    );
  };

  const addTimeSlot = async (timeSlot: Omit<TimeSlot, 'id'>) => {
    setTimeSlots(prev => [...prev, { ...timeSlot, id: Date.now() }]);
  };

  const updateTimeSlot = async (id: number, timeSlot: Partial<Omit<TimeSlot, 'id'>>) => {
    setTimeSlots(prev => prev.map(entry => entry.id === id ? { ...entry, ...timeSlot } : entry));
  };

  const deleteTimeSlot = async (id: number) => {
    setTimeSlots(prev => prev.filter(entry => entry.id !== id));
  };

  const addRoom = async (room: Omit<Room, 'id'>) => {
    setRooms(prev => [...prev, { ...room, id: Date.now() }]);
  };

  const addDefenseSlot = async (slot: Omit<DefenseSlot, 'id'>) => {
    setDefenseSlots(prev => [...prev, { ...slot, id: Date.now() }]);
  };

  const updateDefenseSlot = async (id: number, slot: Partial<Omit<DefenseSlot, 'id'>>) => {
    setDefenseSlots(prev => prev.map(entry => entry.id === id ? { ...entry, ...slot } : entry));
  };

  const sendConvocations = async (_slotId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const value: AdminDataContextType = {
    session,
    students,
    teachers,
    plannings,
    evaluations,
    pvs,
    defenseSlots,
    timeSlots,
    rooms,
    assignJuryToSlot,
    replaceJuryMember,
    uploadStudentPdf,
    submitEvaluation,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    addRoom,
    addDefenseSlot,
    updateDefenseSlot,
    sendConvocations,
    assignJuryBatch,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAdminData = (): AdminDataContextType => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
};
