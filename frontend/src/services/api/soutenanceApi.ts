import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

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
  const response = await axios.get<Soutenance[]>(`${API_BASE}/planning`);
  return response.data;
}

export async function planifierSoutenance(
  soutenanceId: number,
  date: string
): Promise<{ success: boolean; message?: string; soutenance?: Soutenance }> {
  const response = await axios.post(`${API_BASE}/soutenances/${soutenanceId}/planifier`, {
    date,
  });
  return response.data;
}