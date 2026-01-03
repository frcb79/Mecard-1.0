
import { UserRole, UserStatus } from '../types';

interface AuthSession {
  token: string;
  role: UserRole;
  userId: string;
  schoolId?: string;
}

export class AuthService {
  private static readonly STORAGE_SESSION_KEY = 'mecard_active_session';

  /**
   * Simula el login real validando roles
   */
  static async login(email: string, role: UserRole): Promise<AuthSession> {
    const session: AuthSession = {
      token: `jwt_${Math.random().toString(36).substr(2)}`,
      role: role,
      userId: `user_${Date.now()}`,
      schoolId: role === UserRole.SUPER_ADMIN ? undefined : 'mx_01'
    };
    
    localStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(session));
    return session;
  }

  static getActiveSession(): AuthSession | null {
    const saved = localStorage.getItem(this.STORAGE_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static logout() {
    localStorage.removeItem(this.STORAGE_SESSION_KEY);
  }
}
