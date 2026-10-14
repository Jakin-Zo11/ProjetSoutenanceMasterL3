import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_ROOT = 'https://thirty-loops-reply.loca.lt/api/v1';
const STUDENT_TOKEN_KEY = 'emit_student_sanctum_token';

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | undefined;

function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
    },
  });

  client.interceptors.request.use(async (
    config: InternalAxiosRequestConfig,
  ) => {
    const token = await SecureStore.getItemAsync(STUDENT_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const requestUrl = error.config?.url ?? '';
      if (
        error.response?.status === 401
        && !/(^|\/)login\/?$/.test(requestUrl)
      ) {
        if (unauthorizedHandler) {
          await unauthorizedHandler();
        } else {
          await clearStudentAuthToken();
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

/** General API client, rooted at /api/v1. */
export const api = createApiClient(API_ROOT);

/** Student login and profile endpoints, rooted at /api/v1/student. */
export const studentAuthApi = createApiClient(`${API_ROOT}/student`);

export async function setStudentAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(STUDENT_TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  studentAuthApi.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export async function clearStudentAuthToken(): Promise<void> {
  delete api.defaults.headers.common.Authorization;
  delete studentAuthApi.defaults.headers.common.Authorization;
  await SecureStore.deleteItemAsync(STUDENT_TOKEN_KEY);
}

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | undefined,
): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined;
    }
  };
}

export function toApiError(error: unknown, fallback: string): Error {
  if (!axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
    return error instanceof Error ? error : new Error(fallback);
  }

  const validationMessage = Object.values(error.response?.data?.errors ?? {})[0]?.[0];
  const message = validationMessage
    ?? error.response?.data?.message
    ?? (error.code === 'ECONNABORTED'
      ? 'Le serveur ne répond pas après 15 secondes.'
      : error.message === 'Network Error'
        ? 'Connexion impossible au serveur. Vérifiez le tunnel Localtunnel et votre connexion Internet.'
        : error.message);

  return new Error(message || fallback);
}
