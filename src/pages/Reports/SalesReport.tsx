import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange as DateRangePicker } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { format, subDays, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar, Download, Filter, Loader2, RefreshCcw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Import Recharts components for better performance and TypeScript support
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

// Define chart colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#0088fe", "#00C49F"];

// Define types for our data structures
interface ProductSalesData {
  name: string;
  quantity: number;
  amount: number;
}

interface CustomerSalesData {
  name: string;
  orders: number;
  totalAmount: number;
}

// Define daily sales data type
interface DailySalesData {
  date: string;
  amount: number;
}

export default function SalesReport() {
  const { orders, products, customers } = useData();
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(today, 30),
    to: today
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Date filter
      if (dateRange?.from && dateRange?.to) {
        const orderDate = new Date(order.date);
        if (orderDate < dateRange.from || orderDate > dateRange.to) {
          return false;
        }
      }
      
      // Customer filter
      if (customerFilter !== "all" && order.customerId !== customerFilter) {
        return false;
      }
      
      // Product filter
      if (productFilter !== "all" && !order.items.some(item => item.productId === productFilter)) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "completed" && order.status !== "completed") {
          return false;
        }
        if (statusFilter === "pending" && order.status !== "pending") {
          return false;
        }
        if (statusFilter === "cancelled" && order.status !== "cancelled") {
          return false;
        }
        if (statusFilter === "processing" && order.status !== "processing") {
          return false;
        }
      }
      
      return true;
    });
  }, [orders, dateRange, customerFilter, productFilter, statusFilter]);

  // Calculate total sales
  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Calculate total number of orders
  const totalOrders = filteredOrders.length;
  
  // Calculate average order value
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Group sales by product with proper typing
  const salesByProduct: Record<string, ProductSalesData> = {};
  
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.productId;
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const productName = product.name;
      const quantity = item.quantity || 0;
      const amount = product.price * quantity;
      
      if (!salesByProduct[productId]) {
        salesByProduct[productId] = {
          name: productName,
          quantity: 0,
          amount: 0
        };
      }
      
      salesByProduct[productId].quantity += quantity;
      salesByProduct[productId].amount += amount;
    });
  });
  
  // Convert to array for charts ensuring type safety
  const productSalesData = Object.values(salesByProduct).sort((a, b) => b.amount - a.amount);
  
  // Group sales by customer with proper typing
  const salesByCustomer: Record<string, CustomerSalesData> = {};
  
  filteredOrders.forEach(order => {
    const customerId = order.customerId;
    if (!customerId) return;
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    if (!salesByCustomer[customerId]) {
      salesByCustomer[customerId] = {
        name: customer.name,
        orders: 0,
        totalAmount: 0
      };
    }
    
    salesByCustomer[customerId].orders += 1;
    salesByCustomer[customerId].totalAmount += (order.totalAmount || 0);
  });
  
  // Convert to array for charts ensuring type safety
  const customerSalesData = Object.values(salesByCustomer).sort((a, b) => b.totalAmount - a.totalAmount);

  // Create data for recharts
  const barChartData = filteredOrders.map(order => ({
    name: format(parseISO(order.date), "MMM dd"),
    amount: order.totalAmount || 0
  }));

  // Create data for pie chart
  const pieChartData = productSalesData.slice(0, 5).map(product => ({
    name: product.name,
    value: product.amount
  }));

  // Function to handle PDF export
  const handleExportPdf = () => {
    try {
      const headers = ["Date", "Order ID", "Customer", "Items", "Amount (₹)"];
      
      const rows = filteredOrders.map(order => [
        format(parseISO(order.date), "yyyy-MM-dd"),
        order.id,
        order.customerName || "",
        order.items.length.toString(),
        (order.totalAmount || 0).toFixed(2)
      ]);
      
      // Add a summary row
      rows.push([
        "",
        "",
        "",
        `Total: ${totalOrders} orders`,
        `₹${totalSales.toFixed(2)}`
      ]);
      
      // Create PDF export utility
      const exportToPdf = (headers: string[], rows: string[][], options: any) => {
        import('@/utils/pdfUtils').then(module => {
          module.exportToPdf(headers, rows, options);
        });
      };
      
      exportToPdf(
        headers, 
        rows,
        {
          title: "Sales Report",
          subtitle: `Period: ${dateRange.from ? format(dateRange.from, "dd MMM yyyy") : ""} to ${dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}`,
          additionalInfo: [
            { label: "Total Sales", value: `₹${totalSales.toFixed(2)}` },
            { label: "Total Orders", value: totalOrders.toString() },
            { label: "Average Order Value", value: `₹${avgOrderValue.toFixed(2)}` }
          ],
          filename: `sales-report-${dateRange.from ? format(dateRange.from, "yyyyMMdd") : ""}-to-${dateRange.to ? format(dateRange.to, "yyyyMMdd") : ""}.pdf`,
          landscape: true
        }
      );
      
      toast({
        title: "Success",
        description: "Sales report exported as PDF"
      });
    } catch (error) {
      console.error("Error exporting sales report:", error);
      toast({
        title: "Error",
        description: "Failed to export sales report",
        variant: "destructive"
      });
    }
  };

  // Handler for date range change
  const handleDateChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground">
            Analyze sales performance and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            onDateChange={handleDateChange}
          />
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              For period {dateRange.from ? format(dateRange.from, "dd MMM yyyy") : ""} - {dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-2">
              For period {dateRange.from ? format(dateRange.from, "dd MMM yyyy") : ""} - {dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              For period {dateRange.from ? format(dateRange.from, "dd MMM yyyy") : ""} - {dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="details">Order Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales for selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" name="Sales Amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products by revenue</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Sales Analysis</CardTitle>
              <CardDescription>Sales breakdown by product</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Revenue (₹)</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productSalesData.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">{product.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {((product.amount / totalSales) * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Sales Analysis</CardTitle>
              <CardDescription>Sales breakdown by customer</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Total Spent (₹)</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerSalesData.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell className="text-right">{customer.orders}</TableCell>
                      <TableCell className="text-right">{customer.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {((customer.totalAmount / totalSales) * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Complete list of orders for selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{format(parseISO(order.date), "yyyy-MM-dd")}</TableCell>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customerName || "N/A"}</TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell className="text-right">{order.totalAmount?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === "completed" ? "success" : 
                          order.status === "processing" ? "warning" : 
                          order.status === "pending" ? "default" :
                          "outline"
                        }>
                          {order.status || "N/A"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
