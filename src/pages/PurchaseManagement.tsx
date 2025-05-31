
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PurchaseTracker } from '@/components/purchase/PurchaseTracker';
import { PurchaseEntryForm } from '@/components/purchase/PurchaseEntryForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, CreditCard, Building } from 'lucide-react';

export default function PurchaseManagement() {
  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold neo-noir-gradient-text">
              Purchase Management
            </h1>
            <p className="neo-noir-text-muted">
              Complete purchase tracking with automatic payment and balance management
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Total Purchases</p>
                  <p className="text-2xl font-bold text-blue-400">₹2,45,000</p>
                </div>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-400">₹2,15,000</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-400">₹30,000</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Active Suppliers</p>
                  <p className="text-2xl font-bold text-accent-color">8</p>
                </div>
                <Building className="h-8 w-8 text-accent-color" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 neo-noir-surface">
            <TabsTrigger value="tracker" className="neo-noir-text">Purchase Tracker</TabsTrigger>
            <TabsTrigger value="entry" className="neo-noir-text">New Purchase Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker" className="space-y-6">
            <PurchaseTracker />
          </TabsContent>
          
          <TabsContent value="entry" className="space-y-6">
            <PurchaseEntryForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
