import bcrypt from 'bcryptjs';
import { toast } from 'sonner';
import { 
  User, 
  AuthSession, 
  LoginCredentials, 
  SignupData, 
  PasswordResetRequest,
  UserCompany,
  Company 
} from '@/types/auth';
import { checkPasswordStrength } from '@/utils/passwordStrength';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours

  static async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Check for account lockout first
      if (this.isAccountLocked(credentials.email)) {
        toast.error('Account temporarily locked due to too many failed attempts');
        return null;
      }

      const users = this.getUsers();
      const user = users.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase() && 
        u.isActive
      );

      if (!user) {
        this.recordLoginAttempt(credentials.email, false);
        toast.error('Invalid email or password');
        return null;
      }

      // Check email verification
      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in');
        return null;
      }

      const passwordHashes = this.getPasswordHashes();
      const storedHash = passwordHashes[user.id];

      if (!storedHash) {
        toast.error('Authentication error');
        return null;
      }

      const isValid = await bcrypt.compare(credentials.password, storedHash);

      if (!isValid) {
        this.recordLoginAttempt(credentials.email, false);
        toast.error('Invalid email or password');
        return null;
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled && !credentials.twoFactorCode) {
        toast.info('Two-factor authentication required');
        return null; // Frontend should show 2FA input
      }

      if (user.twoFactorEnabled && credentials.twoFactorCode) {
        const isValid2FA = this.verify2FACode(user.id, credentials.twoFactorCode);
        if (!isValid2FA) {
          toast.error('Invalid 2FA code');
          return null;
        }
      }

      // Successful login
      this.recordLoginAttempt(credentials.email, true);
      user.lastLogin = new Date().toISOString();
      this.updateUser(user);

      // Create session
      this.createSession(user, credentials.rememberMe);

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
      const users = this.getUsers();
      
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        toast.error('User with this email already exists');
        return null;
      }

      // Validate password strength
      const passwordStrength = checkPasswordStrength(data.password);
      if (!passwordStrength.isValid) {
        toast.error('Password does not meet security requirements');
        return null;
      }

      const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);
      
      // Create default company if provided
      let companies: UserCompany[] = [];
      if (data.companyName) {
        const companyId = `company_${Date.now()}`;
        const company: Company = {
          id: companyId,
          name: data.companyName,
          address: '',
          phone: data.phone || '',
          email: data.email,
          settings: {
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            dateFormat: 'DD/MM/YYYY',
            theme: 'light'
          }
        };
        
        this.saveCompany(company);
        
        companies.push({
          id: companyId,
          name: data.companyName,
          role: 'owner',
          permissions: ['*'],
          isDefault: true
        });
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        email: data.email,
        role: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true,
        emailVerified: false, // Require email verification
        twoFactorEnabled: false,
        companies,
        phone: data.phone
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Store password hash
      const passwordHashes = this.getPasswordHashes();
      passwordHashes[newUser.id] = passwordHash;
      localStorage.setItem('password_hashes', JSON.stringify(passwordHashes));

      // Send verification email (mock)
      this.sendVerificationEmail(newUser);

      toast.success('Account created! Please check your email to verify your account.');
      return newUser;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Account creation failed. Please try again.');
      return null;
    }
  }

  static async switchCompany(userId: string, companyId: string): Promise<boolean> {
    try {
      const user = this.getUsers().find(u => u.id === userId);
      if (!user) return false;

      const company = user.companies.find(c => c.id === companyId);
      if (!company) {
        toast.error('Access denied to this company');
        return false;
      }

      // Update session with new company
      const session = this.getSession();
      if (session) {
        session.currentCompany = company;
        localStorage.setItem('auth_session', JSON.stringify(session));
        localStorage.setItem('last_company', companyId);
        
        toast.success(`Switched to ${company.name}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Company switch error:', error);
      toast.error('Failed to switch company');
      return false;
    }
  }

  private static createSession(user: User, rememberMe: boolean): void {
    const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : this.SESSION_DURATION; // 30 days if remember me
    const expiresAt = new Date(Date.now() + duration).toISOString();
    
    const defaultCompany = user.companies.find(c => c.isDefault) || user.companies[0];
    
    const session: AuthSession = {
      user,
      currentCompany: defaultCompany,
      token: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt,
      loginAttempts: 0,
      isLocked: false
    };

    localStorage.setItem('auth_session', JSON.stringify(session));
    if (defaultCompany) {
      localStorage.setItem('last_company', defaultCompany.id);
    }
  }

  private static generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getUsers(): User[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  private static getPasswordHashes(): Record<string, string> {
    return JSON.parse(localStorage.getItem('password_hashes') || '{}');
  }

  private static updateUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  private static saveCompany(company: Company): void {
    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    companies.push(company);
    localStorage.setItem('companies', JSON.stringify(companies));
  }

  private static getSession(): AuthSession | null {
    const sessionData = localStorage.getItem('auth_session');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  private static recordLoginAttempt(email: string, success: boolean): void {
    const attempts = JSON.parse(localStorage.getItem('login_attempts') || '[]');
    attempts.push({
      email: email.toLowerCase(),
      timestamp: Date.now(),
      success
    });

    // Keep only last 1000 attempts
    if (attempts.length > 1000) {
      attempts.splice(0, attempts.length - 1000);
    }

    localStorage.setItem('login_attempts', JSON.stringify(attempts));
  }

  private static isAccountLocked(email: string): boolean {
    const attempts = JSON.parse(localStorage.getItem('login_attempts') || '[]');
    const recentFailedAttempts = attempts.filter((attempt: any) => 
      attempt.email === email.toLowerCase() && 
      !attempt.success && 
      Date.now() - attempt.timestamp < this.LOCKOUT_DURATION
    );

    return recentFailedAttempts.length >= this.MAX_LOGIN_ATTEMPTS;
  }

  private static sendVerificationEmail(user: User): void {
    // Mock email verification - in real app, this would send an actual email
    const verificationToken = this.generateToken();
    const verificationTokens = JSON.parse(localStorage.getItem('verification_tokens') || '{}');
    verificationTokens[verificationToken] = {
      userId: user.id,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem('verification_tokens', JSON.stringify(verificationTokens));
    
    console.log(`Verification email sent to ${user.email} with token: ${verificationToken}`);
  }

  private static verify2FACode(userId: string, code: string): boolean {
    // Mock 2FA verification - in real app, this would verify against TOTP
    return code === '123456'; // Demo code
  }

  static logout(): void {
    localStorage.removeItem('auth_session');
    localStorage.removeItem('last_company');
    toast.info('You have been logged out');
  }

  static getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  static getCurrentCompany(): UserCompany | null {
    const session = this.getSession();
    return session?.currentCompany || null;
  }

  static isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    return new Date(session.expiresAt) > new Date();
  }

  static initializeDefaultUsers(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      console.log('Creating default users with enhanced features...');
      
      // Create default companies
      const companies = [
        {
          id: 'company_main',
          name: 'Vikas Milk Centre - Main',
          address: 'Mumbai, Maharashtra',
          phone: '+91 98765 43210',
          email: 'admin@vikasmilk.com',
          settings: {
            currency: 'INR' as const,
            timezone: 'Asia/Kolkata',
            dateFormat: 'DD/MM/YYYY',
            theme: 'light'
          }
        },
        {
          id: 'company_branch',
          name: 'Vikas Milk Centre - Pune Branch',
          address: 'Pune, Maharashtra', 
          phone: '+91 98765 43211',
          email: 'pune@vikasmilk.com',
          settings: {
            currency: 'INR' as const,
            timezone: 'Asia/Kolkata',
            dateFormat: 'DD/MM/YYYY',
            theme: 'light'
          }
        }
      ];

      localStorage.setItem('companies', JSON.stringify(companies));

      this.signup({
        name: 'Administrator',
        email: 'admin@vikasmilk.com',
        password: 'Admin@123',
        confirmPassword: 'Admin@123',
        phone: '+91 98765 43210',
        companyName: 'Vikas Milk Centre - Main',
        acceptTerms: true
      });
    }
  }
}
