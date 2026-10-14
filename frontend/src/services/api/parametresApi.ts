import { apiClient } from './client';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/v1$/, '');

export interface ParametresPlanification {
  heure_debut_journee: string; // "08:00:00" renvoye par l'API
  heure_fin_journee: string;
  duree_minutes: number;
}

export async function getParametres(): Promise<ParametresPlanification> {
  const response = await apiClient.get<ParametresPlanification>('/planning/parametres', {
    baseURL: API_ROOT,
  });
  return response.data;
}

export async function updateParametres(params: {
  heure_debut_journee: string; // format "HH:mm"
  heure_fin_journee: string;
  duree_minutes: number;
}): Promise<{ success: boolean; parametres?: ParametresPlanification }> {
  const response = await apiClient.put('/planning/parametres', params, { baseURL: API_ROOT });
  return response.data;
}