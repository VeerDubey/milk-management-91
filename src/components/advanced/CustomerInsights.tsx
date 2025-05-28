
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Star, Target } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export function CustomerInsights() {
  const { customers, orders } = useData();
  
  // Calculate customer insights
  const customerStats = customers.map(customer => {
    const customerOrders = orders.filter(order => order.customerId === customer.id);
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = customerOrders.length;
    const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
    
    return {
      ...customer,
      totalSpent,
      orderCount,
      avgOrderValue,
      lastOrderDate: customerOrders.length > 0 ? 
        Math.max(...customerOrders.map(o => new Date(o.date).getTime())) : null
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
  
  const topCustomers = customerStats.slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Customer Intelligence</h2>
        <p className="text-muted-foreground">AI-powered customer behavior analysis</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{customers.length}</div>
            <div className="text-sm text-muted-foreground">Total Customers</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{topCustomers.length}</div>
            <div className="text-sm text-muted-foreground">VIP Customers</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              ₹{customerStats.reduce((sum, c) => sum + c.avgOrderValue, 0).toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Order Value</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.orderCount} orders
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{customer.totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    Avg: ₹{customer.avgOrderValue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
