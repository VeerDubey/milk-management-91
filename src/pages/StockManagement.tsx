
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
import { 
  Package, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown,
  Search, Filter, Download, Upload, BarChart3, RefreshCw
} from 'lucide-react';

interface StockEntry {
  id: string;
  productId: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  lastUpdated: string;
  supplierId?: string;
  cost: number;
  location?: string;
}

export default function StockManagement() {
  const { products, suppliers, stockEntries, addStockEntry, updateStockEntry } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add',
    quantity: 0,
    reason: '',
    cost: 0
  });

  // Mock stock data - in real app this would come from stockEntries
  const stockData = useMemo(() => {
    return products.map(product => {
      const stockEntry = stockEntries?.find(entry => entry.productId === product.id);
      return {
        ...product,
        currentStock: stockEntry?.quantity || Math.floor(Math.random() * 100) + 10,
        minStock: stockEntry?.minStock || 10,
        maxStock: stockEntry?.maxStock || 100,
        reorderLevel: stockEntry?.reorderLevel || 20,
        lastUpdated: stockEntry?.lastUpdated || new Date().toISOString(),
        cost: stockEntry?.cost || product.price * 0.7,
        location: stockEntry?.location || 'Warehouse A'
      };
    });
  }, [products, stockEntries]);

  const filteredStock = useMemo(() => {
    return stockData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stockData, searchTerm, selectedCategory]);

  const lowStockItems = stockData.filter(item => item.currentStock <= item.reorderLevel);
  const overStockItems = stockData.filter(item => item.currentStock >= item.maxStock);
  const totalStockValue = stockData.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

  const getStockStatus = (item: any) => {
    if (item.currentStock <= item.reorderLevel) return 'low';
    if (item.currentStock >= item.maxStock) return 'over';
    return 'normal';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'low':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>;
      case 'over':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Overstock
        </Badge>;
      default:
        return <Badge variant="default">Normal</Badge>;
    }
  };

  const handleStockAdjustment = () => {
    if (!selectedProduct || adjustmentData.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const newQuantity = adjustmentData.type === 'add' 
      ? selectedProduct.currentStock + adjustmentData.quantity
      : selectedProduct.currentStock - adjustmentData.quantity;

    if (newQuantity < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    // In real app, this would update the actual stock
    toast.success(`Stock ${adjustmentData.type === 'add' ? 'added' : 'removed'} successfully`);
    setIsAdjustDialogOpen(false);
    setAdjustmentData({ type: 'add', quantity: 0, reason: '', cost: 0 });
    setSelectedProduct(null);
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Monitor and manage your inventory levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overstock Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Consider reducing orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData.length}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-stock">All Stock</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="overstock">Overstock</TabsTrigger>
          <TabsTrigger value="adjustments">Stock Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="all-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                  <CardTitle>Inventory Overview</CardTitle>
                  <CardDescription>Complete stock information for all products</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search products..." 
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Current Stock</TableHead>
                      <TableHead className="text-center">Min/Max</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono text-sm">{item.code}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-center font-semibold">
                          {item.currentStock} {item.unit}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {item.minStock} / {item.maxStock}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(getStockStatus(item))}
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">
                          ₹{(item.currentStock * item.cost).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(item);
                                setIsAdjustDialogOpen(true);
                              }}
                            >
                              Adjust
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Low Stock Alert</CardTitle>
              <CardDescription>Items that need immediate restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No low stock items found. Great job managing inventory!
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.currentStock} | Minimum: {item.minStock}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="destructive">Low Stock</Badge>
                        <Button size="sm">Reorder</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overstock">
          <Card>
            <CardHeader>
              <CardTitle>Overstock Items</CardTitle>
              <CardDescription>Items with excess inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {overStockItems.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No overstock items found.
                </div>
              ) : (
                <div className="space-y-3">
                  {overStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.currentStock} | Maximum: {item.maxStock}
                        </p>
                      </div>
                      <Badge variant="secondary">Overstock</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Adjustments</CardTitle>
              <CardDescription>History of manual stock changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                No recent adjustments found.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Adjust stock for ${selectedProduct.name} (Current: ${selectedProduct.currentStock})`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={adjustmentData.type === 'add' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentData({...adjustmentData, type: 'add'})}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stock
                </Button>
                <Button
                  variant={adjustmentData.type === 'remove' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentData({...adjustmentData, type: 'remove'})}
                  className="flex-1"
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Remove Stock
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({...adjustmentData, quantity: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="e.g., Damaged goods, Manual count, etc."
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockAdjustment}>
              Adjust Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
