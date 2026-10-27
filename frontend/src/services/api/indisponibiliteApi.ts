import { apiClient } from './client';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/v1$/, '');

export interface Indisponibilite {
  id: number;
  enseignant_id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  motif?: string | null;
}

export interface NouvelleIndisponibilite {
  enseignant_id: number;
  date: string;
  heure_debut: string; // HH:mm
  heure_fin: string; // HH:mm
  motif?: string;
}

export async function getIndisponibilites(enseignantId: number): Promise<Indisponibilite[]> {
  const response = await apiClient.get<Indisponibilite[]>(
    `/enseignants/${enseignantId}/indisponibilites`,
    { baseURL: API_ROOT }
  );
  return response.data;
}

export async function createIndisponibilite(payload: NouvelleIndisponibilite): Promise<Indisponibilite> {
  const response = await apiClient.post<{ message: string; data: Indisponibilite }>(
    '/indisponibilites',
    payload,
    { baseURL: API_ROOT }
  );
  return response.data.data;
}

export async function deleteIndisponibilite(id: number): Promise<void> {
  await apiClient.delete(`/indisponibilites/${id}`, { baseURL: API_ROOT });
}
