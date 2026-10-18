
import { apiClient } from './client';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type LoginResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
  message?: string;
};

type MeResponse = {
  success: boolean;
  user: AuthUser;
};

export const authApi = {
  async login(email: string, password: string): Promise<AuthUser> {
    if (!email.trim() || !password.trim()) {
      throw new Error(
        'Saisissez une adresse e-mail et un mot de passe pour continuer.',
      );
    }

    const response = await apiClient.post<LoginResponse>(
      '/v1/auth/login',
      { email: email.trim(), password },
    );

    const data = response.data;

    if (!data.success || !data.token || !data.user) {
      throw new Error('La réponse du serveur est invalide.');
    }

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    return data.user;
  },

  async logout(): Promise<void> {
    try {
      if (localStorage.getItem('auth_token')) {
        await apiClient.post('/v1/auth/logout');
      }
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!localStorage.getItem('auth_token')) return null;

    try {
      const response = await apiClient.get<MeResponse>('/v1/auth/me');

      if (!response.data.success || !response.data.user) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        return null;
      }

      localStorage.setItem(
        'auth_user',
        JSON.stringify(response.data.user),
      );

      return response.data.user;
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return null;
    }
  },
};
