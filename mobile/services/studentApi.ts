/**
 * Service API — Espace étudiant
 *
 * Utilise fetch natif (pas besoin d'axios).
 *
 * Token en mémoire pour la session courante.
 *
 * ⚠️  Pour persister le token entre les redémarrages de l'app, installez :
 *       npx expo install expo-secure-store
 *     puis remplacez tokenStore par SecureStore.setItemAsync / getItemAsync.
 *
 * Routes backend :
 *   POST  /api/v1/student/login   → connexion par matricule
 *   GET   /api/v1/student/profile → profil de l'étudiant connecté
 *   PATCH /api/v1/student/profile → mise à jour email / telephone
 */
// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * URL de base de l'API Laravel.
 * • Émulateur Android : 10.0.2.2 pointe vers localhost de la machine hôte.
 * • Appareil physique   : remplacez par l'IP LAN du serveur (ex: 192.168.1.x).
 * • Variable d'env      : EXPO_PUBLIC_API_URL dans .env
 */
const API_URL =
  (typeof process !== 'undefined' && (process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_URL) ||
  'http://192.168.2.174:8000/api';

// ─── Stockage du token en mémoire ────────────────────────────────────────────
// Simple et sans dépendance. Le token est perdu si l'app est tuée.
// Pour la persistance, remplacer par expo-secure-store.

let _studentToken: string | null = null;

export function saveToken(token: string): void {
  _studentToken = token;
}

export function getToken(): string | null {
  return _studentToken;
}

export function clearToken(): void {
  _studentToken = null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Données étudiant telles que retournées par le backend. */
export interface StudentApiData {
  id: number;
  /** Matricule toujours string — ex : "001I24" — jamais converti en nombre */
  matricule: string;
  /** Nom complet (la BDD n'a pas first_name / last_name séparés) */
  name: string;
  email: string;
  telephone: string;
  formation: string;
  promotion: string;
  status: string;
  promotion_id: number | null;
}

export interface StudentLoginResponse {
  success: boolean;
  message: string;
  token: string;
  student: StudentApiData;
}

export interface StudentProfileResponse {
  success: boolean;
  message?: string;
  student: StudentApiData;
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

function buildHeaders(withAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (withAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Lance fetch, parse JSON et lève une Error lisible si la réponse n'est pas ok.
 */
async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean },
): Promise<T> {
  const { auth = false, ...fetchOptions } = options;
  const headers = buildHeaders(auth);

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: { ...headers, ...(fetchOptions.headers as Record<string, string> ?? {}) },
  });

  // Toujours parser JSON même en cas d'erreur (le backend renvoie un message)
  let json: Record<string, unknown> = {};
  try {
    json = await response.json();
  } catch {
    // réponse vide ou non-JSON
  }

  if (!response.ok) {
    // Extraire le premier message d'erreur disponible
    const errors = json?.errors as Record<string, string[]> | undefined;
    const firstError = errors ? Object.values(errors)[0]?.[0] : undefined;
    const message = (json?.message as string) || firstError || `Erreur ${response.status}`;
    throw new Error(message);
  }

  return json as T;
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Connexion étudiant par matricule.
 *
 * Envoie exactement : { "matricule": "001I24" }
 * Le matricule est traité comme string, jamais converti en nombre.
 *
 * Sauvegarde le token en mémoire pour les appels suivants.
 */
export async function loginWithMatricule(
  matricule: string,
): Promise<StudentLoginResponse> {
  // Sécurité : on ne passe jamais Number(matricule)
  const payload = JSON.stringify({ matricule: String(matricule) });

  const data = await request<StudentLoginResponse>('/v1/student/login', {
    method: 'POST',
    body: payload,
  });

  if (data.token) {
    saveToken(data.token);
  }

  return data;
}

/**
 * Récupère le profil de l'étudiant connecté.
 * Nécessite un token valide (après loginWithMatricule).
 */
export async function getStudentProfile(): Promise<StudentProfileResponse> {
  return request<StudentProfileResponse>('/v1/student/profile', {
    method: 'GET',
    auth: true,
  });
}

/**
 * Met à jour uniquement les champs modifiables.
 * Le backend ignore et refuse matricule / name — double protection.
 */
export async function updateStudentProfile(
  data: Partial<Pick<StudentApiData, 'email' | 'telephone'>>,
): Promise<StudentProfileResponse> {
  return request<StudentProfileResponse>('/v1/student/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

/** Déconnexion locale — efface le token en mémoire. */
export function logoutStudent(): void {
  clearToken();
}

/** Indique si un token étudiant est actif en mémoire. */
export function hasStudentSession(): boolean {
  return _studentToken !== null;
}
