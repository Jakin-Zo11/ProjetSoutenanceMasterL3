import { apiClient } from './client';

// Racine API sans /v1, pour les routes de planification
const API_ROOT = (
  import.meta.env.VITE_API_URL ??
  'http://127.0.0.1:8000/api/v1'
).replace(/\/v1$/, '');

export interface Soutenance {
  id: number;
  etudiant_id: number;
  salle_id: number | null;
  theme: string | null;
  date_debut: string | null;
  date_fin: string | null;
  statut: 'en_attente' | 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
}

export async function getPlanning(): Promise<Soutenance[]> {
  const response = await apiClient.get<Soutenance[]>(
    '/planning',
    { baseURL: API_ROOT }
  );

  return response.data;
}

export async function planifierSoutenance(
  soutenanceId: number,
  date: string
): Promise<{
  success: boolean;
  message?: string;
  soutenance?: Soutenance;
}> {
  const response = await apiClient.post(
    `/soutenances/${soutenanceId}/planifier`,
    { date },
    { baseURL: API_ROOT }
  );

  return response.data;
}

// Replanification d'une soutenance déjà planifiée
export async function replanifierSoutenance(
  soutenanceId: number,
  date: string
): Promise<{
  success: boolean;
  message?: string;
  soutenance?: Soutenance;
}> {
  const response = await apiClient.post(
    `/soutenances/${soutenanceId}/replanifier`,
    { date },
    { baseURL: API_ROOT }
  );

  return response.data;
}

export async function getSoutenancesEnAttente(): Promise<Soutenance[]> {
  const all = await getPlanning();

  return all.filter((s) => s.statut === 'en_attente');
}