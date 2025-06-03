import bcrypt from 'bcryptjs';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'delivery_staff' | 'billing_clerk' | 'viewer';
  centerId: string;
  permissions: string[];
  lastLogin?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
}

export class EnhancedAuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: UserProfile['role'];
    centerId: string;
    permissions?: string[];
  }): Promise<UserProfile | null> {
    try {
      const users = this.getUsers();
      
      if (users.find(u => u.email === userData.email)) {
        toast.error('User with this email already exists');
        return null;
      }

      const passwordHash = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
      
      const newUser: UserProfile = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        centerId: userData.centerId,
        permissions: userData.permissions || this.getDefaultPermissions(userData.role),
        isActive: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Store password hash separately for security
      const passwordHashes = JSON.parse(localStorage.getItem('password_hashes') || '{}');
      passwordHashes[newUser.id] = passwordHash;
      localStorage.setItem('password_hashes', JSON.stringify(passwordHashes));

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      return null;
    }
  }

  static async authenticateUser(email: string, password: string): Promise<UserProfile | null> {
    try {
      // Check for too many failed attempts
      if (this.isAccountLocked(email)) {
        toast.error('Account temporarily locked due to too many failed attempts');
        return null;
      }

      const users = this.getUsers();
      const user = users.find(u => u.email === email && u.isActive);

      if (!user) {
        this.recordLoginAttempt(email, false);
        toast.error('Invalid email or password');
        return null;
      }

      const passwordHashes = JSON.parse(localStorage.getItem('password_hashes') || '{}');
      const storedHash = passwordHashes[user.id];

      if (!storedHash) {
        toast.error('Authentication error');
        return null;
      }

      const isValid = await bcrypt.compare(password, storedHash);

      if (isValid) {
        this.recordLoginAttempt(email, true);
        user.lastLogin = new Date().toISOString();
        this.updateUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return user;
      } else {
        this.recordLoginAttempt(email, false);
        toast.error('Invalid email or password');
        return null;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed');
      return null;
    }
  }

  private static getUsers(): UserProfile[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  private static updateUser(user: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  private static recordLoginAttempt(email: string, success: boolean): void {
    const attempts = JSON.parse(localStorage.getItem('login_attempts') || '[]');
    attempts.push({
      email,
      timestamp: Date.now(),
      success
    });

    // Keep only last 100 attempts
    if (attempts.length > 100) {
      attempts.splice(0, attempts.length - 100);
    }

    localStorage.setItem('login_attempts', JSON.stringify(attempts));
  }

  private static isAccountLocked(email: string): boolean {
    const attempts = JSON.parse(localStorage.getItem('login_attempts') || '[]');
    const recentAttempts = attempts.filter((attempt: LoginAttempt) => 
      attempt.email === email && 
      !attempt.success && 
      Date.now() - attempt.timestamp < this.LOCKOUT_DURATION
    );

    return recentAttempts.length >= this.MAX_LOGIN_ATTEMPTS;
  }

  private static getDefaultPermissions(role: UserProfile['role']): string[] {
    const permissions: Record<UserProfile['role'], string[]> = {
      super_admin: ['*'],
      admin: ['create', 'read', 'update', 'delete', 'manage_users', 'view_analytics'],
      manager: ['create', 'read', 'update', 'view_analytics', 'manage_inventory'],
      delivery_staff: ['read', 'update_delivery', 'view_routes'],
      billing_clerk: ['read', 'create_invoice', 'update_payment', 'view_billing'],
      viewer: ['read']
    };

    return permissions[role] || ['read'];
  }

  static hasPermission(user: UserProfile, permission: string): boolean {
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const passwordHashes = JSON.parse(localStorage.getItem('password_hashes') || '{}');
      const currentHash = passwordHashes[userId];

      if (!currentHash) {
        toast.error('User not found');
        return false;
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, currentHash);
      if (!isCurrentValid) {
        toast.error('Current password is incorrect');
        return false;
      }

      const newHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      passwordHashes[userId] = newHash;
      localStorage.setItem('password_hashes', JSON.stringify(passwordHashes));

      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
      return false;
    }
  }

  static initializeDefaultUsers(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      console.log('Creating default users...');
      this.createUser({
        name: 'Super Administrator',
        email: 'superadmin@vikasmilk.com',
        password: 'SuperAdmin@123',
        role: 'super_admin',
        centerId: 'main'
      });
    }
  }
}
