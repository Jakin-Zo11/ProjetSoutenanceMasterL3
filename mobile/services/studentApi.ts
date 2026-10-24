import {
  api,
  setStudentAuthToken,
  clearStudentAuthToken,
  toApiError,
} from './api';

export interface StudentApiData {
  id: number;
  matricule: string;
  name: string;
  email: string;
  telephone: string;
  formation: string;
  promotion: string;
  status: string;
  promotion_id: number | null;
  themeTitle?: string;
  company?: string;
}

export interface StudentLoginResponse {
  success: boolean;
  message: string;
  token: string;
  student: StudentApiData;
}

export interface StudentProfileResponse {
  success: boolean;
  message?: string;
  student: StudentApiData;
}

interface StudentLoginApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  student?: StudentApiData;
}

let activeStudent: StudentApiData | null = null;

export async function loginWithMatricule(
  matricule: string,
): Promise<StudentLoginResponse> {
  const normalizedMatricule = matricule.trim().toUpperCase();

  if (!normalizedMatricule) {
    throw new Error('Saisissez un matricule pour continuer.');
  }

  try {
    const response = await api.post<StudentLoginApiResponse>(
      '/api/v1/student/login',
      {
        matricule: normalizedMatricule,
      },
    );

    if (
      !response.data.success ||
      !response.data.token ||
      !response.data.student
    ) {
      throw new Error(
        response.data.message ??
          'Matricule invalide ou étudiant introuvable.',
      );
    }

    await setStudentAuthToken(response.data.token);

    activeStudent = response.data.student;

    return {
      success: true,
      message: response.data.message ?? 'Connexion réussie.',
      token: response.data.token,
      student: { ...response.data.student },
    };
  } catch (error) {
    throw toApiError(
      error,
      'Impossible de connecter cet étudiant.',
    );
  }
}

export async function getStudentProfile(): Promise<StudentProfileResponse> {
  try {
    const response = await api.get<StudentProfileResponse>(
      '/api/v1/student/profile',
    );

    if (!response.data.success || !response.data.student) {
      throw new Error(
        response.data.message ??
          'Impossible de récupérer le profil étudiant.',
      );
    }

    activeStudent = response.data.student;

    return {
      success: true,
      message: response.data.message,
      student: { ...response.data.student },
    };
  } catch (error) {
    throw toApiError(
      error,
      'Impossible de charger le profil étudiant.',
    );
  }
}

export async function updateStudentProfile(
  data: Partial<Pick<StudentApiData, 'email' | 'telephone'>>,
): Promise<StudentProfileResponse> {
  try {
    const response = await api.patch<StudentProfileResponse>(
      '/api/v1/student/profile',
      data,
    );

    if (!response.data.success || !response.data.student) {
      throw new Error(
        response.data.message ??
          'Impossible de modifier le profil étudiant.',
      );
    }

    activeStudent = response.data.student;

    return {
      success: true,
      message: response.data.message,
      student: { ...response.data.student },
    };
  } catch (error) {
    throw toApiError(
      error,
      'Impossible de modifier le profil étudiant.',
    );
  }
}

export async function logoutStudent(): Promise<void> {
  activeStudent = null;
  await clearStudentAuthToken();
}

export function hasStudentSession(): boolean {
  return activeStudent !== null;
}

export function getActiveStudent(): StudentApiData | null {
  return activeStudent ? { ...activeStudent } : null;
}