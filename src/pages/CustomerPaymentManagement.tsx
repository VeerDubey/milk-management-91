
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentTracker } from '@/components/payment/PaymentTracker';
import { CustomerLedger } from '@/components/payment/CustomerLedger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingUp, TrendingDown, Users } from 'lucide-react';

export default function CustomerPaymentManagement() {
  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold neo-noir-gradient-text">
              Customer Payment Management
            </h1>
            <p className="neo-noir-text-muted">
              Track customer payments, balances, and ledger transactions
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-400">₹4,85,000</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Payments Received</p>
                  <p className="text-2xl font-bold text-green-400">₹4,35,000</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Outstanding Amount</p>
                  <p className="text-2xl font-bold text-orange-400">₹50,000</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Active Customers</p>
                  <p className="text-2xl font-bold text-accent-color">156</p>
                </div>
                <Users className="h-8 w-8 text-accent-color" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ledger" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 neo-noir-surface">
            <TabsTrigger value="ledger" className="neo-noir-text">Customer Ledger</TabsTrigger>
            <TabsTrigger value="tracker" className="neo-noir-text">Payment Tracker</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ledger" className="space-y-6">
            <CustomerLedger />
          </TabsContent>
          
          <TabsContent value="tracker" className="space-y-6">
            <PaymentTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
