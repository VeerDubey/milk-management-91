
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function UserAccess() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">User Access Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Access</CardTitle>
          <CardDescription>Manage user access and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg">Users</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Admin User</p>
                    <p className="text-sm text-muted-foreground">admin@example.com</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Sales Manager</p>
                    <p className="text-sm text-muted-foreground">sales@example.com</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Inventory Staff</p>
                    <p className="text-sm text-muted-foreground">inventory@example.com</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg">Access Control</h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="sales-access" />
                    <Label htmlFor="sales-access">Sales Module</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="inventory-access" defaultChecked />
                    <Label htmlFor="inventory-access">Inventory Module</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="customer-access" defaultChecked />
                    <Label htmlFor="customer-access">Customer Module</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="settings-access" />
                    <Label htmlFor="settings-access">Settings Module</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="reports-access" defaultChecked />
                    <Label htmlFor="reports-access">Reports Module</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="finances-access" />
                    <Label htmlFor="finances-access">Finance Module</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
