import { useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, Users, ShoppingBag, CreditCard, TrendingUp, 
  DollarSign, ArrowUpRight, ArrowDownRight, Package, 
  Truck, Calendar, FileText, Plus, ChevronRight,
  Banknote, Layers, User, PieChart, LineChart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Import recharts components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartLineChart,
  Line,
  PieChart as RechartPieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { customers, orders, products, payments, expenses } = useData();
  const navigate = useNavigate();
  const [salesPeriod, setSalesPeriod] = useState("weekly");

  // Calculate dashboard metrics
  const stats = useMemo(() => {
    // Get sales data
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingAmount = totalSales - totalPayments;
    
    // Get today's orders
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayOrders = orders.filter(order => 
      new Date(order.date).toISOString().split('T')[0] === todayStr
    );
    const todaySales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate month to date sales
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const mtdOrders = orders.filter(order => new Date(order.date) >= startOfMonth);
    const mtdSales = mtdOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate sales growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const lastMonthOrders = orders.filter(
      order => {
        const orderDate = new Date(order.date);
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
      }
    );
    
    const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const salesGrowth = lastMonthSales ? ((mtdSales - lastMonthSales) / lastMonthSales) * 100 : 0;
    
    // Calculate active products
    const activeProducts = products.filter(p => p.stock > 0).length;
    
    // Calculate expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate net profit
    const netProfit = totalSales - totalExpenses;
    
    // Calculate top products
    const productSales = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            productId: item.productId,
            quantity: 0,
            sales: 0
          };
        }
        acc[item.productId].quantity += item.quantity;
        acc[item.productId].sales += item.price * item.quantity;
      });
      return acc;
    }, {} as Record<string, { productId: string; quantity: number; sales: number; }>);
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          id: item.productId,
          name: product?.name || 'Unknown Product',
          sales: item.sales,
          quantity: item.quantity
        };
      });
    
    // Get recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(order => {
        const customer = customers.find(c => c.id === order.customerId);
        return {
          ...order,
          customerName: customer?.name || 'Unknown Customer'
        };
      });
    
    return {
      totalSales,
      totalCustomers: customers.length,
      activeProducts,
      outstandingAmount,
      todaySales,
      mtdSales,
      salesGrowth,
      totalExpenses,
      netProfit,
      topProducts,
      recentOrders,
      paymentRatio: totalSales > 0 ? (totalPayments / totalSales) * 100 : 0
    };
  }, [customers, orders, products, payments, expenses]);

  // Generate charts data
  const salesChartData = useMemo(() => {
    // Get dates for the last 7 days or 12 months based on selected period
    const dates = [];
    const today = new Date();
    
    if (salesPeriod === "weekly") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push({
          date,
          label: format(date, 'EEE')
        });
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        dates.push({
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          label: format(date, 'MMM')
        });
      }
    }
    
    // Calculate sales for each date
    return dates.map(({ date, label }) => {
      let start, end;
      
      if (salesPeriod === "weekly") {
        // For daily, start is beginning of the day, end is end of the day
        start = new Date(date);
        start.setHours(0, 0, 0, 0);
        end = new Date(date);
        end.setHours(23, 59, 59, 999);
      } else {
        // For monthly, start is beginning of the month, end is end of the month
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      }
      
      // Filter orders for the current period
      const periodOrders = orders.filter(
        order => {
          const orderDate = new Date(order.date);
          return orderDate >= start && orderDate <= end;
        }
      );
      
      // Calculate sales and expenses for the period
      const sales = periodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Filter expenses for the current period
      const periodExpenses = expenses.filter(
        expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        }
      );
      
      const expense = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate profit
      const profit = sales - expense;
      
      return {
        name: label,
        Sales: sales,
        Expenses: expense,
        Profit: profit
      };
    });
  }, [orders, expenses, salesPeriod]);

  // Generate product distribution chart data
  const productDistributionData = useMemo(() => {
    // Count orders by product category
    const productCounts: Record<string, number> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = product.category || 'Uncategorized';
          if (!productCounts[category]) {
            productCounts[category] = 0;
          }
          productCounts[category] += item.quantity;
        }
      });
    });
    
    // Convert to chart data format
    return Object.entries(productCounts).map(([category, value]) => ({
      name: category,
      value
    }));
  }, [orders, products]);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Vikas Milk Centre - Your daily milk order management system
        </p>
      </div>
      
      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSales?.toLocaleString() || '0'}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {stats.salesGrowth > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{Math.abs(stats.salesGrowth).toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{Math.abs(stats.salesGrowth).toFixed(1)}%</span>
                </>
              )}
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Total registered
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.outstandingAmount?.toLocaleString() || '0'}</div>
            <div className="flex items-center mt-1">
              <Progress 
                value={100 - stats.paymentRatio} 
                className="h-1.5" 
                indicatorColor={stats.paymentRatio > 80 ? "bg-green-500" : stats.paymentRatio > 50 ? "bg-amber-500" : "bg-red-500"}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.paymentRatio?.toFixed(1) || '0'}% collected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/order-entry")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  New Order Entry
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/customers")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Customers
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/payment-create")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/invoice-create")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/stock-management")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Manage Stock
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/orders")}>
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentOrders.length > 0 ? stats.recentOrders.map((order, i) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(order.date), 'MMM dd, yyyy')}</div>
                      </div>
                      <div className="text-sm font-medium">₹{order.totalAmount?.toLocaleString() || '0'}</div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-sm">No recent orders found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/order-entry")}>
                  <Plus className="h-4 w-4 mr-2" /> Create Order
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Distribution</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[200px]">
                {productDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartPieChart>
                      <Pie
                        data={productDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {productDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-4">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-2 opacity-30" />
                    <p className="text-muted-foreground">No product data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Today's Sales</CardTitle>
                  <CardDescription>Daily performance</CardDescription>
                </div>
                <div className={`rounded-full p-2 ${stats.todaySales > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {stats.todaySales > 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-bold">₹{stats.todaySales?.toLocaleString() || '0'}</div>
                <div className="mt-4 h-1 w-full rounded-full bg-muted">
                  <div 
                    className="h-1 rounded-full bg-primary" 
                    style={{ width: `${Math.min((stats.todaySales / (stats.mtdSales / 30)) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {Math.round((stats.todaySales / (stats.mtdSales / 30)) * 100) || 0}% of daily target
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Profit and expenses</CardDescription>
                </div>
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <Banknote className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <h3 className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{stats.netProfit?.toLocaleString() || '0'}
                    </h3>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <h3 className="text-2xl font-bold text-red-500">
                      ₹{stats.totalExpenses?.toLocaleString() || '0'}
                    </h3>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/financial-year")}>
                    View Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Sales Trend</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant={salesPeriod === "weekly" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSalesPeriod("weekly")}
              >
                Weekly
              </Button>
              <Button 
                variant={salesPeriod === "monthly" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSalesPeriod("monthly")}
              >
                Monthly
              </Button>
            </div>
          </div>
          
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <AspectRatio ratio={16 / 8}>
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, undefined]} 
                      />
                      <Legend />
                      <Bar dataKey="Sales" fill="#8884d8" />
                      <Bar dataKey="Expenses" fill="#ff8042" />
                      <Bar dataKey="Profit" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground">No sales data available</p>
                    </div>
                  </div>
                )}
              </AspectRatio>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with highest sales</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topProducts && stats.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-muted text-foreground`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.quantity} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{product.sales?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-2 opacity-30" />
                    <p className="text-muted-foreground">No product data available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/product-list")}>
                  View All Products
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Sales distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Total Revenue</p>
                      <p className="text-sm">₹{stats.totalSales?.toLocaleString() || '0'}</p>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Expenses</p>
                      <p className="text-sm">₹{stats.totalExpenses?.toLocaleString() || '0'}</p>
                    </div>
                    <Progress 
                      value={(stats.totalExpenses / stats.totalSales) * 100} 
                      className="h-2 bg-muted"
                      indicatorColor="bg-red-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Net Profit</p>
                      <p className="text-sm">₹{stats.netProfit?.toLocaleString() || '0'}</p>
                    </div>
                    <Progress 
                      value={(stats.netProfit / stats.totalSales) * 100} 
                      className="h-2 bg-muted"
                      indicatorColor="bg-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Outstanding</p>
                      <p className="text-sm">₹{stats.outstandingAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <Progress 
                      value={(stats.outstandingAmount / stats.totalSales) * 100} 
                      className="h-2 bg-muted"
                      indicatorColor="bg-amber-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/reports")}>
                  View Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory Status</CardTitle>
              <CardDescription>Current stock levels and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Total Products</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{products.length}</div>
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Active Products</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{stats.activeProducts}</div>
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Low Stock Items</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {products.filter(p => p.stock > 0 && p.stock < p.minStock).length}
                      </div>
                      <Layers className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border">
                  <div className="p-4 font-medium">Product Stock Status</div>
                  <div className="p-4 space-y-3">
                    {products.slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.category || 'Uncategorized'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`text-sm font-medium ${product.stock < product.minStock ? 'text-red-500' : 'text-green-500'}`}>
                            {product.stock} units
                          </div>
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full ${product.stock < product.minStock ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min((product.stock / product.minStock) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-4">
                    <Button variant="outline" className="w-full" onClick={() => navigate("/inventory")}>
                      View Inventory
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Overview</CardTitle>
              <CardDescription>Customer metrics and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Total Customers</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Active Customers</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {customers.filter(c => 
                          orders.some(o => o.customerId === c.id)
                        ).length}
                      </div>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">With Outstanding</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {customers.filter(c => c.outstandingAmount > 0).length}
                      </div>
                      <CreditCard className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border">
                  <div className="p-4 font-medium">Top Customers</div>
                  <div className="p-4 space-y-3">
                    {customers
                      .filter(c => orders.some(o => o.customerId === c.id))
                      .slice(0, 5)
                      .map(customer => {
                        const customerOrders = orders.filter(o => o.customerId === customer.id);
                        const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                        return (
                          <div key={customer.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-xs text-muted-foreground">{customer.area || customer.address}</p>
                              </div>
                            </div>
                            <div className="text-sm font-medium">₹{totalSpent?.toLocaleString() || '0'}</div>
                          </div>
                        );
                      })
                    }
                  </div>
                  <div className="border-t p-4">
                    <Button variant="outline" className="w-full" onClick={() => navigate("/customers")}>
                      Manage Customers
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
