
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, 
  Calendar, BarChart3, Zap, Eye
} from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';
import type { StockAlert, BatchInfo } from '@/types/enhanced';

export default function InventoryDashboard() {
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for demonstration - in real app this would come from context
  const stockAlerts: StockAlert[] = [
    {
      id: '1',
      productId: 'prod1',
      productName: 'Full Cream Milk 1L',
      currentStock: 5,
      minimumStock: 20,
      alertType: 'low_stock',
      severity: 'high',
      createdAt: new Date().toISOString(),
      acknowledged: false
    }
  ];

  const batches: BatchInfo[] = [
    {
      id: '1',
      batchNumber: 'FCM-2024-001',
      productId: 'prod1',
      quantity: 100,
      manufacturedDate: '2024-01-15',
      expiryDate: '2024-01-20',
      status: 'active',
      remainingQuantity: 45
    }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  const getStockStatus = (product: any) => {
    const stock = product.stock || 0;
    const minStock = product.minimumStock || 10;
    
    if (stock === 0) return { status: 'out', color: 'destructive' };
    if (stock <= minStock) return { status: 'low', color: 'warning' };
    return { status: 'good', color: 'success' };
  };

  const criticalAlerts = stockAlerts.filter(alert => 
    alert.severity === 'high' && !alert.acknowledged
  );

  const expiringBatches = batches.filter(batch => {
    const expiryDate = new Date(batch.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && batch.status === 'active';
  });

  return (
    <div className="space-y-6 p-6 neo-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-aurora neo-glow-text">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Track stock levels, batches, and inventory alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="neo-glass">
            <Package className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
          <Button className="neo-button-primary">
            <BarChart3 className="mr-2 h-4 w-4" />
            Stock Report
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {(criticalAlerts.length > 0 || expiringBatches.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalAlerts.length > 0 && (
            <Alert className="border-destructive neo-card">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Stock Alerts</AlertTitle>
              <AlertDescription>
                {criticalAlerts.length} products need immediate attention
                <div className="mt-2 space-y-1">
                  {criticalAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="text-sm">
                      • {alert.productName}: {alert.currentStock} remaining
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {expiringBatches.length > 0 && (
            <Alert className="border-warning neo-card">
              <Calendar className="h-4 w-4" />
              <AlertTitle>Expiring Batches</AlertTitle>
              <AlertDescription>
                {expiringBatches.length} batches expiring within 7 days
                <div className="mt-2 space-y-1">
                  {expiringBatches.slice(0, 3).map(batch => (
                    <div key={batch.id} className="text-sm">
                      • {batch.batchNumber}: Expires {batch.expiryDate}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-destructive" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{stockAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage your product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input md:max-w-sm"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="neo-input md:max-w-xs">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>

          {/* Product Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredProducts.map(product => {
              const stockInfo = getStockStatus(product);
              const stockPercentage = Math.min((product.stock || 0) / (product.minimumStock || 10) * 100, 100);
              
              return (
                <Card key={product.id} className="neo-card hover:neo-pulse transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-sm font-medium">₹{product.price}</p>
                      </div>
                      <Badge variant={stockInfo.color as any}>
                        {stockInfo.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock Level</span>
                        <span>{product.stock || 0} / {product.minimumStock || 10}</span>
                      </div>
                      <Progress value={stockPercentage} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" className="neo-button-primary">
                        <Package className="h-4 w-4 mr-1" />
                        Add Stock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
