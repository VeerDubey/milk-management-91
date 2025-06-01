
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
          <h1 className="text-3xl font-bold neo-noir-gradient-text">
            Welcome back, {user?.name}!
          </h1>
          <p className="neo-noir-text-muted">
            Here's what's happening with your milk distribution business today.
          </p>
          <Badge variant="secondary" className="mt-2">
            {user?.role === 'admin' ? 'Administrator' : 'Employee'}
          </Badge>
        </div>
        
        <RoleGuard allowedRoles={['admin']}>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCustomers}
              className="neo-noir-button-outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Customers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportOrders}
              className="neo-noir-button-outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>
        </RoleGuard>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="neo-noir-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium neo-noir-text">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-accent-color" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neo-noir-text">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs neo-noir-text-muted">
              +₹{recentRevenue.toFixed(2)} this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="neo-noir-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium neo-noir-text">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neo-noir-text">₹{totalOutstanding.toFixed(2)}</div>
            <p className="text-xs neo-noir-text-muted">
              {customers.filter(c => (c.outstandingBalance || 0) > 0).length} customers with dues
            </p>
          </CardContent>
        </Card>
        
        <Card className="neo-noir-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium neo-noir-text">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-accent-color" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neo-noir-text">{activeCustomers}</div>
            <p className="text-xs neo-noir-text-muted">
              {totalCustomers} total customers
            </p>
          </CardContent>
        </Card>
        
        <Card className="neo-noir-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium neo-noir-text">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold neo-noir-text">{pendingOrders}</div>
            <p className="text-xs neo-noir-text-muted">
              {totalOrders} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text">Daily Sales (Last 7 Days)</CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Revenue and order trends
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(26, 30, 35, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#38bd95"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text">Order Status Distribution</CardTitle>
            <CardDescription className="neo-noir-text-muted">
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
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text">Top Customers by Spending</CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Your most valuable customers
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(26, 30, 35, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="spent" fill="#38bd95" name="Total Spent (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </RoleGuard>
    </div>
  );
};
