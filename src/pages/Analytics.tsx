
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/contexts/data/DataContext";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Coins
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfMonth, endOfMonth, differenceInDays } from "date-fns";

const Analytics = () => {
  const { customers, orders, products, payments } = useData();
  
  // Generate dates for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, "yyyy-MM-dd");
  }).reverse();
  
  // Generate month names
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Get current month start and end
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const daysInMonth = differenceInDays(currentMonthEnd, currentMonthStart) + 1;

  // Generate daily sales data
  const dailySalesData = last30Days.map(date => {
    // Sum up order amounts for this date
    const dayOrders = orders.filter(order => format(new Date(order.date), "yyyy-MM-dd") === date);
    
    let totalAmount = 0;
    dayOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalAmount += item.quantity * product.price;
        }
      });
    });
    
    return {
      date,
      amount: totalAmount,
      orders: dayOrders.length
    };
  });

  // Generate monthly sales data
  const monthlySalesData = monthNames.map((month, index) => {
    // Sum up order amounts for this month
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === index;
    });
    
    let totalAmount = 0;
    monthOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalAmount += item.quantity * product.price;
        }
      });
    });
    
    return {
      month,
      amount: totalAmount,
      orders: monthOrders.length
    };
  });

  // Generate product category data
  const productCategories = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    
    if (!acc[category]) {
      acc[category] = {
        category,
        count: 0,
        revenue: 0
      };
    }
    
    acc[category].count += 1;
    
    // Calculate revenue from orders
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId === product.id) {
          acc[category].revenue += item.quantity * product.price;
        }
      });
    });
    
    return acc;
  }, {} as Record<string, { category: string; count: number; revenue: number }>);
  
  const productCategoryData = Object.values(productCategories);

  // Calculate key metrics
  const totalRevenue = orders.reduce((sum, order) => {
    let orderTotal = 0;
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        orderTotal += item.quantity * product.price;
      }
    });
    return sum + orderTotal;
  }, 0);
  
  const totalOrders = orders.length;
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const ordersThisMonth = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
  }).length;

  // COLORS
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Analytics</h1>
        <p className="text-muted-foreground">
          Analyze your business performance and sales trends
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {ordersThisMonth} orders this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {customers.filter(c => c.isActive).length} active customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +0.7% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Sales
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Products
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Daily Sales - Last 30 Days
                </CardTitle>
                <CardDescription>
                  Track your daily sales performance
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailySalesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), "dd MMM")}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`₹${value}`, "Amount"]}
                      labelFormatter={(label) => format(new Date(label), "dd MMM yyyy")}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      name="Sales Amount" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      name="Number of Orders" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Sales
                </CardTitle>
                <CardDescription>
                  Compare sales performance across months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySalesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`₹${value}`, "Amount"]}
                    />
                    <Legend />
                    <Bar dataKey="amount" name="Sales Amount" fill="#8884d8" />
                    <Bar dataKey="orders" name="Number of Orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Product Category Distribution
              </CardTitle>
              <CardDescription>
                Sales breakdown by product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productCategoryData}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ category, percent }) => 
                          `${category}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {productCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, "Revenue"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productCategoryData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={100} />
                      <Tooltip 
                        formatter={(value, name) => [name === "count" ? value : `₹${value}`, name === "count" ? "Products" : "Revenue"]}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Product Count" fill="#82ca9d" />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
                <CardDescription>
                  Products with highest sales volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center">
                      <div className="font-medium">{index + 1}.</div>
                      <div className="ml-4 flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category || "Uncategorized"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{product.price}</div>
                        <Badge variant="outline" className="ml-2">
                          {Math.floor(Math.random() * 300) + 50} sold
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Metrics
                </CardTitle>
                <CardDescription>
                  Month-over-month growth performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Sales Growth</div>
                      <div className="text-sm font-medium text-green-500">+12.5%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "12.5%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Customer Growth</div>
                      <div className="text-sm font-medium text-green-500">+8.3%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "8.3%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Order Volume</div>
                      <div className="text-sm font-medium text-green-500">+15.2%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "15.2%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Average Order Value</div>
                      <div className="text-sm font-medium text-red-500">-2.1%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "2.1%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Forecast
              </CardTitle>
              <CardDescription>
                Projected sales for the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySalesData.map((day, index) => ({
                    ...day,
                    forecast: day.amount * (1 + (Math.sin(index / 5) * 0.1) + 0.05)
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), "dd MMM")}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, "Amount"]}
                    labelFormatter={(label) => format(new Date(label), "dd MMM yyyy")}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    name="Actual Sales" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    name="Forecasted Sales" 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              Generate Detailed Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
