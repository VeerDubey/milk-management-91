
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export function InventoryPredictor() {
  const { products, orders } = useData();
  
  // Simple demand prediction based on recent orders
  const productDemand = products.map(product => {
    const recentOrders = orders.filter(order => 
      new Date(order.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const totalDemand = recentOrders.reduce((sum, order) => {
      const productItems = order.items.filter(item => item.productId === product.id);
      return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    const avgDailyDemand = totalDemand / 30;
    const predictedWeeklyDemand = avgDailyDemand * 7;
    
    let status: 'low' | 'medium' | 'high' = 'medium';
    if (predictedWeeklyDemand > 100) status = 'high';
    if (predictedWeeklyDemand < 20) status = 'low';
    
    return {
      ...product,
      totalDemand,
      avgDailyDemand,
      predictedWeeklyDemand,
      status
    };
  }).sort((a, b) => b.predictedWeeklyDemand - a.predictedWeeklyDemand);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Smart Inventory Predictor</h2>
        <p className="text-muted-foreground">AI-driven demand forecasting and optimization</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm text-muted-foreground">Products Tracked</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {productDemand.filter(p => p.status === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">High Demand</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">
              {productDemand.filter(p => p.status === 'low').length}
            </div>
            <div className="text-sm text-muted-foreground">Low Demand</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productDemand.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {product.status === 'high' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {product.status === 'medium' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    {product.status === 'low' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Daily avg: {product.avgDailyDemand.toFixed(1)} {product.unit}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {product.predictedWeeklyDemand.toFixed(1)} {product.unit}/week
                  </div>
                  <Badge variant={
                    product.status === 'high' ? 'default' : 
                    product.status === 'medium' ? 'secondary' : 'outline'
                  }>
                    {product.status} demand
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
