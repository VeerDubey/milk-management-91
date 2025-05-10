
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, parseISO, subDays } from "date-fns";
import { Download, FileText, Search } from "lucide-react";
import { exportToPdf } from "@/utils/pdfUtils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";

// Define chart colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function CustomerReport() {
  const { customers, orders, payments, products } = useData();
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(today, 90),
    to: today
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.date);
    return dateRange.from && orderDate >= dateRange.from && 
           dateRange.to && orderDate <= dateRange.to;
  });

  // Filter payments by date range
  const filteredPayments = payments.filter(payment => {
    const paymentDate = parseISO(payment.date);
    return dateRange.from && paymentDate >= dateRange.from && 
           dateRange.to && paymentDate <= dateRange.to;
  });

  // Customer acquisition data
  const customersByDate = customers.reduce((acc, customer) => {
    // Use registration date or fallback to first order date
    const dateStr = customer.registrationDate || 
      (orders.find(o => o.customerId === customer.id)?.date || "Unknown");
    
    if (dateStr === "Unknown") return acc;
    
    const monthYear = format(parseISO(dateStr), "MMM yyyy");
    
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    
    acc[monthYear]++;
    return acc;
  }, {} as Record<string, number>);

  const acquisitionData = Object.entries(customersByDate)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  // Customer activity data
  const customerActivity = customers.map(customer => {
    const customerOrders = filteredOrders.filter(o => o.customerId === customer.id);
    const orderCount = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
    const lastOrderDate = customerOrders.length > 0 
      ? Math.max(...customerOrders.map(o => new Date(o.date).getTime()))
      : null;
    
    const customerPayments = filteredPayments.filter(p => p.customerId === customer.id);
    const paymentCount = customerPayments.length;
    const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      id: customer.id,
      name: customer.name,
      mobileNumber: customer.phone || "N/A",
      email: customer.email || "N/A",
      orderCount,
      totalSpent,
      avgOrderValue,
      paymentCount,
      totalPaid,
      outstandingAmount: customer.outstandingBalance || 0,
      lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : null
    };
  });

  // Apply search filter
  const filteredCustomers = customerActivity.filter(customer => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.mobileNumber.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery)
    );
  });

  // Apply category filter
  const displayedCustomers = filteredCustomers.filter(customer => {
    if (filterBy === "active") {
      return customer.orderCount > 0;
    } else if (filterBy === "inactive") {
      return customer.orderCount === 0;
    } else if (filterBy === "outstanding") {
      return customer.outstandingAmount > 0;
    }
    return true; // "all"
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  // Customer segments by spending
  const customerSegments = [
    { name: "High Value (>₹10,000)", count: 0 },
    { name: "Medium Value (₹5,000-₹10,000)", count: 0 },
    { name: "Low Value (<₹5,000)", count: 0 },
    { name: "No Purchase", count: 0 }
  ];

  customerActivity.forEach(customer => {
    if (customer.totalSpent > 10000) {
      customerSegments[0].count++;
    } else if (customer.totalSpent >= 5000) {
      customerSegments[1].count++;
    } else if (customer.totalSpent > 0) {
      customerSegments[2].count++;
    } else {
      customerSegments[3].count++;
    }
  });

  // Function to export PDF
  const handleExportPdf = () => {
    try {
      const headers = ["Customer Name", "Phone", "Email", "Orders", "Total Spent (₹)", "Outstanding (₹)"];
      
      const rows = displayedCustomers.map(customer => [
        customer.name,
        customer.mobileNumber,
        customer.email,
        customer.orderCount.toString(),
        customer.totalSpent.toFixed(2),
        customer.outstandingAmount.toFixed(2)
      ]);
      
      exportToPdf(
        headers,
        rows,
        {
          title: "Customer Report",
          subtitle: `Period: ${dateRange.from ? format(dateRange.from, "dd MMM yyyy") : ""} to ${dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}`,
          additionalInfo: [
            { label: "Total Customers", value: displayedCustomers.length.toString() },
            { label: "Active Customers", value: displayedCustomers.filter(c => c.orderCount > 0).length.toString() },
            { label: "Total Outstanding", value: `₹${displayedCustomers.reduce((sum, c) => sum + c.outstandingAmount, 0).toFixed(2)}` }
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
          <h1 className="text-3xl font-bold tracking-tight">Customer Report</h1>
          <p className="text-muted-foreground">
            Customer analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {customerActivity.filter(c => c.orderCount > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Placed at least one order in period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Customer Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{(customerActivity.reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(1, customerActivity.filter(c => c.totalSpent > 0).length)).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customer List</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Customer distribution by spending</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={acquisitionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="New Customers" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Customer spending and order information</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="active">Active Customers</SelectItem>
                    <SelectItem value="inactive">Inactive Customers</SelectItem>
                    <SelectItem value="outstanding">With Outstanding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Total Spent (₹)</TableHead>
                    <TableHead className="text-right">Outstanding (₹)</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>
                        {customer.mobileNumber}
                        <br />
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </TableCell>
                      <TableCell className="text-right">{customer.orderCount}</TableCell>
                      <TableCell className="text-right">{customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{customer.outstandingAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        {customer.lastOrderDate 
                          ? format(customer.lastOrderDate, "yyyy-MM-dd")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {customer.orderCount > 0 ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Customers grouped by spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead className="text-right">Customers</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                    <TableHead className="text-right">Revenue (₹)</TableHead>
                    <TableHead className="text-right">% of Revenue</TableHead>
                    <TableHead className="text-right">Avg. Order Value (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "High Value (>₹10,000)", 
                      customers: customerActivity.filter(c => c.totalSpent > 10000)
                    },
                    {
                      name: "Medium Value (₹5,000-₹10,000)", 
                      customers: customerActivity.filter(c => c.totalSpent >= 5000 && c.totalSpent <= 10000)
                    },
                    {
                      name: "Low Value (<₹5,000)", 
                      customers: customerActivity.filter(c => c.totalSpent > 0 && c.totalSpent < 5000)
                    },
                    {
                      name: "No Purchase", 
                      customers: customerActivity.filter(c => c.totalSpent === 0)
                    }
                  ].map((segment, i) => {
                    const count = segment.customers.length;
                    const totalRevenue = segment.customers.reduce((sum, c) => sum + c.totalSpent, 0);
                    const totalRevAll = customerActivity.reduce((sum, c) => sum + c.totalSpent, 0);
                    const percentOfTotal = count / customers.length;
                    const percentOfRevenue = totalRevenue / (totalRevAll || 1);
                    const avgOrderValue = count > 0 ? 
                      (segment.customers.reduce((sum, c) => sum + (c.orderCount > 0 ? c.totalSpent / c.orderCount : 0), 0) / count) : 0;
                    
                    return (
                      <TableRow key={i}>
                        <TableCell>{segment.name}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className="text-right">
                          {(percentOfTotal * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">₹{totalRevenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {(percentOfRevenue * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">₹{avgOrderValue.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition">
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition</CardTitle>
              <CardDescription>New customer growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={acquisitionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end"
                      height={70} 
                      tick={{ dy: 10 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="New Customers" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">New Customers</TableHead>
                      <TableHead className="text-right">Cumulative Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acquisitionData.map((data, index, array) => {
                      const cumulativeCount = array
                        .slice(0, index + 1)
                        .reduce((sum, item) => sum + item.count, 0);
                      
                      return (
                        <TableRow key={data.month}>
                          <TableCell>{data.month}</TableCell>
                          <TableCell className="text-right">{data.count}</TableCell>
                          <TableCell className="text-right">{cumulativeCount}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
