
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format, parseISO, subDays } from "date-fns";
import { Download, Users, Phone, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToPdf } from "@/utils/pdfUtils";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

// Chart colors
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"];

export default function CustomerReport() {
  const { customers, orders } = useData();
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(today, 90),
    to: today
  });

  // Handler for date range changes
  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
  };

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.date);
    return dateRange.from && orderDate >= dateRange.from && 
           dateRange.to && orderDate <= dateRange.to;
  });

  // Calculate customer metrics
  const customersWithMetrics = customers.map(customer => {
    // Get all orders for this customer
    const customerOrders = filteredOrders.filter(order => order.customerId === customer.id);
    
    // Calculate metrics
    const orderCount = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
    
    // Find last order date
    let lastOrderDate = null;
    if (orderCount > 0) {
      const dates = customerOrders.map(o => parseISO(o.date));
      lastOrderDate = new Date(Math.max(...dates.map(d => d.getTime())));
    }
    
    // Return customer with metrics
    return {
      ...customer,
      orderCount,
      totalSpent,
      averageOrderValue,
      lastOrderDate
    };
  });

  // Sort customers by total spent
  const sortedCustomers = [...customersWithMetrics]
    .filter(c => c.orderCount > 0) // Only include customers with orders
    .sort((a, b) => b.totalSpent - a.totalSpent);

  // Calculate the number of active customers (customers who made an order in the selected period)
  const activeCustomers = customersWithMetrics.filter(c => c.orderCount > 0);
  const activeCustomersCount = activeCustomers.length;
  
  // Calculate the total revenue from all customers
  const totalRevenue = activeCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  
  // Calculate average revenue per customer
  const averageRevenuePerCustomer = activeCustomersCount > 0 ? 
    totalRevenue / activeCustomersCount : 0;

  // Group customers by area
  const customersByArea = activeCustomers.reduce((acc, customer) => {
    const area = customer.area || 'Unknown';
    if (!acc[area]) {
      acc[area] = {
        area,
        count: 0,
        totalSpent: 0
      };
    }
    acc[area].count++;
    acc[area].totalSpent += customer.totalSpent;
    return acc;
  }, {} as Record<string, {area: string; count: number; totalSpent: number}>);

  // Convert to array for charts
  const areaData = Object.values(customersByArea).sort((a, b) => b.count - a.count);

  // Export customer data to PDF
  const handleExportPdf = () => {
    try {
      const headers = ["Customer Name", "Phone", "Area", "Orders", "Total Spent (₹)", "Avg. Order (₹)", "Last Order"];
      
      const rows = sortedCustomers.map(customer => [
        customer.name,
        customer.phone || "-",
        customer.area || "-",
        customer.orderCount.toString(),
        customer.totalSpent.toFixed(2),
        customer.averageOrderValue.toFixed(2),
        customer.lastOrderDate ? format(customer.lastOrderDate, "yyyy-MM-dd") : "-"
      ]);
      
      exportToPdf(
        headers, 
        rows,
        {
          title: "Customer Analysis Report",
          subtitle: `Period: ${dateRange.from ? format(dateRange.from, "dd MMM yyyy") : ""} to ${dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}`,
          additionalInfo: [
            { label: "Total Active Customers", value: activeCustomersCount.toString() },
            { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}` },
            { label: "Average Revenue per Customer", value: `₹${averageRevenuePerCustomer.toFixed(2)}` }
          ],
          filename: `customer-report-${dateRange.from ? format(dateRange.from, "yyyyMMdd") : ""}-to-${dateRange.to ? format(dateRange.to, "yyyyMMdd") : ""}.pdf`,
          landscape: true
        }
      );
      
      toast.success("Customer report exported as PDF");
    } catch (error) {
      console.error("Error exporting customer report:", error);
      toast.error("Failed to export customer report");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Analysis</h1>
          <p className="text-muted-foreground">
            Customer metrics and behavior analysis
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
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCustomersCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Customers who placed orders in the selected period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customer Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Revenue from all customers in the period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Revenue per Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{averageRevenuePerCustomer.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Average spend per active customer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Distribution by Area</CardTitle>
            <CardDescription>Number of customers by area</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={areaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="area"
                  label={({ area, percent }) => 
                    `${area}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Customers']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spending Areas</CardTitle>
            <CardDescription>Total customer spend by area</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="area" type="category" width={100} />
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="totalSpent" name="Total Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>Detailed customer metrics for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact & Location</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent (₹)</TableHead>
                <TableHead className="text-right">Avg. Order Value (₹)</TableHead>
                <TableHead className="text-right">Last Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.slice(0, 10).map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {customer.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        {customer.phone || "N/A"}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        {customer.area || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{customer.orderCount}</TableCell>
                  <TableCell className="text-right">{customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{customer.averageOrderValue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {customer.lastOrderDate
                      ? format(customer.lastOrderDate, "yyyy-MM-dd")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              {sortedCustomers.length > 10 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-2 text-sm text-muted-foreground">
                    {String(sortedCustomers.length - 10)} more customers not shown
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
