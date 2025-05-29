
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Archive,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryDashboard() {
  const { products, orders } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Calculate inventory metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.stock || 0) < (p.minStock || 10));
  const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);

  // Get recent order data for trend analysis
  const recentOrders = orders.slice(-30); // Last 30 orders
  const getProductTrend = (productId: string) => {
    const productOrders = recentOrders.filter(order => 
      order.items?.some(item => item.productId === productId)
    );
    return productOrders.length > 5 ? 'up' : productOrders.length < 2 ? 'down' : 'stable';
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const getStockStatus = (product: any) => {
    const stock = product.stock || 0;
    const minStock = product.minStock || 10;
    
    if (stock === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < minStock) return { status: 'low-stock', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (stock > minStock * 3) return { status: 'overstocked', label: 'Overstocked', color: 'bg-blue-100 text-blue-800' };
    return { status: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const handleUpdateStock = (productId: string) => {
    toast.info('Stock update functionality will be implemented');
  };

  const handleRestockAlert = (productId: string) => {
    toast.success('Restock alert sent to suppliers');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Inventory Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your product inventory with advanced analytics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-secondary/20 text-secondary hover:bg-secondary/10">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Inventory
          </Button>
          <Button className="aurora-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-gradient-aurora">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-warning">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-destructive">{outOfStockProducts.length}</p>
              </div>
              <Archive className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold text-gradient-aurora">₹{totalInventoryValue.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle className="text-gradient-aurora">Product Inventory</CardTitle>
          <CardDescription>
            Monitor stock levels, trends, and manage your product inventory
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-primary/20">
                    <Filter className="mr-2 h-4 w-4" />
                    Category {filterCategory && `(${filterCategory})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterCategory('')}>
                    All Categories
                  </DropdownMenuItem>
                  {categories.map(category => (
                    <DropdownMenuItem key={category} onClick={() => setFilterCategory(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const trend = getProductTrend(product.id);
                const stock = product.stock || 0;
                const price = product.price || 0;
                const value = stock * price;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku || 'N/A'}</TableCell>
                    <TableCell>{product.category || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <span className={stock < (product.minStock || 10) ? 'text-warning font-medium' : ''}>
                        {stock} {product.unit || 'pcs'}
                      </span>
                    </TableCell>
                    <TableCell>{product.minStock || 10} {product.unit || 'pcs'}</TableCell>
                    <TableCell>₹{price.toFixed(2)}</TableCell>
                    <TableCell>₹{value.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trend)}
                        <span className="text-xs text-muted-foreground capitalize">{trend}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStock(product.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Update Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRestockAlert(product.id)}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Restock Alert
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
