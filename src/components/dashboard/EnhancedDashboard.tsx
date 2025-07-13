
import React from 'react';
import { useData } from '@/contexts/data/DataContext';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleGuard } from '@/components/RoleGuard';
import { ExportService } from '@/services/ExportService';
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Download,
  FileText,
  DollarSign,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { toast } from 'sonner';

export const EnhancedDashboard: React.FC = () => {
  const { customers, orders, payments, products } = useData();
  const { user, isAdmin } = useEnhancedAuth();

  // Calculate analytics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOutstanding = customers.reduce((sum, customer) => sum + (customer.outstandingBalance || 0), 0);
  
  // Recent activity (last 7 days)
  const recentOrders = orders.filter(order => 
    isAfter(new Date(order.date), subDays(new Date(), 7))
  );
  const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // Chart data
  const dailySalesData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayOrders = orders.filter(order => 
        format(new Date(order.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        name: format(date, 'EEE'),
        sales: dayRevenue,
        orders: dayOrders.length
      };
    });
    return last7Days;
  }, [orders]);

  const orderStatusData = React.useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [orders]);

  const topCustomersData = React.useMemo(() => {
    const customerSpending = customers.map(customer => {
      const customerOrders = orders.filter(order => order.customerId === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      return {
        name: customer.name,
        spent: totalSpent
      };
    }).filter(c => c.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
    
    return customerSpending;
  }, [customers, orders]);

  // Export functions
  const handleExportCustomers = () => {
    const exportData = ExportService.exportCustomers(customers);
    ExportService.exportToPDF(exportData);
    toast.success('Customer report exported successfully!');
  };

  const handleExportOrders = () => {
    const exportData = ExportService.exportOrders(orders, customers, products);
    ExportService.exportToExcel(exportData);
    toast.success('Orders report exported successfully!');
  };

  const handleExportPayments = () => {
    const exportData = ExportService.exportPayments(payments, customers);
    ExportService.exportToPDF(exportData);
    toast.success('Payments report exported successfully!');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your milk distribution business today.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {user?.role === 'admin' ? 'Administrator' : 'Employee'}
            </Badge>
            {isAdmin && (
              <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <Zap className="w-3 h-3 mr-1" />
                Full Access
              </Badge>
            )}
          </div>
        </div>
        
        <RoleGuard allowedRoles={['admin']}>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCustomers}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Customers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportOrders}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>
        </RoleGuard>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +₹{recentRevenue.toFixed(2)} this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {customers.filter(c => (c.outstandingBalance || 0) > 0).length} customers with dues
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {totalCustomers} total customers
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalOrders} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
            <CardDescription>
              Revenue and order trends
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>
              Current order statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <RoleGuard allowedRoles={['admin']}>
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Spending</CardTitle>
            <CardDescription>
              Your most valuable customers
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomersData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="spent" fill="hsl(var(--primary))" name="Total Spent (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </RoleGuard>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Business Intelligence</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Access advanced analytics and AI-powered insights
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Target className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Inventory Control</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage stock levels and track inventory
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Package className="mr-2 h-4 w-4" />
              Manage Stock
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Financial Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Track payments, dues, and financial health
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Finances
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
