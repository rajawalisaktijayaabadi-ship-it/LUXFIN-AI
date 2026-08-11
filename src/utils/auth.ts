import { UserProfile, AuthSession, OnboardingFinancialContext, LicenseStatus } from '../types';
import { storage } from './storage';

const USERS_DB_KEY = 'luxfin_users_db_v1';
const SESSION_KEY = 'luxfin_active_session_v1';
const SESSIONS_LIST_KEY = 'luxfin_user_sessions_v1';

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

// Initial demo user
const DEFAULT_DEMO_USER: StoredUser = {
  id: 'usr_fitri_001',
  name: 'Fitri Handayani',
  email: 'fitrihandayani.cloud99@gmail.com',
  passwordHash: 'password123',
  phone: '+62 812-3456-7890',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'ADMIN',
  licenseKey: 'LUX-VIP-2026-8899',
  licenseStatus: 'ACTIVE',
  licensePlan: 'VIP_LIFETIME',
  registeredAt: '2026-01-15',
  preferredCurrency: 'IDR',
  locale: 'id-ID',
  securityPin: '123456',
  twoFactorEnabled: false,
  isEmailVerified: true,
  financialContext: {
    monthlyIncomeRange: '10m-25m',
    mainGoal: 'EMERGENCY_FUND',
    typicalExpenses: 8500000,
    existingDebt: 15000000,
    emergencyFundStatus: '3-6_MONTHS',
    preferredSavingsTarget: 3000000,
    completedAt: '2026-01-15T10:00:00Z',
  },
};

const EXTRA_SEED_USERS: StoredUser[] = [
  {
    id: 'usr_budi_002',
    name: 'Budi Santoso',
    email: 'budi.santoso@company.co.id',
    passwordHash: 'pass1234',
    phone: '+62 811-2233-4455',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'USER',
    licenseKey: 'LUX-ANNUAL-2026-9922',
    licenseStatus: 'ACTIVE',
    licensePlan: 'PREMIUM_ANNUAL',
    registeredAt: '2026-02-10',
    preferredCurrency: 'IDR',
    locale: 'id-ID',
    isEmailVerified: true,
  },
  {
    id: 'usr_siti_003',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@luxmail.id',
    passwordHash: 'sitiPass2026',
    phone: '+62 856-7890-1234',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'USER',
    licenseKey: 'LUX-PRO-EXPIRED-9900',
    licenseStatus: 'EXPIRED',
    licensePlan: 'PRO_MONTHLY',
    registeredAt: '2026-01-01',
    preferredCurrency: 'IDR',
    locale: 'id-ID',
    isEmailVerified: true,
  },
  {
    id: 'usr_susp_004',
    name: 'Rudi Hermawan',
    email: 'bad.actor@luxfin.ai',
    passwordHash: 'susp12345',
    phone: '+62 813-9988-7766',
    role: 'USER',
    licenseKey: 'LUX-VIP-SUSPENDED-1122',
    licenseStatus: 'SUSPENDED',
    licensePlan: 'VIP_LIFETIME',
    registeredAt: '2026-03-01',
    preferredCurrency: 'IDR',
    locale: 'id-ID',
    isEmailVerified: false,
  },
];

class AuthManager {
  private users: StoredUser[] = [];
  private activeSession: AuthSession | null = null;
  private pendingResetCodes: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    try {
      const storedUsers = localStorage.getItem(USERS_DB_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        // Ensure extra seed users exist for testing
        for (const seed of EXTRA_SEED_USERS) {
          if (!this.users.some((u) => u.id === seed.id || u.email === seed.email)) {
            this.users.push(seed);
          }
        }
        // Ensure default demo user has ADMIN role
        const demo = this.users.find((u) => u.id === DEFAULT_DEMO_USER.id || u.email === DEFAULT_DEMO_USER.email);
        if (demo) {
          demo.role = 'ADMIN';
        }
      } else {
        this.users = [DEFAULT_DEMO_USER, ...EXTRA_SEED_USERS];
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(this.users));
      }

      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const parsed: AuthSession = JSON.parse(storedSession);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          this.activeSession = parsed;
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to init AuthManager:', e);
      this.users = [DEFAULT_DEMO_USER, ...EXTRA_SEED_USERS];
    }
  }

  public getAllUsers(): UserProfile[] {
    return this.users.map(({ passwordHash, ...user }) => user);
  }

  public suspendUser(userId: string, reason?: string): { success: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan.' };
    
    user.licenseStatus = 'SUSPENDED';
    this.saveUsers();
    storage.addAuditLog('ADMIN_SUSPEND_USER', `Pengguna ${user.email} (ID: ${user.id}) telah dibekukan. Alasan: ${reason || 'Tindakan Admin'}`);
    return { success: true, message: `Akses pengguna ${user.name} berhasil dibekukan.` };
  }

  public activateUser(userId: string): { success: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan.' };
    
    user.licenseStatus = 'ACTIVE';
    this.saveUsers();
    storage.addAuditLog('ADMIN_ACTIVATE_USER', `Akses pengguna ${user.email} diaktifkan kembali oleh Admin.`);
    return { success: true, message: `Akses pengguna ${user.name} berhasil diaktifkan kembali.` };
  }

  public revokeUserAccess(userId: string, reason?: string): { success: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan.' };
    
    user.licenseStatus = 'REVOKED';
    this.saveUsers();
    storage.addAuditLog('ADMIN_REVOKE_USER', `Akses pengguna ${user.email} dicabut secara permanen. Alasan: ${reason || 'Pelanggaran Ketentuan'}`);
    return { success: true, message: `Akses pengguna ${user.name} telah dicabut secara permanen.` };
  }

  public updateUserRole(userId: string, newRole: 'ADMIN' | 'USER'): { success: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan.' };
    
    user.role = newRole;
    this.saveUsers();
    storage.addAuditLog('ADMIN_CHANGE_ROLE', `Peran pengguna ${user.email} diubah menjadi ${newRole}`);
    return { success: true, message: `Peran ${user.name} diperbarui menjadi ${newRole}.` };
  }

  private saveUsers() {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(this.users));
  }

  private saveSession(session: AuthSession | null) {
    this.activeSession = session;
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  public getActiveSession(): AuthSession | null {
    if (this.activeSession) {
      if (new Date(this.activeSession.expiresAt).getTime() <= Date.now()) {
        this.logout();
        return null;
      }
    }
    return this.activeSession;
  }

  public isAuthenticated(): boolean {
    return this.getActiveSession() !== null;
  }

  public getCurrentUser(): UserProfile | null {
    const session = this.getActiveSession();
    if (!session) return null;
    const user = this.users.find((u) => u.id === session.userId);
    if (!user) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async login(email: string, passwordHash: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    // Simulate network latency
    await new Promise((res) => setTimeout(res, 800));

    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'Email tidak terdaftar.' };
    }

    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Kata sandi tidak cocok.' };
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const session: AuthSession = {
      sessionId,
      userId: user.id,
      token: `jwt_simulated_${Date.now()}`,
      loginAt: new Date().toISOString(),
      expiresAt,
      deviceName: 'Chrome Mobile (Web App)',
      ipAddress: '182.253.14.92',
      isCurrent: true,
    };

    this.saveSession(session);
    this.addSessionToList(session);

    // Sync storage user profile
    storage.updateUserProfile({
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      licenseKey: user.licenseKey,
      licenseStatus: user.licenseStatus,
      licensePlan: user.licensePlan,
    });

    storage.addAuditLog('AUTH_LOGIN', `Pengguna ${user.email} berhasil masuk.`);

    const { passwordHash: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }

  public async loginWithGoogle(googleUser: { name: string; email: string; avatarUrl?: string }): Promise<{ success: boolean; user: UserProfile }> {
    await new Promise((res) => setTimeout(res, 900));

    let user = this.users.find((u) => u.email.toLowerCase() === googleUser.email.toLowerCase());

    if (!user) {
      const newUserId = `usr_g_${Date.now()}`;
      user = {
        id: newUserId,
        name: googleUser.name,
        email: googleUser.email,
        passwordHash: 'google_oauth_provider',
        avatarUrl: googleUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        licenseKey: `LUX-FREE-${Math.floor(1000 + Math.random() * 9000)}`,
        licenseStatus: 'ACTIVE',
        licensePlan: 'DEMO',
        registeredAt: new Date().toISOString().split('T')[0],
        preferredCurrency: 'IDR',
        locale: 'id-ID',
        isEmailVerified: true,
        twoFactorEnabled: false,
      };
      this.users.push(user);
      this.saveUsers();
    }

    const session: AuthSession = {
      sessionId: `sess_g_${Date.now()}`,
      userId: user.id,
      token: `jwt_google_${Date.now()}`,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deviceName: 'Google OAuth Account',
      ipAddress: '182.253.14.92',
      isCurrent: true,
    };

    this.saveSession(session);
    this.addSessionToList(session);

    storage.updateUserProfile({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });

    storage.addAuditLog('AUTH_GOOGLE', `Pengguna ${user.email} masuk via Google Auth.`);

    const { passwordHash: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }

  public async register(params: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    await new Promise((res) => setTimeout(res, 900));

    const cleanEmail = params.email.trim().toLowerCase();

    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email sudah terdaftar. Silakan login.' };
    }

    const newUserId = `usr_${Date.now()}`;
    const newUser: StoredUser = {
      id: newUserId,
      name: params.name,
      email: cleanEmail,
      passwordHash: params.passwordHash,
      phone: params.phone,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      licenseKey: `LUX-FREE-${Math.floor(1000 + Math.random() * 9000)}`,
      licenseStatus: 'ACTIVE',
      licensePlan: 'DEMO',
      registeredAt: new Date().toISOString().split('T')[0],
      preferredCurrency: 'IDR',
      locale: 'id-ID',
      isEmailVerified: false,
      twoFactorEnabled: false,
    };

    this.users.push(newUser);
    this.saveUsers();

    // Auto login
    const loginRes = await this.login(cleanEmail, params.passwordHash);
    storage.addAuditLog('AUTH_REGISTER', `Pendaftaran pengguna baru: ${cleanEmail}`);

    return loginRes;
  }

  public async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string; code?: string }> {
    await new Promise((res) => setTimeout(res, 700));

    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'Email tidak ditemukan.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    this.pendingResetCodes.set(cleanEmail, { code, expiresAt });

    storage.addAuditLog('AUTH_FORGOT_PASS', `Kode reset kata sandi diminta untuk ${cleanEmail}`);

    return { success: true, code }; // Return code for simulation display
  }

  public async verifyResetCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((res) => setTimeout(res, 500));

    const cleanEmail = email.trim().toLowerCase();
    const pending = this.pendingResetCodes.get(cleanEmail);

    if (!pending) {
      return { success: false, error: 'Kode reset tidak ditemukan atau belum diminta.' };
    }

    if (Date.now() > pending.expiresAt) {
      this.pendingResetCodes.delete(cleanEmail);
      return { success: false, error: 'Kode reset sudah kadaluarsa. Minta kode baru.' };
    }

    if (pending.code !== code.trim()) {
      return { success: false, error: 'Kode verifikasi salah.' };
    }

    return { success: true };
  }

  public async resetPassword(email: string, code: string, newPasswordHash: string): Promise<{ success: boolean; error?: string }> {
    const verifyRes = await this.verifyResetCode(email, code);
    if (!verifyRes.success) return verifyRes;

    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    user.passwordHash = newPasswordHash;
    this.saveUsers();
    this.pendingResetCodes.delete(cleanEmail);

    storage.addAuditLog('AUTH_RESET_PASS', `Kata sandi diperbarui untuk ${cleanEmail}`);

    return { success: true };
  }

  public logout(): void {
    const session = this.activeSession;
    if (session) {
      storage.addAuditLog('AUTH_LOGOUT', `Pengguna keluar dari sesi ${session.sessionId}`);
    }
    this.saveSession(null);
  }

  public updateFinancialContext(context: OnboardingFinancialContext): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const storedUser = this.users.find((u) => u.id === user.id);
    if (storedUser) {
      storedUser.financialContext = {
        ...storedUser.financialContext,
        ...context,
        completedAt: new Date().toISOString(),
      };
      this.saveUsers();
    }
  }

  public updateProfileDetails(details: Partial<UserProfile>): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const storedUser = this.users.find((u) => u.id === currentUser.id);
    if (storedUser) {
      Object.assign(storedUser, details);
      this.saveUsers();
      storage.updateUserProfile(details);
    }
  }

  public setSecurityPin(pin: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const storedUser = this.users.find((u) => u.id === currentUser.id);
    if (storedUser) {
      storedUser.securityPin = pin;
      this.saveUsers();
    }
  }

  public verifySecurityPin(pin: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const storedUser = this.users.find((u) => u.id === currentUser.id);
    return storedUser?.securityPin === pin;
  }

  public toggle2FA(enabled: boolean): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const storedUser = this.users.find((u) => u.id === currentUser.id);
    if (storedUser) {
      storedUser.twoFactorEnabled = enabled;
      this.saveUsers();
    }
  }

  // Session list management
  private addSessionToList(session: AuthSession): void {
    try {
      const list = this.getSessionsList();
      const updated = [session, ...list.filter((s) => s.sessionId !== session.sessionId)];
      localStorage.setItem(SESSIONS_LIST_KEY, JSON.stringify(updated.slice(0, 5)));
    } catch (e) {
      console.error(e);
    }
  }

  public getSessionsList(): AuthSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_LIST_KEY);
      if (data) {
        const parsed: AuthSession[] = JSON.parse(data);
        const currentSessId = this.activeSession?.sessionId;
        return parsed.map((s) => ({ ...s, isCurrent: s.sessionId === currentSessId }));
      }
    } catch (e) {
      console.error(e);
    }

    if (this.activeSession) {
      return [{ ...this.activeSession, isCurrent: true }];
    }
    return [];
  }

  public revokeSession(sessionId: string): void {
    try {
      const list = this.getSessionsList().filter((s) => s.sessionId !== sessionId);
      localStorage.setItem(SESSIONS_LIST_KEY, JSON.stringify(list));
      if (this.activeSession?.sessionId === sessionId) {
        this.logout();
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export const auth = new AuthManager();
