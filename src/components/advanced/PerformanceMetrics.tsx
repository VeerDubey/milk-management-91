import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, DollarSign, Award, Zap } from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';

export function PerformanceMetrics() {
  const { orders, customers } = useData();
  
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  // Mock performance data
  const metrics = {
    monthlyGrowth: 12.5,
    customerRetention: 85.2,
    conversionRate: 4.7,
    customerSatisfaction: 4.8,
    averageResponseTime: 2.3,
    goalProgress: 78
  };

  const kpis = [
    {
      name: 'Revenue Growth',
      value: `+${metrics.monthlyGrowth}%`,
      target: '+15%',
      progress: (metrics.monthlyGrowth / 15) * 100,
      status: 'good',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      name: 'Customer Retention',
      value: `${metrics.customerRetention}%`,
      target: '90%',
      progress: (metrics.customerRetention / 90) * 100,
      status: 'warning',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      name: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      target: '5%',
      progress: (metrics.conversionRate / 5) * 100,
      status: 'warning',
      icon: Target,
      color: 'text-orange-500'
    },
    {
      name: 'Customer Satisfaction',
      value: `${metrics.customerSatisfaction}/5`,
      target: '4.5/5',
      progress: (metrics.customerSatisfaction / 5) * 100,
      status: 'excellent',
      icon: Award,
      color: 'text-purple-500'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-500">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-500">Good</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Needs Attention</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Performance Metrics</h2>
        <p className="text-muted-foreground">Track KPIs and monitor business performance</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.monthlyGrowth}% this month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-blue-500">₹{avgOrderValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-green-500">{customers.filter(c => c.isActive).length}</p>
                <p className="text-xs text-green-500">85% retention rate</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goal Progress</p>
                <p className="text-2xl font-bold text-orange-500">{metrics.goalProgress}%</p>
                <p className="text-xs text-orange-500">Monthly target</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Dashboard */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                    <div>
                      <h4 className="font-medium">{kpi.name}</h4>
                      <p className="text-sm text-muted-foreground">Target: {kpi.target}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">{kpi.value}</p>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    {getStatusBadge(kpi.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}