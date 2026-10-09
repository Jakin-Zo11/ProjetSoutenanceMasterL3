import { clearStudentAuthToken, setStudentAuthToken, studentAuthApi, toApiError } from './api';

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
  themeTitle?: string | null;
  company?: string | null;
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

let activeStudent: StudentApiData | null = null;
let localToken: string | null = null;

export async function loginWithMatricule(matricule: string): Promise<StudentLoginResponse> {
  const normalizedMatricule = matricule.trim().toUpperCase();
  if (!normalizedMatricule) throw new Error('Saisissez un matricule pour continuer.');

  try {
    const response = await studentAuthApi.post<StudentLoginResponse>('/login', {
      matricule: normalizedMatricule,
    });
    activeStudent = response.data.student;
    localToken = response.data.token;
    await setStudentAuthToken(localToken);
    return response.data;
  } catch (error) {
    activeStudent = null;
    localToken = null;
    await clearStudentAuthToken();
    throw toApiError(error, 'Impossible de se connecter au serveur étudiant.');
  }
}

export async function getStudentProfile(): Promise<StudentProfileResponse> {
  if (!activeStudent || !localToken) {
    throw new Error('Aucune session étudiant locale n’est active.');
  }
  try {
    const response = await studentAuthApi.get<StudentProfileResponse>('/profile');
    activeStudent = response.data.student;
    return response.data;
  } catch (error) {
    throw toApiError(error, 'Impossible de charger le profil étudiant.');
  }
}

export async function updateStudentProfile(
  data: Partial<Pick<StudentApiData, 'email' | 'telephone'>>,
): Promise<StudentProfileResponse> {
  if (!activeStudent || !localToken) {
    throw new Error('Aucune session étudiant locale n’est active.');
  }
  try {
    const response = await studentAuthApi.patch<StudentProfileResponse>('/profile', data);
    activeStudent = response.data.student;
    return response.data;
  } catch (error) {
    throw toApiError(error, 'Impossible de mettre à jour le profil étudiant.');
  }
}

export async function logoutStudent(): Promise<void> {
  activeStudent = null;
  localToken = null;
  await clearStudentAuthToken();
}

export function hasStudentSession(): boolean {
  return localToken !== null;
}
