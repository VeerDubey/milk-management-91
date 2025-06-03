
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  User, 
  AuthContextType, 
  LoginCredentials, 
  SignupData, 
  PasswordResetRequest,
  UserCompany,
  PasswordStrength 
} from '@/types/auth';
import { AuthService } from '@/services/auth/AuthService';
import { checkPasswordStrength } from '@/utils/passwordStrength';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<UserCompany | null>(null);
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      AuthService.initializeDefaultUsers();
      
      const currentUser = AuthService.getCurrentUser();
      const currentComp = AuthService.getCurrentCompany();
      
      if (currentUser && AuthService.isAuthenticated()) {
        setUser(currentUser);
        setCurrentCompany(currentComp);
        setCompanies(currentUser.companies);
        setIsAuthenticated(true);
        console.log('User restored from session:', currentUser.name);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const loggedInUser = await AuthService.login(credentials);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        setCompanies(loggedInUser.companies);
        setIsAuthenticated(true);
        
        // Set current company (last used or default)
        const lastCompanyId = localStorage.getItem('last_company');
        const targetCompany = lastCompanyId 
          ? loggedInUser.companies.find(c => c.id === lastCompanyId)
          : loggedInUser.companies.find(c => c.isDefault) || loggedInUser.companies[0];
        
        if (targetCompany) {
          setCurrentCompany(targetCompany);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const newUser = await AuthService.signup(data);
      return !!newUser;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setCurrentCompany(null);
    setCompanies([]);
    setIsAuthenticated(false);
  };

  const switchCompany = async (companyId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await AuthService.switchCompany(user.id, companyId);
      
      if (success) {
        const newCurrentCompany = user.companies.find(c => c.id === companyId);
        if (newCurrentCompany) {
          setCurrentCompany(newCurrentCompany);
          // Trigger a re-render of the entire app to update company-specific data
          window.dispatchEvent(new CustomEvent('company-switched', { 
            detail: { companyId, company: newCurrentCompany } 
          }));
        }
      }
      
      return success;
    } catch (error) {
      console.error('Company switch error:', error);
      toast.error('Failed to switch company');
      return false;
    }
  };

  const resetPassword = async (request: PasswordResetRequest): Promise<boolean> => {
    // Mock implementation - in real app, this would trigger password reset email
    toast.info('Password reset instructions sent to your email');
    return true;
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    // Mock implementation - in real app, this would verify the token
    toast.success('Email verified successfully!');
    return true;
  };

  const resendVerification = async (): Promise<boolean> => {
    // Mock implementation
    toast.info('Verification email sent!');
    return true;
  };

  const enable2FA = async (): Promise<string> => {
    // Mock implementation - return QR code data
    toast.success('2FA enabled successfully!');
    return 'mock-qr-code-data';
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    // Mock implementation
    return code === '123456';
  };

  const checkPasswordStrengthWrapper = (password: string): PasswordStrength => {
    return checkPasswordStrength(password);
  };

  const unlockAccount = async (token: string): Promise<boolean> => {
    // Mock implementation
    toast.success('Account unlocked successfully!');
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      currentCompany,
      companies,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      switchCompany,
      resetPassword,
      verifyEmail,
      resendVerification,
      enable2FA,
      verify2FA,
      checkPasswordStrength: checkPasswordStrengthWrapper,
      unlockAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};
