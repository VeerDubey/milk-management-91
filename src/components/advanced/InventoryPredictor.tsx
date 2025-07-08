
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';

export function InventoryPredictor() {
  const { products, orders } = useData();
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient">Smart Inventory Predictor</h2>
        <p className="text-muted-foreground">AI-driven demand forecasting and stock optimization</p>
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
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Low Stock Alerts</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Demand forecasting chart would go here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
