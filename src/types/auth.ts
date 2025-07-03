
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'employee';
  isEmailVerified: boolean;
  companies: UserCompany[];
  createdAt: Date | string;
  lastLogin: Date | string | null;
  loginAttempts: number;
  isLocked: boolean;
  lockedUntil?: string;
  profilePicture?: string;
  phone?: string;
}

export interface UserCompany {
  id: string;
  name: string;
  logo?: string;
  role: 'owner' | 'admin' | 'manager' | 'employee';
  permissions: string[];
  isDefault: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  settings: CompanySettings;
}

export interface CompanySettings {
  currency: 'INR' | 'USD';
  timezone: string;
  dateFormat: string;
  theme: string;
}

export interface AuthSession {
  user: User;
  currentCompany: UserCompany;
  token: string;
  refreshToken: string;
  expiresAt: string;
  loginAttempts: number;
  isLocked: boolean;
  lockoutUntil?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
  captchaToken?: string;
  twoFactorCode?: string;
}

export interface SignupData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
  acceptTerms: boolean;
  captchaToken?: string;
}

export interface PasswordResetRequest {
  email: string;
  captchaToken?: string;
}

export interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export interface AuthContextType {
  user: User | null;
  currentCompany: UserCompany | null;
  companies: UserCompany[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  switchCompany: (companyId: string) => Promise<boolean>;
  resetPassword: (request: PasswordResetRequest) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  enable2FA: () => Promise<string>; // Returns QR code
  verify2FA: (code: string) => Promise<boolean>;
  checkPasswordStrength: (password: string) => PasswordStrength;
  unlockAccount: (token: string) => Promise<boolean>;
}
