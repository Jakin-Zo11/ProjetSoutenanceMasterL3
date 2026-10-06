import { apiClient } from './client';
import { Soutenance } from './soutenanceApi';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/v1$/, '');

export interface Convocation {
  id: number;
  soutenance_id: number;
  contenu: string | null;
  generee_le: string | null;
}

export interface ConvocationResponse {
  success: boolean;
  message?: string;
  convocation?: Convocation;
  soutenance?: Soutenance & {
    salle?: { id: number; name: string; building: string | null };
    etudiant?: { id: number; name: string; email: string };
    affectations_jury?: { role: string; enseignant: { name: string } }[];
  };
}

export async function getConvocation(soutenanceId: number): Promise<ConvocationResponse> {
  const response = await apiClient.get<ConvocationResponse>(
    `/soutenances/${soutenanceId}/convocation`,
    { baseURL: API_ROOT }
  );
  return response.data;
}

export interface Conflit {
  type: 'salle' | 'jury';
  soutenance_a: number;
  soutenance_b: number;
  detail: string;
}

export async function getConflits(): Promise<Conflit[]> {
  const response = await apiClient.get<Conflit[]>('/planning/conflits', { baseURL: API_ROOT });
  return response.data;
}