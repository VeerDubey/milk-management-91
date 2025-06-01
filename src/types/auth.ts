
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: string;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: 'admin' | 'employee') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  initializeDefaultUser: () => Promise<void>;
}
