import { apiClient } from './client';
import { Soutenance } from './soutenanceApi';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/v1$/, '');

export interface Convocation {
  id: number;
  soutenance_id: number;
  contenu: string | null;
  generee_le: string | null;
  diffusee_le?: string | null;
}

export interface ConvocationResponse {
  success: boolean;
  message?: string;
  convocation?: Convocation;
  diffusee?: boolean;
  soutenance?: Soutenance & {
    salle?: { id: number; name: string; building: string | null };
    etudiant?: { id: number; name: string; email: string };
    affectations_jury?: { role: string; enseignant: { name: string } }[];
  };
}

export async function getConvocation(soutenanceId: number): Promise<ConvocationResponse> {
  const response = await apiClient.get<ConvocationResponse>(
    `/soutenances/${soutenanceId}/convocation`,
    { baseURL: API_ROOT, timeout: 15000 }
  );
  return response.data;
}

export interface ResultatDiffusion {
  success: boolean;
  message?: string;
  deja_diffusee: boolean;
  destinataires: number;
  notifications: number;
  mails_envoyes: number;
  erreurs: string[];
  diffusee_le: string | null;
}

export interface ResultatDiffusionTout {
  success: boolean;
  soutenances: number;
  deja_diffusees: number;
  notifications: number;
  mails_envoyes: number;
  erreurs: string[];
}

export async function diffuserConvocation(soutenanceId: number, renvoyer = false): Promise<ResultatDiffusion> {
  const response = await apiClient.post<ResultatDiffusion>(
    `/soutenances/${soutenanceId}/convocation/diffuser`,
    {},
    { baseURL: API_ROOT, params: renvoyer ? { renvoyer: 1 } : undefined, timeout: 60000 }
  );
  return response.data;
}

export async function diffuserToutesConvocations(): Promise<ResultatDiffusionTout> {
  const response = await apiClient.post<ResultatDiffusionTout>(
    '/planning/convocations/diffuser',
    {},
    { baseURL: API_ROOT, timeout: 120000 }
  );
  return response.data;
}

export interface Conflit {
  type: 'salle' | 'jury' | 'indisponibilite';
  soutenance_a: number;
  soutenance_b: number | null;
  detail: string;
}

export async function getConflits(): Promise<Conflit[]> {
  const response = await apiClient.get<Conflit[]>('/planning/conflits', { baseURL: API_ROOT });
  return response.data;
}