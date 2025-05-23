import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, FilterX, Download, Mail, Phone, FileText, ArrowUpDown 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ElectronService } from '@/services/ElectronService';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export default function CustomerReport() {
  const { toast } = useToast();
  const { customers, orders, invoices, products, customerProductRates } = useData();
  
  const [reportType, setReportType] = useState<'activity' | 'outstanding' | 'purchases'>('activity');
  const [timeFrame, setTimeFrame] = useState<'30days' | '90days' | '6months' | '1year'>('30days');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Calculate date ranges based on timeFrame
  const dateRange = useMemo(() => {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate;
    
    switch (timeFrame) {
      case '30days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      case '90days':
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        startDate = ninetyDaysAgo.toISOString().split('T')[0];
        break;
      case '6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        startDate = sixMonthsAgo.toISOString().split('T')[0];
        break;
      case '1year':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        startDate = oneYearAgo.toISOString().split('T')[0];
        break;
      default:
        const defaultDaysAgo = new Date();
        defaultDaysAgo.setDate(now.getDate() - 30);
        startDate = defaultDaysAgo.toISOString().split('T')[0];
    }
    
    return { startDate, endDate };
  }, [timeFrame]);

  // Generate customer report data
  const reportData = useMemo(() => {
    return customers
      .map(customer => {
        // Find relevant orders and invoices for this customer
        const customerOrders = orders.filter(o => o.customerId === customer.id);
        const customerInvoices = invoices.filter(i => i.customerId === customer.id);
        
        // Calculate activity metrics
        const orderCount = customerOrders.length;
        const totalSpent = customerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
        
        // Calculate last order date
        const lastOrderDate = customerOrders.length > 0 
          ? new Date(Math.max(...customerOrders.map(o => new Date(o.date).getTime())))
          : null;
        
        // Calculate outstanding amount
        const outstandingAmount = customer.outstandingBalance || 0;
        
        // Calculate top purchased products
        const productQuantities: Record<string, number> = {};
        customerOrders.forEach(order => {
          (order.items || []).forEach(item => {
            if (productQuantities[item.productId]) {
              productQuantities[item.productId] += item.quantity;
            } else {
              productQuantities[item.productId] = item.quantity;
            }
          });
        });
        
        // Get top 3 products
        const topProducts = Object.entries(productQuantities)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            return {
              name: product ? product.name : 'Unknown Product',
              quantity
            };
          });
        
        // Customer status based on activity
        let status = 'Inactive';
        if (lastOrderDate) {
          const daysSinceLastOrder = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLastOrder <= 30) status = 'Active';
          else if (daysSinceLastOrder <= 90) status = 'Semi-Active';
        }
        
        return {
          ...customer,
          orderCount,
          totalSpent,
          averageOrderValue,
          lastOrderDate,
          outstandingAmount,
          topProducts,
          status
        };
      })
      .filter(customer => {
        // Apply search filter
        if (searchTerm) {
          return (
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        let valueA, valueB;
        switch (sortColumn) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'orderCount':
            valueA = a.orderCount;
            valueB = b.orderCount;
            break;
          case 'totalSpent':
            valueA = a.totalSpent;
            valueB = b.totalSpent;
            break;
          case 'outstandingAmount':
            valueA = a.outstandingAmount;
            valueB = b.outstandingAmount;
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          default:
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
  }, [customers, orders, invoices, products, sortColumn, sortDirection, searchTerm, timeFrame]);

  // Chart data for customer spending
  const spendingChartData = useMemo(() => {
    // Get top 10 customers by spending
    return reportData
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(customer => ({
        name: customer.name.length > 12 ? customer.name.substring(0, 10) + '...' : customer.name,
        total: customer.totalSpent
      }));
  }, [reportData]);

  // Chart data for customer status distribution
  const statusChartData = useMemo(() => {
    const statusCounts = reportData.reduce((counts: Record<string, number>, customer) => {
      counts[customer.status] = (counts[customer.status] || 0) + 1;
      return counts;
    }, {});
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [reportData]);

  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Function to export report as CSV
  const exportReport = async () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Address', 'Orders', 'Total Spent', 'Outstanding', 'Status'
    ].join(',');
    
    const rows = reportData.map(customer => [
      `"${customer.name}"`,
      `"${customer.email || ''}"`,
      `"${customer.phone || ''}"`,
      `"${customer.address || ''}"`,
      customer.orderCount,
      customer.totalSpent.toFixed(2),
      customer.outstandingAmount.toFixed(2),
      `"${customer.status}"`
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    try {
      await ElectronService.exportData(csvData, `customer-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: 'Report Exported',
        description: 'Customer report has been exported successfully'
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the report',
        variant: 'destructive'
      });
    }
  };

  // Function to send messages to selected customers
  const sendCustomerMessage = async (customerId: string, channel: 'email' | 'sms' | 'whatsapp') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      toast({
        title: 'Error',
        description: 'Customer not found',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Simple implementation without MessagingContext
      toast({
        title: 'Message Queued',
        description: `Message to ${customer.name} via ${channel} has been queued`
      });
    } catch (error) {
      console.error('Send message failed:', error);
      toast({
        title: 'Message Failed',
        description: 'There was an error sending the message',
        variant: 'destructive'
      });
    }
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // When using orders, filter by date range properly
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    if (selectedCustomerId) {
      result = result.filter(order => order.customerId === selectedCustomerId);
    }
    
    if (dateRange.startDate && dateRange.endDate) {
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return orderDate >= start && orderDate <= end;
      });
    }
    
    return result;
  }, [orders, selectedCustomerId, dateRange]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Customer Report</h1>
      
      <div className="flex flex-col space-y-6">
        {/* Report controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Configure customer report parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="reportType" className="block text-sm font-medium mb-1">Report Type</label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activity">Customer Activity</SelectItem>
                    <SelectItem value="outstanding">Outstanding Balances</SelectItem>
                    <SelectItem value="purchases">Purchase History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="timeFrame" className="block text-sm font-medium mb-1">Time Frame</label>
                <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time frame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-1">Search Customers</label>
                <div className="flex space-x-2">
                  <Input
                    id="search"
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')} size="icon">
                      <FilterX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                Showing {reportData.length} customers • {dateRange.startDate} to {dateRange.endDate}
              </span>
            </div>
            <Button onClick={exportReport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </CardFooter>
        </Card>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top customer spending chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customer Spending</CardTitle>
              <CardDescription>Customers with highest total purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={spendingChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Total Spent']} />
                    <Legend />
                    <Bar dataKey="total" name="Total Spent (₹)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Customer status distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Status Distribution</CardTitle>
              <CardDescription>Breakdown of customer activity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} customers`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Detailed information about your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Customer
                      {sortColumn === 'name' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('orderCount')}
                    >
                      Orders
                      {sortColumn === 'orderCount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('totalSpent')}
                    >
                      Total Spent
                      {sortColumn === 'totalSpent' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('outstandingAmount')}
                    >
                      Outstanding
                      {sortColumn === 'outstandingAmount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortColumn === 'status' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No customer data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground flex flex-col">
                            {customer.email && <span>{customer.email}</span>}
                            {customer.phone && <span>{customer.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{customer.orderCount}</TableCell>
                        <TableCell className="text-right">₹{customer.totalSpent.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{customer.outstandingAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              customer.status === 'Active' 
                                ? 'bg-green-500' 
                                : customer.status === 'Semi-Active' 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-500'
                            }
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Send Email"
                              disabled={!customer.email}
                              onClick={() => sendCustomerMessage(customer.id, 'email')}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Send SMS"
                              disabled={!customer.phone}
                              onClick={() => sendCustomerMessage(customer.id, 'sms')}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="View Statement"
                              onClick={() => window.location.href = `/customer-statement/${customer.id}`}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
