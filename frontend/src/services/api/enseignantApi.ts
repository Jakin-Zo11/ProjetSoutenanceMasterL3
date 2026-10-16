import { apiClient } from './client';

export interface Enseignant {
  id: number;
  name: string;
  email?: string;
}

export async function getEnseignants(): Promise<Enseignant[]> {
  // Ajout de '/v1' pour correspondre au groupe de routes Laravel
  const response = await apiClient.get<{ data?: Enseignant[] } | Enseignant[]>('/v1/admin/enseignants');
  const data = response.data;
  return Array.isArray(data) ? data : data.data ?? [];
}