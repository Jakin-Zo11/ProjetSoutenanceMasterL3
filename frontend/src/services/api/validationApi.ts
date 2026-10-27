import { apiClient } from './client';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/v1$/, '');

export interface StatutValidation {
  planifiees: number;
  validees: number;
  a_valider: number;
  diffusees: number;
  a_diffuser: number;
}

export async function getStatutValidation(): Promise<StatutValidation> {
  const response = await apiClient.get<StatutValidation>('/planning/validation', { baseURL: API_ROOT });
  return response.data;
}

export async function validerPlanning(): Promise<{
  success: boolean;
  validees: number;
  ignorees: { id: number; raison: string }[];
}> {
  const response = await apiClient.post('/planning/valider', {}, { baseURL: API_ROOT });
  return response.data;
}