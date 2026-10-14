import { apiClient } from './client';

export type CreneauType = 'Matin' | 'Après-midi';

export interface Creneau {
  id: number;
  reference: string;
  heure_debut: string;
  heure_fin: string;
  jours: string[];
  type: CreneauType;
  actif: boolean;
  capacite: number;
  soutenances_count?: number;
}

export type CreneauPayload = Omit<Creneau, 'id' | 'soutenances_count'>;

interface LaravelCollection<T> {
  data: T[];
}

const unwrapCollection = <T>(payload: T[] | LaravelCollection<T>): T[] =>
  Array.isArray(payload) ? payload : payload.data;

const unwrapResource = <T>(payload: T | { data: T }): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const creneauxApi = {
  async list(): Promise<Creneau[]> {
    const response = await apiClient.get<Creneau[] | LaravelCollection<Creneau>>('/creneaux');
    return unwrapCollection<Creneau>(response.data);
  },
  async create(payload: CreneauPayload): Promise<Creneau> {
    const response = await apiClient.post<Creneau | { data: Creneau }>('/creneaux', payload);
    return unwrapResource<Creneau>(response.data);
  },
  async update(id: number, payload: CreneauPayload): Promise<Creneau> {
    const response = await apiClient.put<Creneau | { data: Creneau }>(`/creneaux/${id}`, payload);
    return unwrapResource<Creneau>(response.data);
  },
  async updateStatut(id: number, actif: boolean): Promise<Creneau> {
    const response = await apiClient.patch<Creneau | { data: Creneau }>(`/creneaux/${id}/statut`, { actif });
    return unwrapResource<Creneau>(response.data);
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/creneaux/${id}`);
  },
};
