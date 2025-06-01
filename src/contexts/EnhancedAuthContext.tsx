
import React, { createContext, useContext, useEffect, useState } from 'react';
import bcryptjs from 'bcryptjs';
import { toast } from 'sonner';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SALT_ROUNDS = 10;

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User loaded from localStorage:', parsedUser.name);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      initializeDefaultUser();
    }
  }, []);

  const initializeDefaultUser = async (): Promise<void> => {
    try {
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      if (users.length === 0) {
        console.log('Creating default admin and employee users');
        
        // Create admin user
        const adminPasswordHash = await bcryptjs.hash('admin123', SALT_ROUNDS);
        const adminUser = {
          id: 'user_admin_default',
          name: 'Administrator',
          email: 'admin@vikasmilk.com',
          role: 'admin' as const,
          passwordHash: adminPasswordHash,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        // Create employee user
        const employeePasswordHash = await bcryptjs.hash('employee123', SALT_ROUNDS);
        const employeeUser = {
          id: 'user_employee_default',
          name: 'Employee',
          email: 'employee@vikasmilk.com',
          role: 'employee' as const,
          passwordHash: employeePasswordHash,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        users.push(adminUser, employeeUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        toast.info(
          'Default accounts created:\nAdmin: admin@vikasmilk.com / admin123\nEmployee: employee@vikasmilk.com / employee123',
          { duration: 8000 }
        );
      }
    } catch (error) {
      console.error('Error initializing default users:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersJson = localStorage.getItem('users');
      if (!usersJson) {
        await initializeDefaultUser();
        return false;
      }
      
      const users = JSON.parse(usersJson);
      const foundUser = users.find((u: any) => u.email === email && u.isActive);
      
      if (!foundUser) {
        toast.error('User not found or account is disabled');
        return false;
      }
      
      const match = await bcryptjs.compare(password, foundUser.passwordHash);
      
      if (match) {
        const userInfo: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          createdAt: foundUser.createdAt,
          isActive: foundUser.isActive
        };
        
        setUser(userInfo);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        toast.success(`Welcome back, ${userInfo.name}!`, {
          description: `Logged in as ${userInfo.role}`
        });
        
        console.log('User logged in successfully:', userInfo.name, 'Role:', userInfo.role);
        return true;
      } else {
        toast.error('Invalid password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'admin' | 'employee' = 'employee'): Promise<boolean> => {
    try {
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      if (users.some((u: any) => u.email === email)) {
        toast.error('User with this email already exists');
        return false;
      }
      
      const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS);
      
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        role,
        passwordHash,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      const userInfo: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        isActive: newUser.isActive
      };
      
      setUser(userInfo);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      
      toast.success(`Account created successfully! Welcome, ${userInfo.name}!`);
      console.log('New user signed up and logged in:', userInfo.name, 'Role:', userInfo.role);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Account creation failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    toast.info('You have been logged out');
    console.log('User logged out');
  };

  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated,
      isAdmin,
      isEmployee,
      initializeDefaultUser 
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
