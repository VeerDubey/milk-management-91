
import { User, LoginCredentials, SignupData, UserCompany } from '@/types/auth';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';

export class AuthService {
  private static readonly STORAGE_KEYS = {
    USERS: 'auth_users',
    CURRENT_USER: 'auth_current_user',
    CURRENT_COMPANY: 'auth_current_company',
    SESSION_TOKEN: 'auth_session_token',
    LOGIN_ATTEMPTS: 'auth_login_attempts'
  };

  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static initializeDefaultUsers(): void {
    const existingUsers = this.getStoredUsers();
    
    if (existingUsers.length === 0) {
      const defaultUsers: User[] = [
        {
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@vikasmilk.com',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          isEmailVerified: true,
          companies: [
            {
              id: 'company-001',
              name: 'Vikas Milk Centre',
              role: 'admin',
              permissions: ['all'],
              isDefault: true
            }
          ],
          createdAt: new Date(),
          lastLogin: null,
          loginAttempts: 0,
          isLocked: false
        },
        {
          id: 'employee-001',
          name: 'Employee User',
          email: 'employee@vikasmilk.com',
          passwordHash: bcrypt.hashSync('employee123', 10),
          role: 'employee',
          isEmailVerified: true,
          companies: [
            {
              id: 'company-001',
              name: 'Vikas Milk Centre',
              role: 'employee',
              permissions: ['read', 'write'],
              isDefault: true
            }
          ],
          createdAt: new Date(),
          lastLogin: null,
          loginAttempts: 0,
          isLocked: false
        }
      ];

      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      console.log('Default users initialized:', defaultUsers.map(u => ({ email: u.email, role: u.role })));
    }
  }

  static async login(credentials: LoginCredentials): Promise<User | null> {
    const { email, password, rememberMe } = credentials;
    
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        toast.error('Invalid email or password');
        return null;
      }

      // Check if account is locked
      if (user.isLocked && user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
        const remainingTime = Math.ceil((new Date(user.lockedUntil).getTime() - new Date().getTime()) / 60000);
        toast.error(`Account locked. Try again in ${remainingTime} minutes.`);
        return null;
      }

      // Verify password
      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
      
      if (!isPasswordValid) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
          user.isLocked = true;
          user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION).toISOString();
          toast.error('Too many failed attempts. Account locked for 15 minutes.');
        } else {
          const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - user.loginAttempts;
          toast.error(`Invalid password. ${remainingAttempts} attempts remaining.`);
        }
        
        this.updateUser(user);
        return null;
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.isLocked = false;
      user.lockedUntil = undefined;
      user.lastLogin = new Date().toISOString();

      // Create session
      const sessionToken = this.generateSessionToken();
      const sessionData = {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)), // 30 days if remember me, 1 day otherwise
        rememberMe
      };

      localStorage.setItem(this.STORAGE_KEYS.SESSION_TOKEN, JSON.stringify(sessionData));
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      
      // Set default company
      const defaultCompany = user.companies.find(c => c.isDefault) || user.companies[0];
      if (defaultCompany) {
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_COMPANY, JSON.stringify(defaultCompany));
      }

      this.updateUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return null;
    }
  }

  static async signup(data: SignupData): Promise<User | null> {
    try {
      const users = this.getStoredUsers();
      
      // Check if email already exists
      const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (existingUser) {
        toast.error('Email already registered');
        return null;
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        passwordHash: bcrypt.hashSync(data.password, 10),
        role: 'employee', // Default role
        isEmailVerified: false,
        companies: [
          {
            id: 'company-001',
            name: 'Vikas Milk Centre',
            role: 'employee',
            permissions: ['read', 'write'],
            isDefault: true
          }
        ],
        createdAt: new Date(),
        lastLogin: null,
        loginAttempts: 0,
        isLocked: false
      };

      users.push(newUser);
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

      // Send verification email (mock)
      toast.info(`Verification email sent to ${data.email}`);
      
      return newUser;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return null;
    }
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_COMPANY);
    localStorage.removeItem(this.STORAGE_KEYS.SESSION_TOKEN);
    toast.success('Logged out successfully');
  }

  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static getCurrentCompany(): UserCompany | null {
    try {
      const companyData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_COMPANY);
      return companyData ? JSON.parse(companyData) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION_TOKEN);
    if (!sessionData) return false;

    try {
      const session = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      return now < expiresAt;
    } catch {
      return false;
    }
  }

  static async switchCompany(userId: string, companyId: string): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user || user.id !== userId) return false;

      const company = user.companies.find(c => c.id === companyId);
      if (!company) return false;

      localStorage.setItem(this.STORAGE_KEYS.CURRENT_COMPANY, JSON.stringify(company));
      localStorage.setItem('last_company', companyId);
      
      toast.success(`Switched to ${company.name}`);
      return true;
    } catch (error) {
      console.error('Company switch error:', error);
      return false;
    }
  }

  private static getStoredUsers(): User[] {
    try {
      const usersData = localStorage.getItem(this.STORAGE_KEYS.USERS);
      return usersData ? JSON.parse(usersData) : [];
    } catch {
      return [];
    }
  }

  private static updateUser(user: User): void {
    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  private static generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
