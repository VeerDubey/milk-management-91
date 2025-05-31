
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Users, Plus, Edit, Trash2, Key, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  lastLogin?: string;
}

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isActive: true
  });

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    isActive: true
  });

  // Initialize default data
  useEffect(() => {
    initializeDefaultData();
  }, []);

  const initializeDefaultData = () => {
    const defaultPermissions: Permission[] = [
      // Customer Management
      { id: 'customers.view', name: 'View Customers', description: 'View customer list and details', category: 'Customer Management' },
      { id: 'customers.create', name: 'Create Customers', description: 'Add new customers', category: 'Customer Management' },
      { id: 'customers.edit', name: 'Edit Customers', description: 'Modify customer information', category: 'Customer Management' },
      { id: 'customers.delete', name: 'Delete Customers', description: 'Remove customers from system', category: 'Customer Management' },
      
      // Product Management
      { id: 'products.view', name: 'View Products', description: 'View product list and details', category: 'Product Management' },
      { id: 'products.create', name: 'Create Products', description: 'Add new products', category: 'Product Management' },
      { id: 'products.edit', name: 'Edit Products', description: 'Modify product information', category: 'Product Management' },
      { id: 'products.delete', name: 'Delete Products', description: 'Remove products from system', category: 'Product Management' },
      
      // Order Management
      { id: 'orders.view', name: 'View Orders', description: 'View order list and details', category: 'Order Management' },
      { id: 'orders.create', name: 'Create Orders', description: 'Create new orders', category: 'Order Management' },
      { id: 'orders.edit', name: 'Edit Orders', description: 'Modify existing orders', category: 'Order Management' },
      { id: 'orders.delete', name: 'Cancel Orders', description: 'Cancel or delete orders', category: 'Order Management' },
      
      // Payment Management
      { id: 'payments.view', name: 'View Payments', description: 'View payment records', category: 'Payment Management' },
      { id: 'payments.create', name: 'Record Payments', description: 'Record new payments', category: 'Payment Management' },
      { id: 'payments.edit', name: 'Edit Payments', description: 'Modify payment records', category: 'Payment Management' },
      { id: 'payments.delete', name: 'Delete Payments', description: 'Remove payment records', category: 'Payment Management' },
      
      // Inventory Management
      { id: 'inventory.view', name: 'View Inventory', description: 'View stock levels and inventory', category: 'Inventory Management' },
      { id: 'inventory.manage', name: 'Manage Inventory', description: 'Update stock levels and manage inventory', category: 'Inventory Management' },
      
      // Reports
      { id: 'reports.sales', name: 'Sales Reports', description: 'Access sales reports and analytics', category: 'Reports' },
      { id: 'reports.financial', name: 'Financial Reports', description: 'Access financial reports', category: 'Reports' },
      { id: 'reports.inventory', name: 'Inventory Reports', description: 'Access inventory reports', category: 'Reports' },
      { id: 'reports.export', name: 'Export Reports', description: 'Export reports to PDF/Excel', category: 'Reports' },
      
      // System Administration
      { id: 'system.users', name: 'User Management', description: 'Manage system users', category: 'System Administration' },
      { id: 'system.roles', name: 'Role Management', description: 'Manage roles and permissions', category: 'System Administration' },
      { id: 'system.settings', name: 'System Settings', description: 'Configure system settings', category: 'System Administration' },
      { id: 'system.backup', name: 'Backup & Restore', description: 'Perform system backup and restore', category: 'System Administration' }
    ];

    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: defaultPermissions.map(p => p.id),
        isActive: true,
        isSystem: true,
        userCount: 1
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Management level access with reporting capabilities',
        permissions: [
          'customers.view', 'customers.create', 'customers.edit',
          'products.view', 'products.create', 'products.edit',
          'orders.view', 'orders.create', 'orders.edit',
          'payments.view', 'payments.create', 'payments.edit',
          'inventory.view', 'inventory.manage',
          'reports.sales', 'reports.financial', 'reports.inventory', 'reports.export'
        ],
        isActive: true,
        isSystem: true,
        userCount: 2
      },
      {
        id: 'staff',
        name: 'Staff',
        description: 'Basic operational access for daily tasks',
        permissions: [
          'customers.view', 'customers.create', 'customers.edit',
          'products.view',
          'orders.view', 'orders.create', 'orders.edit',
          'payments.view', 'payments.create',
          'inventory.view'
        ],
        isActive: true,
        isSystem: true,
        userCount: 5
      },
      {
        id: 'customer',
        name: 'Customer',
        description: 'Limited access for customer portal',
        permissions: [
          'orders.view'
        ],
        isActive: true,
        isSystem: true,
        userCount: 150
      }
    ];

    const defaultUsers: User[] = [
      {
        id: 'user1',
        name: 'Admin User',
        email: 'admin@vikasmilk.com',
        roleId: 'admin',
        isActive: true,
        lastLogin: new Date().toISOString()
      },
      {
        id: 'user2',
        name: 'Manager User',
        email: 'manager@vikasmilk.com',
        roleId: 'manager',
        isActive: true,
        lastLogin: new Date().toISOString()
      }
    ];

    setPermissions(defaultPermissions);
    setRoles(defaultRoles);
    setUsers(defaultUsers);
  };

  const handleSaveRole = () => {
    if (!roleFormData.name.trim()) {
      toast.error('Please enter a role name');
      return;
    }

    const roleData: Role = {
      id: editingRole?.id || `role_${Date.now()}`,
      name: roleFormData.name,
      description: roleFormData.description,
      permissions: roleFormData.permissions,
      isActive: roleFormData.isActive,
      isSystem: false,
      userCount: editingRole?.userCount || 0
    };

    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? roleData : r));
      toast.success('Role updated successfully');
    } else {
      setRoles([...roles, roleData]);
      toast.success('Role created successfully');
    }

    resetRoleForm();
  };

  const handleSaveUser = () => {
    if (!userFormData.name.trim() || !userFormData.email.trim() || !userFormData.roleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const userData: User = {
      id: editingUser?.id || `user_${Date.now()}`,
      name: userFormData.name,
      email: userFormData.email,
      roleId: userFormData.roleId,
      isActive: userFormData.isActive,
      lastLogin: editingUser?.lastLogin
    };

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? userData : u));
      toast.success('User updated successfully');
    } else {
      setUsers([...users, userData]);
      // Update role user count
      setRoles(roles.map(r => 
        r.id === userData.roleId ? { ...r, userCount: r.userCount + 1 } : r
      ));
      toast.success('User created successfully');
    }

    resetUserForm();
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
      isActive: role.isActive
    });
    setIsRoleDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      isActive: user.isActive
    });
    setIsUserDialogOpen(true);
  };

  const handleDeleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) {
      toast.error('Cannot delete system roles');
      return;
    }

    if (role && role.userCount > 0) {
      toast.error('Cannot delete role with assigned users');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== id));
      toast.success('Role deleted successfully');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const user = users.find(u => u.id === id);
      if (user) {
        setUsers(users.filter(u => u.id !== id));
        // Update role user count
        setRoles(roles.map(r => 
          r.id === user.roleId ? { ...r, userCount: Math.max(0, r.userCount - 1) } : r
        ));
        toast.success('User deleted successfully');
      }
    }
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
    setEditingRole(null);
    setIsRoleDialogOpen(false);
  };

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      roleId: '',
      isActive: true
    });
    setEditingUser(null);
    setIsUserDialogOpen(false);
  };

  const togglePermission = (permissionId: string) => {
    const newPermissions = roleFormData.permissions.includes(permissionId)
      ? roleFormData.permissions.filter(p => p !== permissionId)
      : [...roleFormData.permissions, permissionId];
    
    setRoleFormData({ ...roleFormData, permissions: newPermissions });
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold neo-noir-text">Role & Access Management</h2>
          <p className="neo-noir-text-muted">Manage user roles, permissions, and system access</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetUserForm()} className="neo-noir-button-accent">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetRoleForm()} variant="outline" className="neo-noir-button-outline">
                <Shield className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Roles Table */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Roles
          </CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Manage roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="neo-noir-table">
              <TableHeader>
                <TableRow className="neo-noir-table-header">
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} className="neo-noir-table-row">
                    <TableCell className="font-medium">
                      {role.name}
                      {role.isSystem && <Badge variant="secondary" className="ml-2">System</Badge>}
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role.userCount}</TableCell>
                    <TableCell>{role.permissions.length} permissions</TableCell>
                    <TableCell>
                      <Badge className={role.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRole(role)}
                          className="neo-noir-button-ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(role.id)}
                            className="neo-noir-button-ghost text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users
          </CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Manage user accounts and role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="neo-noir-table">
              <TableHeader>
                <TableRow className="neo-noir-table-header">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="neo-noir-table-row">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleName(user.roleId)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          className="neo-noir-button-ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          className="neo-noir-button-ghost text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="neo-noir-surface max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="neo-noir-text">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription className="neo-noir-text-muted">
              Configure role permissions and access levels
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Role Name *</Label>
                <Input
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                  placeholder="Enter role name"
                  className="neo-noir-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="neo-noir-text">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={roleFormData.isActive}
                    onCheckedChange={(checked) => setRoleFormData({...roleFormData, isActive: checked})}
                  />
                  <span className="neo-noir-text">{roleFormData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="neo-noir-text">Description</Label>
              <Input
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                placeholder="Enter role description"
                className="neo-noir-input"
              />
            </div>
            
            {/* Permissions */}
            <div className="space-y-4">
              <Label className="neo-noir-text text-lg font-medium">Permissions</Label>
              {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium neo-noir-text">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Switch
                          checked={roleFormData.permissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <div>
                          <div className="neo-noir-text text-sm">{permission.name}</div>
                          <div className="neo-noir-text-muted text-xs">{permission.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetRoleForm} className="neo-noir-button-outline">
              Cancel
            </Button>
            <Button onClick={handleSaveRole} className="neo-noir-button-accent">
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="neo-noir-surface">
          <DialogHeader>
            <DialogTitle className="neo-noir-text">
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription className="neo-noir-text-muted">
              Add or modify user account details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Full Name *</Label>
                <Input
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                  placeholder="Enter full name"
                  className="neo-noir-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="neo-noir-text">Email *</Label>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  placeholder="Enter email address"
                  className="neo-noir-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Role *</Label>
                <select
                  value={userFormData.roleId}
                  onChange={(e) => setUserFormData({...userFormData, roleId: e.target.value})}
                  className="neo-noir-input"
                >
                  <option value="">Select Role</option>
                  {roles.filter(r => r.isActive).map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="neo-noir-text">Status</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    checked={userFormData.isActive}
                    onCheckedChange={(checked) => setUserFormData({...userFormData, isActive: checked})}
                  />
                  <span className="neo-noir-text">{userFormData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUserForm} className="neo-noir-button-outline">
              Cancel
            </Button>
            <Button onClick={handleSaveUser} className="neo-noir-button-accent">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
