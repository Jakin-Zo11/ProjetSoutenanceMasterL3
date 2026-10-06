import { apiClient } from './client';

export interface Enseignant {
  id: number;
  name: string;
  email?: string;
}

export async function getEnseignants(): Promise<Enseignant[]> {
  const response = await apiClient.get<{ data?: Enseignant[] } | Enseignant[]>('/admin/enseignants');
  const data = response.data;
  return Array.isArray(data) ? data : data.data ?? [];
}