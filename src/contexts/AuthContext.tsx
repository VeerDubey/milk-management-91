
import React, { createContext, useContext, useEffect, useState } from 'react';
import bcryptjs from 'bcryptjs';
import { toast } from 'sonner';

// Define types for our auth context
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  initializeDefaultUser: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Salt rounds for password hashing
const SALT_ROUNDS = 10;

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is already logged in on app load
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
      // No stored user, initialize the default user
      initializeDefaultUser();
    }
  }, []);

  // Initialize default user if none exists
  const initializeDefaultUser = async (): Promise<void> => {
    try {
      // Check if users store exists
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // If no users, create a default admin user
      if (users.length === 0) {
        console.log('Creating default admin user');
        const passwordHash = await bcryptjs.hash('admin123', SALT_ROUNDS);
        
        const defaultUser = {
          id: 'user_default_admin',
          name: 'Administrator',
          email: 'admin@example.com',
          passwordHash
        };
        
        users.push(defaultUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        toast.info(
          'Default admin account created. Email: admin@example.com / Password: admin123',
          { duration: 6000 }
        );
      }
    } catch (error) {
      console.error('Error initializing default user:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from local storage
      const usersJson = localStorage.getItem('users');
      if (!usersJson) {
        await initializeDefaultUser();
        return false;
      }
      
      const users = JSON.parse(usersJson);
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) return false;
      
      // Compare password hash
      const match = await bcryptjs.compare(password, foundUser.passwordHash);
      
      if (match) {
        // Store user info but not the password
        const userInfo = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email
        };
        
        setUser(userInfo);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        console.log('User logged in successfully:', userInfo.name);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if users store exists
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        return false;
      }
      
      // Hash password
      const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS);
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        passwordHash
      };
      
      // Add to users list
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Auto login after signup
      const userInfo = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };
      
      setUser(userInfo);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      console.log('New user signed up and logged in:', userInfo.name);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    console.log('User logged out');
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated, 
      initializeDefaultUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
