
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, Users, Key, Eye, EyeOff, Lock, Unlock, UserPlus, 
  Settings, Activity, AlertTriangle, CheckCircle, XCircle 
} from 'lucide-react';
import { securityService, UserAccount, UserRole, AuditLog } from '@/services/SecurityService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function SecurityDashboard() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentSession, setCurrentSession] = useState(securityService.getCurrentSession());
  
  // Form states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    roleId: '',
    password: '',
    mustChangePassword: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(securityService.getUsers());
    setRoles(securityService.getRoles());
    setAuditLogs(securityService.getAuditLogs().slice(0, 100)); // Latest 100 logs
  };

  const handleCreateUser = async () => {
    if (!userFormData.username || !userFormData.email || !userFormData.fullName || !userFormData.roleId || !userFormData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = await securityService.createUser(userFormData);
    if (success) {
      setIsUserDialogOpen(false);
      setUserFormData({
        username: '',
        email: '',
        fullName: '',
        roleId: '',
        password: '',
        mustChangePassword: false
      });
      loadData();
    }
  };

  const toggleUserStatus = (userId: string, isActive: boolean) => {
    const users = securityService.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].isActive = isActive;
      users[userIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('erp_security_users', JSON.stringify(users));
      
      securityService.logAction(
        isActive ? 'activate_user' : 'deactivate_user',
        'security',
        userId,
        { isActive: !isActive },
        { isActive }
      );
      
      loadData();
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    }
  };

  const resetUserPassword = (userId: string) => {
    if (window.confirm('Are you sure you want to reset this user\'s password? They will need to change it on next login.')) {
      // In a real app, you'd generate a temporary password and send it via email
      toast.success('Password reset email sent to user');
      securityService.logAction('reset_password', 'security', userId);
    }
  };

  const getStatusBadge = (isActive: boolean, lockedUntil?: string) => {
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      return <Badge variant="destructive">Locked</Badge>;
    }
    return isActive ? 
      <Badge className="bg-green-500/20 text-green-400">Active</Badge> : 
      <Badge variant="secondary">Inactive</Badge>;
  };

  const getAuditStatusIcon = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neo-noir-text">Security Management</h1>
          <p className="neo-noir-text-muted">Manage users, roles, and system security</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="neo-noir-text">
            <Shield className="h-4 w-4 mr-1" />
            Current User: {currentSession?.username}
          </Badge>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-400">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-400">{users.filter(u => u.isActive).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">System Roles</p>
                <p className="text-2xl font-bold text-purple-400">{roles.length}</p>
              </div>
              <Key className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Recent Activities</p>
                <p className="text-2xl font-bold text-orange-400">{auditLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card className="neo-noir-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="neo-noir-text">System Users</CardTitle>
                  <CardDescription className="neo-noir-text-muted">
                    Manage user accounts and access levels
                  </CardDescription>
                </div>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="neo-noir-button-accent">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="neo-noir-surface">
                    <DialogHeader>
                      <DialogTitle className="neo-noir-text">Create New User</DialogTitle>
                      <DialogDescription className="neo-noir-text-muted">
                        Add a new user account to the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="neo-noir-text">Username *</Label>
                          <Input
                            value={userFormData.username}
                            onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                            className="neo-noir-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="neo-noir-text">Email *</Label>
                          <Input
                            type="email"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                            className="neo-noir-input"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="neo-noir-text">Full Name *</Label>
                        <Input
                          value={userFormData.fullName}
                          onChange={(e) => setUserFormData({...userFormData, fullName: e.target.value})}
                          className="neo-noir-input"
                        />
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
                            {roles.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="neo-noir-text">Password *</Label>
                          <Input
                            type="password"
                            value={userFormData.password}
                            onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                            className="neo-noir-input"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={userFormData.mustChangePassword}
                          onCheckedChange={(checked) => setUserFormData({...userFormData, mustChangePassword: checked})}
                        />
                        <Label className="neo-noir-text">Force password change on first login</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} className="neo-noir-button-accent">
                        Create User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="neo-noir-table">
                <TableHeader>
                  <TableRow className="neo-noir-table-header">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const role = roles.find(r => r.id === user.roleId);
                    return (
                      <TableRow key={user.id} className="neo-noir-table-row">
                        <TableCell>
                          <div>
                            <p className="font-medium neo-noir-text">{user.fullName}</p>
                            <p className="text-sm neo-noir-text-muted">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role?.name || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.isActive, user.lockedUntil)}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm') : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleUserStatus(user.id, !user.isActive)}
                              className="neo-noir-button-ghost"
                            >
                              {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => resetUserPassword(user.id)}
                              className="neo-noir-button-ghost"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles" className="space-y-6">
          <Card className="neo-noir-card">
            <CardHeader>
              <CardTitle className="neo-noir-text">System Roles</CardTitle>
              <CardDescription className="neo-noir-text-muted">
                Manage roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold neo-noir-text flex items-center gap-2">
                          {role.name}
                          {role.isSystem && <Badge variant="secondary" className="text-xs">System</Badge>}
                        </h3>
                        <p className="text-sm neo-noir-text-muted">{role.description}</p>
                      </div>
                      <Badge variant="outline" className="neo-noir-text">
                        {role.permissions.length} permissions
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 8).map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.module}.{permission.action}
                        </Badge>
                      ))}
                      {role.permissions.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="neo-noir-card">
            <CardHeader>
              <CardTitle className="neo-noir-text">System Activity Logs</CardTitle>
              <CardDescription className="neo-noir-text-muted">
                Track all system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="neo-noir-table">
                <TableHeader>
                  <TableRow className="neo-noir-table-header">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id} className="neo-noir-table-row">
                      <TableCell className="text-sm">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-medium">{log.username}</TableCell>
                      <TableCell className="capitalize">{log.action.replace('_', ' ')}</TableCell>
                      <TableCell className="capitalize">{log.module}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAuditStatusIcon(log.status)}
                          <span className="capitalize text-sm">{log.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
