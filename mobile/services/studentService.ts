
import { api, toApiError } from './api';

export interface StudentProfile {
  name: string;
  email: string;
  matricule: string;
  formation: string | null;
  niveau: string | null;
  promotion: string | null;
}

export interface StudentThesis {
  titre: string;
  description: string | null;
  perimetre: string | null;
  statut_depot: string;
}

export interface StudentDefense {
  date: string;
  heure: string;
  salle: string | null;
  jury: Array<{ nom: string; role: string }>;
  statut: string;
}

export interface StudentDocuments {
  convocation: { statut: string };
  resultat_final: string;
  pv: { statut: string };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  student?: {
    name: string;
    email: string;
    matricule: string | number;
    formation?: string | null;
    niveau?: string | null;
    promotion?: string | null;
  };
  message?: string;
}

async function getStudentData<T>(path: string): Promise<T | null> {
  try {
    const response = await api.get<ApiResponse<T>>(path);
    const body = response.data;

    if (!body.success) {
      throw new Error(body.message ?? 'Le serveur a refusé la requête.');
    }

    return body.data ?? null;
  } catch (error) {
    throw toApiError(error, 'Impossible de charger les données étudiant.');
  }
}

export async function getProfile(): Promise<StudentProfile> {
  try {
    const response = await api.get<ApiResponse<never>>(
      '/api/v1/student/profile',
    );
    const body = response.data;

    if (!body.success || !body.student) {
      throw new Error(
        body.message ?? 'Impossible de récupérer le profil étudiant.',
      );
    }

    return {
      name: body.student.name,
      email: body.student.email,
      matricule: String(body.student.matricule),
      formation: body.student.formation ?? null,
      niveau: body.student.niveau ?? null,
      promotion: body.student.promotion ?? null,
    };
  } catch (error) {
    throw toApiError(error, 'Impossible de charger le profil étudiant.');
  }
}

export const getThesis = () =>
  getStudentData<StudentThesis>('/api/v1/student/thesis');

export const getDefense = () =>
  getStudentData<StudentDefense>('/api/v1/student/defense');

export const getDocuments = () =>
  getStudentData<StudentDocuments>('/api/v1/student/documents');

export const getConvocation = () =>
  getStudentData<StudentDefense>('/api/v1/student/convocation');

export const getResult = () =>
  getStudentData<{
    note_finale?: number | string;
    mention?: string | null;
    publishedAt?: string | null;
  }>('/api/v1/student/result');

const studentService = {
  getProfile,
  getThesis,
  getDefense,
  getDocuments,
  getConvocation,
  getResult,
};

export default studentService;
