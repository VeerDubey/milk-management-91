
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DataBackupRestore } from "@/components/settings/DataBackupRestore";
import UISettings from './UISettings';
import { StorageStatus } from '@/components/settings/StorageStatus';
import { useData } from '@/contexts/data/DataContext';
import { User, Palette, Mail, BellRing } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set application preferences.
        </p>
      </div>
      
      <Tabs defaultValue="ui" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ui" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>UI Settings</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Data & Backup</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ui">
          <UISettings />
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  Administrator
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  admin@example.com
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/company-profile')}>
                Update Company Profile
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  This will permanently delete your account and remove all data associated with it.
                  This action cannot be undone.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-notifications">Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new orders.
                  </p>
                </div>
                <Switch id="order-notifications" checked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-notifications">Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new payments.
                  </p>
                </div>
                <Switch id="payment-notifications" checked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="invoice-notifications">Invoice Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new invoices.
                  </p>
                </div>
                <Switch id="invoice-notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-4">
          <DataBackupRestore />
          <StorageStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
