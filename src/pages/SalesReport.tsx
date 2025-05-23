
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, ArrowUpDown, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Calendar, Filter 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, subDays, subMonths, isWithinInterval } from 'date-fns';
import { ElectronService } from '@/services/ElectronService';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DateRangePicker, DateRangePickerValue 
} from '@/components/ui/date-range-picker';

export default function SalesReport() {
  const { toast } = useToast();
  const { products, orders, invoices, customers } = useData();
  
  // State for report configuration
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'product' | 'customer'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Get unique product categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [products]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return isWithinInterval(orderDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  }, [orders, dateRange]);

  // Filter invoices by date range
  const filteredInvoices = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return invoices;
    
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return isWithinInterval(invoiceDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  }, [invoices, dateRange]);

  // Generate report data based on reportType
  const reportData = useMemo(() => {
    // Daily sales data
    if (reportType === 'daily') {
      const dailySalesMap = new Map();
      
      filteredInvoices.forEach(invoice => {
        const dateStr = invoice.date.split('T')[0];
        const currentTotal = dailySalesMap.get(dateStr) || 0;
        dailySalesMap.set(dateStr, currentTotal + (invoice.total || 0));
      });
      
      return Array.from(dailySalesMap.entries())
        .map(([date, amount]) => ({
          date,
          amount
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    // Monthly sales data
    else if (reportType === 'monthly') {
      const monthlySalesMap = new Map();
      
      filteredInvoices.forEach(invoice => {
        const month = invoice.date.substring(0, 7); // YYYY-MM
        const currentTotal = monthlySalesMap.get(month) || 0;
        monthlySalesMap.set(month, currentTotal + (invoice.total || 0));
      });
      
      return Array.from(monthlySalesMap.entries())
        .map(([month, amount]) => ({
          month,
          amount
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    }
    
    // Product-wise sales data
    else if (reportType === 'product') {
      const productSalesMap = new Map();
      
      filteredOrders.forEach(order => {
        (order.items || []).forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            // Apply category filter
            if (filterCategory !== 'all' && product.category !== filterCategory) {
              return;
            }
            
            const currentData = productSalesMap.get(product.id) || {
              productId: product.id,
              productName: product.name,
              category: product.category,
              totalQuantity: 0,
              totalAmount: 0
            };
            
            currentData.totalQuantity += item.quantity;
            currentData.totalAmount += item.quantity * item.rate;
            productSalesMap.set(product.id, currentData);
          }
        });
      });
      
      return Array.from(productSalesMap.values());
    }
    
    // Customer-wise sales data
    else if (reportType === 'customer') {
      const customerSalesMap = new Map();
      
      filteredInvoices.forEach(invoice => {
        const customer = customers.find(c => c.id === invoice.customerId);
        if (customer) {
          const currentData = customerSalesMap.get(customer.id) || {
            customerId: customer.id,
            customerName: customer.name,
            totalOrders: 0,
            totalAmount: 0
          };
          
          currentData.totalOrders++;
          currentData.totalAmount += invoice.total || 0;
          customerSalesMap.set(customer.id, currentData);
        }
      });
      
      return Array.from(customerSalesMap.values());
    }
    
    return [];
  }, [reportType, filteredInvoices, filteredOrders, products, customers, filterCategory]);

  // Filter data based on searchTerm
  const filteredData = useMemo(() => {
    if (!searchTerm) return reportData;
    
    return reportData.filter(item => {
      if (reportType === 'daily' || reportType === 'monthly') {
        // Search in date/month string
        return item.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.month?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      else if (reportType === 'product') {
        // Search in product name and category
        return item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.category.toLowerCase().includes(searchTerm.toLowerCase());
      }
      else if (reportType === 'customer') {
        // Search in customer name
        return item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      return false;
    });
  }, [reportData, searchTerm, reportType]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valueA, valueB;
      
      if (reportType === 'daily') {
        if (sortColumn === 'date') {
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
        } else { // 'amount'
          valueA = a.amount;
          valueB = b.amount;
        }
      }
      else if (reportType === 'monthly') {
        if (sortColumn === 'month') {
          valueA = a.month;
          valueB = b.month;
        } else { // 'amount'
          valueA = a.amount;
          valueB = b.amount;
        }
      }
      else if (reportType === 'product') {
        if (sortColumn === 'name') {
          valueA = a.productName.toLowerCase();
          valueB = b.productName.toLowerCase();
        } else if (sortColumn === 'category') {
          valueA = a.category.toLowerCase();
          valueB = b.category.toLowerCase();
        } else if (sortColumn === 'quantity') {
          valueA = a.totalQuantity;
          valueB = b.totalQuantity;
        } else { // 'amount'
          valueA = a.totalAmount;
          valueB = b.totalAmount;
        }
      }
      else if (reportType === 'customer') {
        if (sortColumn === 'name') {
          valueA = a.customerName.toLowerCase();
          valueB = b.customerName.toLowerCase();
        } else if (sortColumn === 'orders') {
          valueA = a.totalOrders;
          valueB = b.totalOrders;
        } else { // 'amount'
          valueA = a.totalAmount;
          valueB = b.totalAmount;
        }
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredData, sortColumn, sortDirection, reportType]);

  // Calculate summary data
  const summary = useMemo(() => {
    let totalSales = 0;
    let totalOrders = 0;
    let averageSale = 0;
    
    if (reportType === 'daily' || reportType === 'monthly') {
      totalSales = reportData.reduce((sum, item) => sum + item.amount, 0);
      totalOrders = filteredOrders.length;
    } else if (reportType === 'product') {
      totalSales = reportData.reduce((sum, item) => sum + item.totalAmount, 0);
      totalOrders = filteredOrders.length;
    } else if (reportType === 'customer') {
      totalSales = reportData.reduce((sum, item) => sum + item.totalAmount, 0);
      totalOrders = reportData.reduce((sum, item) => sum + item.totalOrders, 0);
    }
    
    averageSale = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    return { totalSales, totalOrders, averageSale };
  }, [reportData, filteredOrders, reportType]);

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
    let headers: string[] = [];
    let rows: string[][] = [];
    
    if (reportType === 'daily') {
      headers = ['Date', 'Amount'];
      rows = sortedData.map(item => [
        item.date,
        item.amount.toFixed(2)
      ]);
    } 
    else if (reportType === 'monthly') {
      headers = ['Month', 'Amount'];
      rows = sortedData.map(item => [
        item.month,
        item.amount.toFixed(2)
      ]);
    }
    else if (reportType === 'product') {
      headers = ['Product', 'Category', 'Quantity Sold', 'Total Sales'];
      rows = sortedData.map(item => [
        item.productName,
        item.category,
        item.totalQuantity.toString(),
        item.totalAmount.toFixed(2)
      ]);
    }
    else if (reportType === 'customer') {
      headers = ['Customer', 'Orders', 'Total Spent'];
      rows = sortedData.map(item => [
        item.customerName,
        item.totalOrders.toString(),
        item.totalAmount.toFixed(2)
      ]);
    }
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    try {
      await ElectronService.exportData(csvData, `sales-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: 'Report Exported',
        description: 'Sales report has been exported successfully'
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

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Format dates for charts
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMM dd');
  };

  // Format months for charts
  const formatMonth = (monthString: string) => {
    const date = parseISO(`${monthString}-01`);
    return format(date, 'MMM yyyy');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Sales Report</h1>
      
      <div className="flex flex-col space-y-6">
        {/* Report controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Configure sales report parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="reportType" className="block text-sm font-medium mb-1">Report Type</label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
                  <SelectTrigger id="reportType">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Sales</SelectItem>
                    <SelectItem value="monthly">Monthly Sales</SelectItem>
                    <SelectItem value="product">Sales by Product</SelectItem>
                    <SelectItem value="customer">Sales by Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3">
                <label htmlFor="chartType" className="block text-sm font-medium mb-1">Chart Type</label>
                <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
                  <SelectTrigger id="chartType">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <DateRangePicker
                  value={dateRange}
                  onValueChange={setDateRange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Actions</label>
                <Button onClick={exportReport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              {reportType === 'product' && (
                <div className="w-full sm:w-auto">
                  <label htmlFor="categoryFilter" className="block text-sm font-medium mb-1">Category Filter</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger id="categoryFilter" className="w-[200px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
                <Input
                  id="search"
                  placeholder={`Search ${reportType === 'product' ? 'products' : reportType === 'customer' ? 'customers' : 'dates'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                For the selected period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                For the selected period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.averageSale.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per order
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === 'daily' && 'Daily Sales Trend'}
              {reportType === 'monthly' && 'Monthly Sales Trend'}
              {reportType === 'product' && 'Product Sales Distribution'}
              {reportType === 'customer' && 'Customer Sales Distribution'}
            </CardTitle>
            <CardDescription>
              {reportType === 'daily' && 'Sales performance over days'}
              {reportType === 'monthly' && 'Sales performance over months'}
              {reportType === 'product' && 'Sales breakdown by product'}
              {reportType === 'customer' && 'Sales breakdown by customer'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {(reportType === 'daily' || reportType === 'monthly') && chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sortedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={reportType === 'daily' ? "date" : "month"} 
                      tickFormatter={reportType === 'daily' ? formatDate : formatMonth}
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [`₹${value}`, 'Sales']}
                      labelFormatter={(value) => reportType === 'daily' ? formatDate(value as string) : formatMonth(value as string)}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Sales (₹)" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {(reportType === 'daily' || reportType === 'monthly') && chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={reportType === 'daily' ? "date" : "month"} 
                      tickFormatter={reportType === 'daily' ? formatDate : formatMonth}
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                    />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [`₹${value}`, 'Sales']}
                      labelFormatter={(value) => reportType === 'daily' ? formatDate(value as string) : formatMonth(value as string)}
                    />
                    <Legend />
                    <Bar dataKey="amount" name="Sales (₹)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {reportType === 'product' && chartType !== 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedData.slice(0, 10)} // Top 10 products
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="productName"
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Sales (₹)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {reportType === 'customer' && chartType !== 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedData.slice(0, 10)} // Top 10 customers
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="customerName"
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Sales (₹)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        reportType === 'product' 
                          ? sortedData.slice(0, 10).map(item => ({ 
                              name: item.productName, 
                              value: item.totalAmount 
                            }))
                          : reportType === 'customer'
                          ? sortedData.slice(0, 10).map(item => ({
                              name: item.customerName,
                              value: item.totalAmount
                            }))
                          : sortedData.map(item => ({
                              name: reportType === 'daily' ? formatDate(item.date) : formatMonth(item.month),
                              value: item.amount
                            }))
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sortedData.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed data table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Sales Data</CardTitle>
            <CardDescription>
              {reportType === 'daily' && 'Sales by date'}
              {reportType === 'monthly' && 'Sales by month'}
              {reportType === 'product' && 'Sales by product'}
              {reportType === 'customer' && 'Sales by customer'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {reportType === 'daily' && (
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('date')}
                      >
                        Date
                        {sortColumn === 'date' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('amount')}
                      >
                        Sales Amount
                        {sortColumn === 'amount' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                    </TableRow>
                  )}

                  {reportType === 'monthly' && (
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('month')}
                      >
                        Month
                        {sortColumn === 'month' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('amount')}
                      >
                        Sales Amount
                        {sortColumn === 'amount' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                    </TableRow>
                  )}

                  {reportType === 'product' && (
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        Product
                        {sortColumn === 'name' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('category')}
                      >
                        Category
                        {sortColumn === 'category' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('quantity')}
                      >
                        Quantity Sold
                        {sortColumn === 'quantity' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('amount')}
                      >
                        Total Sales
                        {sortColumn === 'amount' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                    </TableRow>
                  )}

                  {reportType === 'customer' && (
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
                        onClick={() => handleSort('orders')}
                      >
                        Orders
                        {sortColumn === 'orders' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('amount')}
                      >
                        Total Spent
                        {sortColumn === 'amount' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={reportType === 'product' ? 4 : 3} className="text-center py-8">
                        No data found for the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportType === 'daily' && sortedData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  
                  {reportType === 'monthly' && sortedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatMonth(item.month)}</TableCell>
                      <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  
                  {reportType === 'product' && sortedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.totalQuantity}</TableCell>
                      <TableCell className="text-right">₹{item.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  
                  {reportType === 'customer' && sortedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell className="text-right">{item.totalOrders}</TableCell>
                      <TableCell className="text-right">₹{item.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
