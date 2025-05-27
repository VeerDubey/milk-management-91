
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  Search,
  Plus,
  Settings
} from 'lucide-react';
import { PaymentAnalytics } from './PaymentAnalytics';

export const PaymentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-slate-400">
            Advanced payment tracking and analytics dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-violet-500">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-violet-500">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-violet-500">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PaymentAnalytics />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Payment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Interactive payment trend chart will be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Customer Payment Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Customer segmentation chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Transaction Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search transactions..." 
                      className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                      1,247 Total
                    </Badge>
                    <Badge variant="outline" className="border-violet-500 text-violet-400">
                      98.5% Success Rate
                    </Badge>
                  </div>
                </div>
                <div className="text-center py-12 text-slate-400">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Advanced transaction table will be displayed here</p>
                  <p className="text-sm">With filtering, sorting, and bulk operations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Payment Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
                    <div className="space-y-2">
                      {['UPI', 'Cash', 'Credit Card', 'Bank Transfer'].map((method) => (
                        <div key={method} className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                          <span className="text-slate-300">{method}</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <div className="space-y-2">
                      {['Payment Received', 'Failed Payments', 'Weekly Reports', 'Monthly Summary'].map((notification) => (
                        <div key={notification} className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                          <span className="text-slate-300">{notification}</span>
                          <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                            Enabled
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
