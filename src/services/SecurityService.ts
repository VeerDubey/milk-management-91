import { toast } from 'sonner';
import bcrypt from 'bcryptjs';

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  resource?: string;
  description: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roleId: string;
  isActive: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil?: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SessionInfo {
  userId: string;
  username: string;
  roleId: string;
  permissions: Permission[];
  loginTime: string;
  lastActivity: string;
  sessionToken: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'success' | 'failure' | 'warning';
}

class SecurityService {
  private readonly STORAGE_PREFIX = 'erp_security_';
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.initializeDefaultRoles();
    this.initializeDefaultAdmin();
  }

  // Role Management
  getRoles(): UserRole[] {
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}roles`);
    return stored ? JSON.parse(stored) : [];
  }

  createRole(roleData: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>): UserRole {
    const roles = this.getRoles();
    const newRole: UserRole = {
      ...roleData,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    roles.push(newRole);
    localStorage.setItem(`${this.STORAGE_PREFIX}roles`, JSON.stringify(roles));
    
    this.logAction('create_role', 'security', newRole.id, null, newRole);
    toast.success(`Role "${newRole.name}" created successfully`);
    
    return newRole;
  }

  updateRole(roleId: string, updates: Partial<UserRole>): boolean {
    const roles = this.getRoles();
    const roleIndex = roles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) return false;
    
    const oldRole = { ...roles[roleIndex] };
    roles[roleIndex] = {
      ...roles[roleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`${this.STORAGE_PREFIX}roles`, JSON.stringify(roles));
    this.logAction('update_role', 'security', roleId, oldRole, roles[roleIndex]);
    
    return true;
  }

  // User Account Management
  getUsers(): UserAccount[] {
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}users`);
    return stored ? JSON.parse(stored) : [];
  }

  async createUser(userData: {
    username: string;
    email: string;
    fullName: string;
    roleId: string;
    password: string;
    mustChangePassword?: boolean;
  }): Promise<UserAccount | null> {
    const users = this.getUsers();
    
    // Check for existing username/email
    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      toast.error('Username or email already exists');
      return null;
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);
    const currentUser = this.getCurrentSession();
    
    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      roleId: userData.roleId,
      isActive: true,
      loginAttempts: 0,
      passwordHash,
      mustChangePassword: userData.mustChangePassword || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.userId || 'system'
    };

    users.push(newUser);
    localStorage.setItem(`${this.STORAGE_PREFIX}users`, JSON.stringify(users));
    
    this.logAction('create_user', 'security', newUser.id, null, { ...newUser, passwordHash: '[REDACTED]' });
    toast.success(`User "${newUser.username}" created successfully`);
    
    return newUser;
  }

  async authenticateUser(username: string, password: string): Promise<SessionInfo | null> {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.isActive);
    
    if (!user) {
      this.logAction('login_attempt', 'security', username, null, { status: 'user_not_found' });
      return null;
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      this.logAction('login_attempt', 'security', user.id, null, { status: 'account_locked' });
      toast.error('Account is temporarily locked');
      return null;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      await this.handleFailedLogin(user);
      this.logAction('login_attempt', 'security', user.id, null, { status: 'invalid_password' });
      return null;
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user.id);
    
    // Create session
    const session = this.createSession(user);
    
    this.logAction('login_success', 'security', user.id, null, { 
      sessionToken: session.sessionToken,
      loginTime: session.loginTime 
    });
    
    return session;
  }

  private async handleFailedLogin(user: UserAccount): Promise<void> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex].loginAttempts += 1;
      
      if (users[userIndex].loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        users[userIndex].lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION).toISOString();
        toast.error(`Account locked due to too many failed attempts. Try again in 30 minutes.`);
      }
      
      localStorage.setItem(`${this.STORAGE_PREFIX}users`, JSON.stringify(users));
    }
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].loginAttempts = 0;
      users[userIndex].lockedUntil = undefined;
      users[userIndex].lastLogin = new Date().toISOString();
      localStorage.setItem(`${this.STORAGE_PREFIX}users`, JSON.stringify(users));
    }
  }

  private createSession(user: UserAccount): SessionInfo {
    const roles = this.getRoles();
    const userRole = roles.find(r => r.id === user.roleId);
    
    const session: SessionInfo = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      permissions: userRole?.permissions || [],
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
    };
    
    localStorage.setItem(`${this.STORAGE_PREFIX}session`, JSON.stringify(session));
    return session;
  }

  getCurrentSession(): SessionInfo | null {
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}session`);
    if (!stored) return null;
    
    const session: SessionInfo = JSON.parse(stored);
    
    // Check session timeout
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    
    if (now.getTime() - lastActivity.getTime() > this.SESSION_TIMEOUT) {
      this.logout();
      return null;
    }
    
    // Update last activity
    session.lastActivity = now.toISOString();
    localStorage.setItem(`${this.STORAGE_PREFIX}session`, JSON.stringify(session));
    
    return session;
  }

  hasPermission(module: string, action: string, resource?: string): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;
    
    return session.permissions.some(permission => 
      permission.module === module && 
      permission.action === action &&
      (!resource || !permission.resource || permission.resource === resource)
    );
  }

  logout(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.logAction('logout', 'security', session.userId, null, { 
        sessionToken: session.sessionToken 
      });
    }
    
    localStorage.removeItem(`${this.STORAGE_PREFIX}session`);
    toast.success('Logged out successfully');
  }

  // Audit Logging
  logAction(
    action: string,
    module: string,
    resourceId?: string,
    oldValue?: any,
    newValue?: any,
    status: 'success' | 'failure' | 'warning' = 'success'
  ): void {
    const session = this.getCurrentSession();
    const logs = this.getAuditLogs();
    
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session?.userId || 'anonymous',
      username: session?.username || 'anonymous',
      action,
      module,
      resourceId,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      status,
      ipAddress: 'localhost', // In a real app, get actual IP
      userAgent: navigator.userAgent
    };
    
    logs.push(auditLog);
    
    // Keep only last 10000 logs to prevent storage bloat
    if (logs.length > 10000) {
      logs.splice(0, logs.length - 10000);
    }
    
    localStorage.setItem(`${this.STORAGE_PREFIX}audit_logs`, JSON.stringify(logs));
  }

  getAuditLogs(filter?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): AuditLog[] {
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}audit_logs`);
    let logs: AuditLog[] = stored ? JSON.parse(stored) : [];
    
    if (filter) {
      logs = logs.filter(log => {
        if (filter.userId && log.userId !== filter.userId) return false;
        if (filter.module && log.module !== filter.module) return false;
        if (filter.action && log.action !== filter.action) return false;
        if (filter.startDate && log.timestamp < filter.startDate) return false;
        if (filter.endDate && log.timestamp > filter.endDate) return false;
        return true;
      });
    }
    
    return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  // Initialize default roles and admin user
  private initializeDefaultRoles(): void {
    const roles = this.getRoles();
    
    if (roles.length === 0) {
      const defaultRoles: UserRole[] = [
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Full system access',
          permissions: this.getAllPermissions(),
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'manager',
          name: 'Manager',
          description: 'Management level access',
          permissions: this.getManagerPermissions(),
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'staff',
          name: 'Staff',
          description: 'Basic operational access',
          permissions: this.getStaffPermissions(),
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      localStorage.setItem(`${this.STORAGE_PREFIX}roles`, JSON.stringify(defaultRoles));
    }
  }

  private async initializeDefaultAdmin(): Promise<void> {
    const users = this.getUsers();
    
    if (users.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      const adminUser: UserAccount = {
        id: 'admin_default',
        username: 'admin',
        email: 'admin@vikasmilk.com',
        fullName: 'System Administrator',
        roleId: 'admin',
        isActive: true,
        loginAttempts: 0,
        passwordHash,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      };
      
      users.push(adminUser);
      localStorage.setItem(`${this.STORAGE_PREFIX}users`, JSON.stringify(users));
      
      toast.info('Default admin account created: admin / admin123 (Please change password)');
    }
  }

  private getAllPermissions(): Permission[] {
    return [
      // Dashboard
      { id: 'dashboard.view', module: 'dashboard', action: 'view', description: 'View dashboard' },
      
      // Products
      { id: 'products.view', module: 'products', action: 'view', description: 'View products' },
      { id: 'products.create', module: 'products', action: 'create', description: 'Create products' },
      { id: 'products.edit', module: 'products', action: 'edit', description: 'Edit products' },
      { id: 'products.delete', module: 'products', action: 'delete', description: 'Delete products' },
      
      // Customers
      { id: 'customers.view', module: 'customers', action: 'view', description: 'View customers' },
      { id: 'customers.create', module: 'customers', action: 'create', description: 'Create customers' },
      { id: 'customers.edit', module: 'customers', action: 'edit', description: 'Edit customers' },
      { id: 'customers.delete', module: 'customers', action: 'delete', description: 'Delete customers' },
      
      // Orders
      { id: 'orders.view', module: 'orders', action: 'view', description: 'View orders' },
      { id: 'orders.create', module: 'orders', action: 'create', description: 'Create orders' },
      { id: 'orders.edit', module: 'orders', action: 'edit', description: 'Edit orders' },
      { id: 'orders.delete', module: 'orders', action: 'delete', description: 'Delete orders' },
      
      // Payments
      { id: 'payments.view', module: 'payments', action: 'view', description: 'View payments' },
      { id: 'payments.create', module: 'payments', action: 'create', description: 'Create payments' },
      { id: 'payments.approve', module: 'payments', action: 'approve', description: 'Approve payments' },
      
      // Reports
      { id: 'reports.view', module: 'reports', action: 'view', description: 'View reports' },
      { id: 'reports.export', module: 'reports', action: 'export', description: 'Export reports' },
      
      // Security
      { id: 'security.users', module: 'security', action: 'manage_users', description: 'Manage users' },
      { id: 'security.roles', module: 'security', action: 'manage_roles', description: 'Manage roles' },
      { id: 'security.audit', module: 'security', action: 'view_audit', description: 'View audit logs' }
    ];
  }

  private getManagerPermissions(): Permission[] {
    return this.getAllPermissions().filter(p => 
      !p.id.includes('security') && !p.action.includes('delete')
    );
  }

  private getStaffPermissions(): Permission[] {
    return this.getAllPermissions().filter(p => 
      p.action === 'view' || p.action === 'create' || p.action === 'edit'
    ).filter(p => !p.module.includes('security'));
  }
}

export const securityService = new SecurityService();
