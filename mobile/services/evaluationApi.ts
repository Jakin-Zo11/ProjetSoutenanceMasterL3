
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

const TOKEN_KEY = 'emit_jury_sanctum_token';

/**
 * URL de l'API Laravel.
 * Android Emulator : localhost du PC devient 10.0.2.2.
 * Expo Go sur téléphone : configurer l'adresse IP LAN dans .env.
 * Web : utiliser l'URL configurée.
 */
function getApiBaseUrl(): string {
  const envUrl = (
    process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
  ).replace(/\/+$/, '');

  if (Platform.OS === 'android') {
    return envUrl
      .replace('://localhost', '://10.0.2.2')
      .replace('://127.0.0.1', '://10.0.2.2');
  }

  return envUrl;
}

const API_BASE_URL = getApiBaseUrl();
const API_PREFIX = '/api';

export interface JurySession {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
    roles: string[];
  };
}

export interface SimpleEvaluation {
  id: number;
  soutenance_id: number;
  student_name: string;
  theme: string;
  date: string;
  heure: string;
  salle: string;
  status: string;
  note_generale: number | null;
  commentary: string | null;
}

export type AssignedEvaluation = SimpleEvaluation;

export interface SaveNotePayload {
  soutenance_id: number;
  note_generale: number;
  commentaire?: string | null;
}

export interface EvaluationMutationResponse {
  id: number;
  soutenance_id: number;
  note_generale: number | null;
  commentaire?: string | null;
  status?: string;
}

export interface DeliberationValidationResponse {
  id: number;
  status: string;
  decision: string | null;
  mention: string | null;
  commentaire_deliberation: string | null;
  validated_at: string | null;
}

export interface SupportingInfo {
  student_name: string;
  theme: string;
  date: string;
  heure: string;
  salle: string;
  session?: string | null;
}

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string | null;
    roles?: string[];
  };
}

const JURY_ROLES = [
  'jury',
  'admin',
  'president_jury',
  'rapporteur',
  'examinateur',
  'enseignant',
];

function formatApiError(
  status: number,
  body: ApiErrorBody | null,
): string {
  if (status === 422) {
    if (body?.errors) {
      const firstError = Object.values(body.errors).flat()[0];
      if (firstError) return firstError;
    }

    return body?.message || 'Les données envoyées sont invalides.';
  }

  if (status === 401) {
    return body?.message || 'Session expirée ou authentification requise.';
  }

  if (status === 403) {
    return body?.message || 'Accès refusé pour ce compte.';
  }

  if (status === 404) {
    return body?.message || 'La ressource demandée est introuvable.';
  }

  return body?.message || `La requête a échoué (HTTP ${status}).`;
}

async function request<T>(
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set('Accept', 'application/json');

  if (init.body !== undefined && init.body !== null) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${API_PREFIX}${path}`,
      {
        ...init,
        headers,
      },
    );
  } catch {
    throw new Error(
      'Impossible de joindre l’API Laravel. Vérifiez que le serveur est démarré et que l’URL est correcte.',
    );
  }

  const body = await response.json().catch(() => null) as
    | (T & ApiErrorBody)
    | null;

  if (!response.ok) {
    throw new Error(formatApiError(response.status, body));
  }

  if (body === null) {
    throw new Error('L’API a renvoyé une réponse vide ou illisible.');
  }

  return body;
}

/**
 * Vérification du rôle.
 * Le DefenseEvaluationController fourni accepte actuellement
 * les rôles "jury" et "admin" pour les opérations d'évaluation.
 */
export function checkJuryRole(user: { roles: string[] }): boolean {
  return JURY_ROLES.some(role => user.roles.includes(role));
}

/**
 * GET /api/v1/evaluations/assigned
 */
export async function listAssignedEvaluations(
  token: string,
): Promise<SimpleEvaluation[]> {
  const response = await request<SimpleEvaluation[]>(
    '/v1/evaluations/assigned',
    token,
  );

  if (!Array.isArray(response)) {
    throw new Error('Format invalide pour la liste des évaluations.');
  }

  return response;
}

/**
 * POST /api/v1/evaluations
 * Création de la note globale d'une soutenance.
 */
export async function saveJuryNote(
  token: string,
  soutenanceId: number,
  noteGlobale: number,
  commentaire?: string | null,
): Promise<EvaluationMutationResponse> {
  if (!Number.isFinite(noteGlobale) || noteGlobale < 0 || noteGlobale > 20) {
    throw new Error('La note doit être comprise entre 0 et 20.');
  }

  const payload: SaveNotePayload = {
    soutenance_id: soutenanceId,
    note_generale: noteGlobale,
    commentaire: commentaire ?? null,
  };

  return request<EvaluationMutationResponse>(
    '/v1/evaluations',
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

/**
 * PUT /api/v1/evaluations/{id}
 * L'identifiant dans l'URL est celui de l'évaluation,
 * et non celui de la soutenance.
 */
export async function updateJuryNote(
  token: string,
  evaluationId: number,
  noteGlobale: number,
  commentaire?: string | null,
): Promise<EvaluationMutationResponse> {
  if (!Number.isFinite(noteGlobale) || noteGlobale < 0 || noteGlobale > 20) {
    throw new Error('La note doit être comprise entre 0 et 20.');
  }

  return request<EvaluationMutationResponse>(
    `/v1/evaluations/${evaluationId}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({
        note_generale: noteGlobale,
        commentaire: commentaire ?? null,
      }),
    },
  );
}

/**
 * POST /api/v1/evaluations/{id}/validate
 * Le backend exige une décision explicite.
 */
export async function validateDeliberation(
  token: string,
  evaluationId: number,
  decision: string,
  mention?: string | null,
  commentaireDeliberation?: string | null,
): Promise<DeliberationValidationResponse> {
  if (!decision.trim()) {
    throw new Error('La décision de délibération est obligatoire.');
  }

  return request<DeliberationValidationResponse>(
    `/v1/evaluations/${evaluationId}/validate`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        decision,
        mention: mention ?? null,
        commentaire_deliberation: commentaireDeliberation ?? null,
      }),
    },
  );
}

/**
 * POST /api/v1/auth/login
 */
export async function loginJury(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  token?: string;
  message?: string;
  user?: JurySession['user'];
}> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/v1/auth/login`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    );
  } catch {
    return {
      success: false,
      message: 'Impossible de joindre le serveur Laravel.',
    };
  }

  const data = await response.json().catch(() => null) as
    | LoginResponse
    | null;

  if (!response.ok) {
    return {
      success: false,
      message: data?.message || 'Identifiants incorrects.',
    };
  }

  if (!data?.success || !data.token || !data.user) {
    return {
      success: false,
      message: 'La réponse du serveur est invalide.',
    };
  }

  const roles = data.user.roles ?? (
    data.user.role ? [data.user.role] : []
  );

  try {
    await storage.setItemAsync(TOKEN_KEY, data.token);
  } catch {
    return {
      success: false,
      message: 'Impossible de sauvegarder la session sur cet appareil.',
    };
  }

  return {
    success: true,
    token: data.token,
    message: data.message || 'Connexion réussie.',
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role ?? undefined,
      roles,
    },
  };
}

/**
 * POST /api/v1/auth/logout
 * Le token Sanctum est envoyé avant la suppression locale.
 */
export async function logout(token: string): Promise<void> {
  try {
    await request<{ success: boolean }>(
      '/v1/auth/logout',
      token,
      { method: 'POST' },
    );
  } finally {
    await storage.removeItemAsync(TOKEN_KEY);
  }
}

/**
 * Informations de soutenance issues de la liste des évaluations.
 */
export async function getSupportingInfo(
  token: string,
  soutenanceId: number,
): Promise<SupportingInfo> {
  const evaluations = await listAssignedEvaluations(token);

  const evaluation = evaluations.find(
    item => item.soutenance_id === soutenanceId,
  );

  if (!evaluation) {
    return {
      student_name: 'Soutenance inconnue',
      theme: 'Inconnu',
      date: 'Non disponible',
      heure: 'Non disponible',
      salle: 'Non disponible',
    };
  }

  return {
    student_name: evaluation.student_name,
    theme: evaluation.theme,
    date: evaluation.date,
    heure: evaluation.heure,
    salle: evaluation.salle,
  };
}

const evaluationApi = {
  listAssignedEvaluations,
  saveJuryNote,
  updateJuryNote,
  validateDeliberation,
  loginJury,
  checkJuryRole,
  getSupportingInfo,
};

export default evaluationApi;
