
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';

export default function SalesAnalytics() {
  const { orders, customers, products, payments } = useData();
  const [dateRange, setDateRange] = useState('7'); // Last 7 days
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Date filtering
  const filterDate = new Date();
  const startDate = subDays(filterDate, parseInt(dateRange));
  
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    const dateMatch = isAfter(orderDate, startDate);
    const productMatch = !selectedProduct || order.items?.some(item => item.productId === selectedProduct);
    const customerMatch = !selectedCustomer || order.customerId === selectedCustomer;
    return dateMatch && productMatch && customerMatch;
  });

  // Calculate metrics
  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const uniqueCustomers = new Set(filteredOrders.map(order => order.customerId)).size;

  // Top products
  const productSales = new Map<string, { name: string, quantity: number, revenue: number }>();
  filteredOrders.forEach(order => {
    order.items?.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const existing = productSales.get(item.productId) || { name: product.name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.quantity * (item.rate || product.price || 0);
        productSales.set(item.productId, existing);
      }
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top customers
  const customerSales = new Map<string, { name: string, orders: number, revenue: number }>();
  filteredOrders.forEach(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const customerName = customer?.name || order.customerName || 'Unknown Customer';
    const existing = customerSales.get(order.customerId) || { name: customerName, orders: 0, revenue: 0 };
    existing.orders += 1;
    existing.revenue += order.total || order.totalAmount || 0;
    customerSales.set(order.customerId, existing);
  });

  const topCustomers = Array.from(customerSales.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales by day
  const salesByDay = new Map<string, number>();
  filteredOrders.forEach(order => {
    const dayKey = format(new Date(order.date), 'yyyy-MM-dd');
    salesByDay.set(dayKey, (salesByDay.get(dayKey) || 0) + (order.total || order.totalAmount || 0));
  });

  // Growth calculation (compare with previous period)
  const previousPeriodStart = subDays(startDate, parseInt(dateRange));
  const previousOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return isAfter(orderDate, previousPeriodStart) && isBefore(orderDate, startDate);
  });
  const previousSales = previousOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
  const growthRate = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;

  const handleExportReport = () => {
    const reportData = {
      period: `Last ${dateRange} days`,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalSales,
        totalOrders,
        averageOrderValue,
        uniqueCustomers,
        growthRate
      },
      topProducts,
      topCustomers
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Sales analytics report exported');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Sales Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your sales performance and trends
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportReport}
            className="border-secondary/20 text-secondary hover:bg-secondary/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" className="border-accent/20 text-accent hover:bg-accent/10">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle className="text-gradient-aurora">Analytics Filters</CardTitle>
          <CardDescription>Customize your analytics view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Filter</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Filter</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All customers</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-gradient-aurora">₹{totalSales.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {growthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                  )}
                  <span className={`text-sm font-medium ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(growthRate).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-gradient-aurora">{totalOrders}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(totalOrders / parseInt(dateRange))} per day avg
                </p>
              </div>
              <Package className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-gradient-aurora">₹{averageOrderValue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">Per transaction</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold text-gradient-aurora">{uniqueCustomers}</p>
                <p className="text-sm text-muted-foreground mt-2">Active buyers</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Award className="h-5 w-5" />
              Top Products
            </CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gradient-aurora">₹{product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
            <CardDescription>Highest revenue generating customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20 text-secondary font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gradient-aurora">₹{customer.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
