import React, { createContext, useContext, useMemo, useState } from 'react';
import type { DefenseDate, DefenseSlot, EvaluationGrid, JuryMember, StudentProfile } from '../types/defense';
import type { Room, Teacher } from '../types';
import { mockDefenses, mockRooms, mockStudents, mockTeachers } from '../mocks';

export interface AdminStudent extends StudentProfile {
  id: number;
  email: string;
  promotion: string;
  submissionStatus: 'En attente' | 'PDF déposé';
}

export interface GeneratedPv {
  id: number;
  defenseId: number;
  reference: string;
  generatedAt: string;
  studentMatricule: string;
  studentName: string;
  score: number;
  comments: string;
}

export interface AdminNotification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
}

interface EvaluationScores {
  presentationScore: number;
  technicalScore: number;
  answersScore: number;
  comments: string;
}

interface AdminDataContextValue {
  session: Readonly<{ startDate: '2026-11-11'; endDate: '2026-11-16' }>;
  students: AdminStudent[];
  teachers: Teacher[];
  rooms: Room[];
  defenseSlots: DefenseSlot[];
  evaluations: EvaluationGrid[];
  pvs: GeneratedPv[];
  notifications: AdminNotification[];
  uploadStudentPdf: (matricule: string, pdfUrl: string) => Promise<void>;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  assignJuryBatch: (slotIds: number[], juryMembers: JuryMember[]) => Promise<void>;
  replaceJuryMember: (slotId: number, oldTeacherId: number, newTeacherId: number) => Promise<void>;
  submitEvaluation: (defenseId: number, scores: EvaluationScores) => Promise<void>;
}

const SESSION = Object.freeze({
  startDate: '2026-11-11' as const,
  endDate: '2026-11-16' as const,
});

const INITIAL_EVALUATION: EvaluationGrid = {
  defenseId: mockDefenses[1].id,
  presentationScore: 4,
  technicalScore: 8,
  answersScore: 4,
  totalScore: 16,
  comments: 'Très bonne maîtrise du sujet et présentation claire.',
  isValidated: true,
};

const INITIAL_PV: GeneratedPv = {
  id: 1,
  defenseId: INITIAL_EVALUATION.defenseId,
  reference: 'PV-2026-001',
  generatedAt: '2026-11-12T12:00:00.000Z',
  studentMatricule: mockStudents[1].matricule,
  studentName: `${mockStudents[1].prenom} ${mockStudents[1].nom}`,
  score: INITIAL_EVALUATION.totalScore,
  comments: INITIAL_EVALUATION.comments,
};

const waitForLocalValidation = () => new Promise<void>((resolve) => setTimeout(resolve, 200));

function getTimeEnd(start: string, duration: number): string {
  const [hours, minutes] = start.split(':').map(Number);
  const end = hours * 60 + minutes + duration;
  return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
}

function toDefenseDate(value: string): DefenseDate {
  const allowedDates: DefenseDate[] = [
    '2026-11-11', '2026-11-12', '2026-11-13',
    '2026-11-14', '2026-11-15', '2026-11-16',
  ];
  if (!allowedDates.includes(value as DefenseDate)) {
    throw new Error(`La date de soutenance ${value} est hors de la session autorisée.`);
  }
  return value as DefenseDate;
}

function createInitialStudents(): AdminStudent[] {
  return mockStudents.map((student) => ({
    id: student.id,
    matricule: student.matricule,
    fullName: `${student.prenom} ${student.nom}`,
    filiere: student.formation,
    themeTitle: student.sujetThese,
    company: 'Entreprise non renseignée',
    email: student.email,
    promotion: student.promotion,
    pdfUrl: student.pdfUrl,
    submissionStatus: student.pdfUrl ? 'PDF déposé' : 'En attente',
  }));
}

function createInitialSlots(students: AdminStudent[]): DefenseSlot[] {
  return mockDefenses.map((defense) => {
    const student = students.find((candidate) => candidate.id === defense.studentId);
    if (!student) throw new Error(`Étudiant manquant pour la soutenance ${defense.id}.`);

    const jury: JuryMember[] = defense.jury
      ? [
          { id: defense.jury.presidentId, teacherName: `${defense.jury.president?.prenom ?? ''} ${defense.jury.president?.nom ?? ''}`.trim(), role: 'PRESIDENT', isAvailable: true },
          { id: defense.jury.rapporteurId, teacherName: `${defense.jury.rapporteur?.prenom ?? ''} ${defense.jury.rapporteur?.nom ?? ''}`.trim(), role: 'RAPPORTEUR', isAvailable: true },
          { id: defense.jury.examinateurId, teacherName: `${defense.jury.examinateur?.prenom ?? ''} ${defense.jury.examinateur?.nom ?? ''}`.trim(), role: 'EXAMINER', isAvailable: true },
        ]
      : [];

    const seededEvaluation = defense.id === INITIAL_EVALUATION.defenseId ? INITIAL_EVALUATION : undefined;
    return {
      id: defense.id,
      studentMatricule: student.matricule,
      studentName: student.fullName,
      themeTitle: student.themeTitle,
      pdfUrl: student.pdfUrl ?? '',
      date: toDefenseDate(defense.date),
      timeStart: defense.heure,
      timeEnd: getTimeEnd(defense.heure, defense.duree),
      room: defense.room?.nom ?? 'Salle à attribuer',
      jury,
      status: seededEvaluation
        ? 'COMPLETED'
        : jury.length ? 'SCHEDULED' : student.pdfUrl ? 'SUBMITTED' : 'PENDING_SUBMISSION',
      ...(seededEvaluation ? { finalScore: seededEvaluation.totalScore, pvUrl: `#${INITIAL_PV.reference}` } : {}),
    };
  });
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export const AdminDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [students, setStudents] = useState(createInitialStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [defenseSlots, setDefenseSlots] = useState<DefenseSlot[]>(() => createInitialSlots(students));
  const [evaluations, setEvaluations] = useState<EvaluationGrid[]>([INITIAL_EVALUATION]);
  const [pvs, setPvs] = useState<GeneratedPv[]>([INITIAL_PV]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const value = useMemo<AdminDataContextValue>(() => ({
    session: SESSION,
    students,
    teachers,
    rooms,
    defenseSlots,
    evaluations,
    pvs,
    notifications,
    uploadStudentPdf: async (matricule, pdfUrl) => {
      if (!pdfUrl.trim()) throw new Error('Le fichier PDF est obligatoire.');
      const student = students.find((entry) => entry.matricule === matricule);
      if (!student) throw new Error(`Aucun étudiant trouvé pour le matricule ${matricule}.`);
      await waitForLocalValidation();
      const submissionDate = new Date().toISOString();
      setStudents((current) => current.map((entry) => entry.matricule === matricule
        ? { ...entry, pdfUrl, submissionDate, submissionStatus: 'PDF déposé' }
        : entry));
      setDefenseSlots((current) => current.map((slot) => slot.studentMatricule === matricule
        ? { ...slot, pdfUrl, status: slot.jury.length ? 'SCHEDULED' : 'SUBMITTED' }
        : slot));
    },
    addTeacher: async (teacher) => {
      if (!teacher.nom.trim() || !teacher.prenom.trim()) throw new Error('Le nom et le prénom sont obligatoires.');
      await waitForLocalValidation();
      setTeachers((current) => [...current, { ...teacher, id: Math.max(0, ...current.map((item) => item.id)) + 1 }]);
    },
    addRoom: async (room) => {
      if (!room.nom.trim()) throw new Error('Le nom de la salle est obligatoire.');
      await waitForLocalValidation();
      setRooms((current) => [...current, { ...room, id: Math.max(0, ...current.map((item) => item.id)) + 1 }]);
    },
    assignJuryBatch: async (slotIds, juryMembers) => {
      const roles = juryMembers.map((member) => member.role);
      if (juryMembers.length !== 3 || new Set(roles).size !== 3
        || !(['PRESIDENT', 'RAPPORTEUR', 'EXAMINER'] as const).every((role) => roles.includes(role))) {
        throw new Error('Un jury doit comprendre un président, un rapporteur et un examinateur distincts.');
      }
      if (new Set(juryMembers.map((member) => member.id)).size !== juryMembers.length) {
        throw new Error('Un enseignant ne peut occuper plusieurs rôles dans le même jury.');
      }
      const selectedSlots = defenseSlots.filter((slot) => slotIds.includes(slot.id));
      if (selectedSlots.length !== slotIds.length || selectedSlots.some((slot) => slot.status === 'COMPLETED')) {
        throw new Error('Un créneau sélectionné est introuvable ou déjà clôturé.');
      }
      if (selectedSlots.some((slot) => !slot.pdfUrl)) {
        throw new Error('Seuls les étudiants ayant déposé leur PDF peuvent être planifiés.');
      }
      await waitForLocalValidation();
      setDefenseSlots((current) => current.map((slot) => slotIds.includes(slot.id)
        ? { ...slot, jury: juryMembers, status: 'SCHEDULED' }
        : slot));
    },
    replaceJuryMember: async (slotId, oldTeacherId, newTeacherId) => {
      const slot = defenseSlots.find((entry) => entry.id === slotId);
      const replacement = teachers.find((teacher) => teacher.id === newTeacherId);
      if (!slot || !replacement) throw new Error('Le créneau ou l’enseignant remplaçant est introuvable.');
      if (replacement.status !== 'Actif' || !replacement.isAvailable) {
        throw new Error('L’enseignant sélectionné n’est pas disponible.');
      }
      if (slot.status === 'COMPLETED') throw new Error('Une soutenance terminée ne peut plus être modifiée.');
      const member = slot.jury.find((entry) => entry.id === oldTeacherId);
      if (!member) throw new Error('Le juré à remplacer ne fait pas partie de ce jury.');
      if (slot.jury.some((entry) => entry.id === newTeacherId)) {
        throw new Error('Cet enseignant est déjà membre de ce jury.');
      }
      const slotStart = slot.timeStart.split(':').map(Number).reduce((total, part, index) => total + part * (index === 0 ? 60 : 1), 0);
      const slotEnd = slot.timeEnd.split(':').map(Number).reduce((total, part, index) => total + part * (index === 0 ? 60 : 1), 0);
      const conflict = defenseSlots.some((other) => other.id !== slotId
        && other.date === slot.date
        && other.jury.some((otherMember) => otherMember.id === newTeacherId)
        && slotStart < other.timeEnd.split(':').map(Number).reduce((total, part, index) => total + part * (index === 0 ? 60 : 1), 0)
        && other.timeStart.split(':').map(Number).reduce((total, part, index) => total + part * (index === 0 ? 60 : 1), 0) < slotEnd);
      if (conflict) throw new Error('Cet enseignant est déjà affecté sur un créneau qui chevauche celui-ci.');
      await waitForLocalValidation();
      const replacementMember: JuryMember = {
        id: replacement.id,
        teacherName: `${replacement.prenom} ${replacement.nom}`,
        role: member.role,
        isAvailable: replacement.isAvailable,
      };
      setDefenseSlots((current) => current.map((entry) => entry.id === slotId
        ? { ...entry, jury: entry.jury.map((juryMember) => juryMember.id === oldTeacherId ? replacementMember : juryMember), status: 'ABSENT_REPLACED' }
        : entry));
      setNotifications((current) => [{
        id: Date.now(),
        message: `Remplacement attribué pour le ${slot.date} à ${slot.timeStart} : ${replacementMember.teacherName}.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current]);
    },
    submitEvaluation: async (defenseId, scores) => {
      const slot = defenseSlots.find((entry) => entry.id === defenseId);
      if (!slot) throw new Error('Créneau de soutenance introuvable.');
      if (!slot.jury.length) throw new Error('Aucun jury n’est affecté à ce créneau.');
      if (slot.status === 'COMPLETED' || evaluations.some((entry) => entry.defenseId === defenseId)) {
        throw new Error('Cette soutenance a déjà été évaluée.');
      }
      if (scores.presentationScore < 0 || scores.presentationScore > 5
        || scores.technicalScore < 0 || scores.technicalScore > 10
        || scores.answersScore < 0 || scores.answersScore > 5) {
        throw new Error('Les notes doivent respecter les barèmes /5, /10 et /5.');
      }
      await waitForLocalValidation();
      const totalScore = scores.presentationScore + scores.technicalScore + scores.answersScore;
      const evaluation: EvaluationGrid = {
        defenseId,
        ...scores,
        totalScore,
        isValidated: true,
      };
      const pv: GeneratedPv = {
        id: Date.now(),
        defenseId,
        reference: `PV-2026-${String(pvs.length + 1).padStart(3, '0')}`,
        generatedAt: new Date().toISOString(),
        studentMatricule: slot.studentMatricule,
        studentName: slot.studentName,
        score: totalScore,
        comments: scores.comments,
      };
      setEvaluations((current) => [...current, evaluation]);
      setDefenseSlots((current) => current.map((entry) => entry.id === defenseId
        ? { ...entry, status: 'COMPLETED', finalScore: totalScore, pvUrl: `#${pv.reference}` }
        : entry));
      setPvs((current) => [...current, pv]);
      setNotifications((current) => [{
        id: Date.now() + 1,
        message: `Résultat publié pour ${slot.studentName} : ${totalScore}/20. Le PV ${pv.reference} est disponible.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current]);
    },
  }), [students, teachers, rooms, defenseSlots, evaluations, pvs, notifications]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export function useAdminData(): AdminDataContextValue {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData doit être utilisé dans AdminDataProvider.');
  return context;
}
