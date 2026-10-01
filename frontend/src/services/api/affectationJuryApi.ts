import { apiClient } from './client';
import { Enseignant } from './enseignantApi';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/v1$/, '');

export interface AffectationJury {
  id: number;
  soutenance_id: number;
  enseignant_id: number;
  role: 'president' | 'rapporteur' | 'examinateur';
  enseignant?: Enseignant;
}

export async function getAffectations(soutenanceId: number): Promise<AffectationJury[]> {
  const response = await apiClient.get<AffectationJury[]>(
    `/soutenances/${soutenanceId}/jurys`,
    { baseURL: API_ROOT }
  );
  return response.data;
}

export async function affecterJury(
  soutenanceId: number,
  enseignantId: number,
  role: 'president' | 'rapporteur' | 'examinateur'
): Promise<{ success: boolean; message?: string; affectation?: AffectationJury }> {
  const response = await apiClient.post(
    `/soutenances/${soutenanceId}/jurys`,
    { enseignant_id: enseignantId, role },
    { baseURL: API_ROOT }
  );
  return response.data;
}

export async function retirerAffectation(affectationId: number): Promise<void> {
  await apiClient.delete(`/affectation-jury/${affectationId}`, { baseURL: API_ROOT });
}