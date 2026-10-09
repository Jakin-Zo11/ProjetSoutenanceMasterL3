import { api, toApiError } from './api';

export interface StudentSimulationProfile {
  name: string;
  email: string;
  matricule: string;
  formation: string | null;
  parcours: string | null;
  niveau: string | null;
  promotion: string | null;
}

export interface StudentSimulationThesis {
  titre: string;
  description: string | null;
  perimetre: string | null;
  statut_depot: string;
}

export interface StudentSimulationDefense {
  date: string;
  heure: string;
  salle: string | null;
  jury: Array<{ nom: string; role: string }>;
  statut: string;
}

export interface StudentSimulationDocuments {
  convocation: { statut: string };
  resultat_final: string;
  pv: { statut: string };
}

interface SimulationResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function getSimulationData<T>(path: string): Promise<T> {
  try {
    const response = await api.get<SimulationResponse<T>>(path);
    if (!response.data.success) {
      throw new Error(response.data.message ?? 'Le serveur a refusé la requête.');
    }
    return response.data.data;
  } catch (error) {
    throw toApiError(error, 'Impossible de charger les données étudiant.');
  }
}

export const getProfile = () => getSimulationData<StudentSimulationProfile>('/student/simulation/profile');
export const getThesis = () => getSimulationData<StudentSimulationThesis | null>('/student/simulation/thesis');
export const getDefense = () => getSimulationData<StudentSimulationDefense | null>('/student/simulation/defense');
export const getDocuments = () => getSimulationData<StudentSimulationDocuments>('/student/simulation/documents');

const studentService = { getProfile, getThesis, getDefense, getDocuments };

export default studentService;
