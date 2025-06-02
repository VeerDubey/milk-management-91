
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Users, Package, Truck, IndianRupee,
  Calendar, AlertTriangle, CheckCircle, Clock, BarChart3,
  PieChart, Activity, Target, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns';
import { useData } from '@/contexts/data/DataContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { customers, orders, payments, products, suppliers, expenses } = useData();

  // Calculate key metrics
  const metrics = useMemo(() => {
    const today = new Date();
    const currentMonth = { start: startOfMonth(today), end: endOfMonth(today) };
    const last7Days = { start: subDays(today, 7), end: today };
    const todayStr = format(today, 'yyyy-MM-dd');

    // Today's metrics
    const todayOrders = orders.filter(order => order.date === todayStr);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const todayPayments = payments.filter(payment => payment.date === todayStr);
    const todayPaymentAmount = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Monthly metrics
    const monthlyOrders = orders.filter(order => 
      isWithinInterval(new Date(order.date), currentMonth)
    );
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const monthlyExpenses = expenses
      .filter(expense => isWithinInterval(new Date(expense.date), currentMonth))
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Customer analytics
    const activeCustomers = customers.filter(customer => 
      orders.some(order => order.customerId === customer.id)
    ).length;

    // Product performance
    const productSales = products.map(product => {
      const sales = orders.reduce((sum, order) => {
        const productOrders = order.items?.filter(item => item.productId === product.id) || [];
        return sum + productOrders.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);
      return { ...product, sales };
    }).sort((a, b) => b.sales - a.sales);

    // Outstanding amounts
    const totalOutstanding = customers.reduce((sum, customer) => 
      sum + (customer.outstandingBalance || 0), 0
    );

    // Order status distribution
    const orderStatusCount = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      todayPayments: todayPaymentAmount,
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue,
      monthlyExpenses,
      netProfit: monthlyRevenue - monthlyExpenses,
      activeCustomers,
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalSuppliers: suppliers.length,
      totalOutstanding,
      topProducts: productSales.slice(0, 5),
      orderStatusCount
    };
  }, [customers, orders, payments, products, suppliers, expenses]);

  // Chart data
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: [28, 48, 40, 19, 86, 27, 90],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const productDistributionData = {
    labels: metrics.topProducts.map(p => p.name),
    datasets: [
      {
        data: metrics.topProducts.map(p => p.sales),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
      },
    ],
  };

  const orderStatusData = {
    labels: Object.keys(metrics.orderStatusCount),
    datasets: [
      {
        data: Object.values(metrics.orderStatusCount),
        backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
      },
    ],
  };

  return (
    <div className="space-y-6 p-6 neo-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-aurora neo-glow-text">
            ERP Dashboard
          </h1>
          <p className="text-muted-foreground">
            Complete business overview and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="neo-glass">
            <Calendar className="mr-2 h-4 w-4" />
            {format(new Date(), 'PPP')}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{metrics.todayRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.todayOrders} orders
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">₹{metrics.monthlyRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.monthlyOrders} orders
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.activeCustomers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {metrics.totalCustomers} total
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">₹{metrics.totalOutstanding.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending collections
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="neo-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sales Performance
            </CardTitle>
            <CardDescription>Weekly sales and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={salesChartData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' as const },
              },
              scales: {
                y: { beginAtZero: true }
              }
            }} />
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Monthly Goals
            </CardTitle>
            <CardDescription>Track your progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Revenue Goal</span>
                <span>₹{metrics.monthlyRevenue.toFixed(0)}/₹50000</span>
              </div>
              <Progress value={(metrics.monthlyRevenue / 50000) * 100} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Order Goal</span>
                <span>{metrics.monthlyOrders}/200</span>
              </div>
              <Progress value={(metrics.monthlyOrders / 200) * 100} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Customer Goal</span>
                <span>{metrics.activeCustomers}/100</span>
              </div>
              <Progress value={(metrics.activeCustomers / 100) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Product Analytics</TabsTrigger>
          <TabsTrigger value="orders">Order Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="neo-card">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut data={productDistributionData} options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'right' as const }
                  }
                }} />
              </CardContent>
            </Card>

            <Card className="neo-card">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Sales volume by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{product.sales} units</p>
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="neo-card">
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut data={orderStatusData} options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' as const }
                  }
                }} />
              </CardContent>
            </Card>

            <Card className="neo-card">
              <CardHeader>
                <CardTitle>Order Insights</CardTitle>
                <CardDescription>Key order metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.orderStatusCount.completed || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {metrics.orderStatusCount.pending || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Average Order Value</p>
                  <p className="text-xl font-bold">
                    ₹{metrics.monthlyOrders > 0 ? (metrics.monthlyRevenue / metrics.monthlyOrders).toFixed(2) : '0.00'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="neo-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                    <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{metrics.netProfit.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    metrics.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {metrics.netProfit >= 0 ? 
                      <ArrowUpRight className="h-6 w-6 text-green-600" /> :
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neo-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">₹{metrics.monthlyExpenses.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neo-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.monthlyRevenue > 0 ? ((metrics.netProfit / metrics.monthlyRevenue) * 100).toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common business operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Package className="h-6 w-6" />
              New Order
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              Add Customer
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <IndianRupee className="h-6 w-6" />
              Record Payment
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Truck className="h-6 w-6" />
              Create Load Sheet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
