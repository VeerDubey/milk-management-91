
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Users, Package, DollarSign, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export function PerformanceMetrics() {
  const { orders, customers } = useData();
  
  // Calculate KPIs
  const monthlyRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const monthlyTarget = 50000; // Example target
  const revenueProgress = (monthlyRevenue / monthlyTarget) * 100;
  
  const customerSatisfaction = 92; // Mock data
  const deliveryEfficiency = 87; // Mock data
  const orderFulfillment = 95; // Mock data
  
  const kpis = [
    {
      title: 'Monthly Revenue',
      current: monthlyRevenue,
      target: monthlyTarget,
      progress: revenueProgress,
      icon: DollarSign,
      format: (value: number) => `₹${value.toFixed(0)}`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Customer Satisfaction',
      current: customerSatisfaction,
      target: 95,
      progress: (customerSatisfaction / 95) * 100,
      icon: Users,
      format: (value: number) => `${value}%`,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Delivery Efficiency',
      current: deliveryEfficiency,
      target: 90,
      progress: (deliveryEfficiency / 90) * 100,
      icon: Clock,
      format: (value: number) => `${value}%`,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Order Fulfillment',
      current: orderFulfillment,
      target: 98,
      progress: (orderFulfillment / 98) * 100,
      icon: Package,
      format: (value: number) => `${value}%`,
      color: 'from-orange-500 to-red-500'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Performance Metrics</h2>
        <p className="text-muted-foreground">Track and optimize your key performance indicators</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{kpi.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${kpi.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {kpi.format(kpi.current)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Target: {kpi.format(kpi.target)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.min(kpi.progress, 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(kpi.progress, 100)} 
                    className="h-2"
                  />
                </div>
                
                <div className="flex items-center text-sm">
                  {kpi.progress >= 100 ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Target achieved!
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {kpi.format(kpi.target - kpi.current)} to reach target
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Performance trend charts would be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
