import { apiClient } from './client';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/v1$/, '');

export interface IndicateursPlanning {
  jours: number;
  minutes_inactives: number;
  conflits: number;
}

export interface Deplacement {
  soutenance_id: number;
  etudiant: string;
  theme: string | null;
  de: { date_debut: string; date_fin: string; salle_id: number };
  vers: { date_debut: string; date_fin: string; salle_id: number };
}

export interface ResultatOptimisation {
  success: boolean;
  appliquee: boolean;
  message: string;
  deplacements: Deplacement[];
  avant: IndicateursPlanning;
  apres: IndicateursPlanning;
  figees: number;
}

export async function optimiserPlanning(appliquer: boolean): Promise<ResultatOptimisation> {
  const response = await apiClient.post<ResultatOptimisation>(
    '/planning/optimiser',
    { appliquer },
    { baseURL: API_ROOT, timeout: 120000 }
  );
  return response.data;
}
