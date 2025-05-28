
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export function AnalyticsDashboard() {
  const { orders, customers, products } = useData();
  
  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalProducts = products.length;
  
  const metrics = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: '+12.5%',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: Package,
      trend: '+8.2%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toString(),
      icon: Users,
      trend: '+15.3%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Products',
      value: totalProducts.toString(),
      icon: BarChart3,
      trend: '+3.1%',
      color: 'from-orange-500 to-red-500'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive business insights</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-green-500">{metric.trend}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${metric.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              Sales chart visualization would go here
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              Product performance chart would go here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
