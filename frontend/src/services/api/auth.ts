export type AuthUser = { id: number; name: string; email: string; role: string };

let activeUser: AuthUser | null = null;

const waitForLocalValidation = () => new Promise<void>((resolve) => setTimeout(resolve, 200));

export const authApi = {
  async login(email: string, password: string): Promise<AuthUser> {
    if (!email.trim() || !password.trim()) {
      throw new Error('Saisissez une adresse e-mail et un mot de passe pour continuer.');
    }
    await waitForLocalValidation();
    activeUser = { id: 1, name: 'Administrateur EMIT', email: email.trim(), role: 'ADMIN' };
    localStorage.setItem('auth_token', 'demo-admin-session');
    return { ...activeUser };
  },
  async logout(): Promise<void> {
    await waitForLocalValidation();
    activeUser = null;
    localStorage.removeItem('auth_token');
  },
  getCurrentUser(): AuthUser | null {
    return activeUser ? { ...activeUser } : null;
  },
};
