
import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, ShoppingBag, CreditCard, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  const { customers, orders, products, payments } = useData();

  const stats = useMemo(() => {
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
    
    return {
      totalSales,
      totalCustomers: customers.length,
      activeProducts: products.filter(p => p.stock > 0).length,
      outstandingAmount,
      todaySales,
      mtdSales
    };
  }, [customers, orders, products, payments]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business metrics and performance
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg font-medium">Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Total registered</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg font-medium">Products</CardTitle>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">Active inventory</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg font-medium">Outstanding</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">₹{stats.outstandingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total receivables</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">Today's Sales</CardTitle>
              <CardDescription>Daily performance</CardDescription>
            </div>
            <div className={`rounded-full p-2 ${stats.todaySales > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {stats.todaySales > 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">₹{stats.todaySales.toLocaleString()}</div>
            <div className="mt-4 h-1 w-full rounded-full bg-muted">
              <div 
                className="h-1 rounded-full bg-primary" 
                style={{ width: `${Math.min((stats.todaySales / (stats.mtdSales / 30)) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {Math.round((stats.todaySales / (stats.mtdSales / 30)) * 100)}% of daily target
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">Month to Date</CardTitle>
              <CardDescription>Sales performance</CardDescription>
            </div>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">₹{stats.mtdSales.toLocaleString()}</div>
            <div className="mt-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                Average ₹{(stats.mtdSales / (new Date().getDate())).toLocaleString(undefined, {maximumFractionDigits: 2})} per day
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
