
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, getMonth, getYear } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Expense } from '@/types';
import { exportToPdf } from '@/utils/pdfUtils';
import { 
  Plus, 
  Search, 
  File, 
  Printer, 
  Calendar, 
  Download, 
  Edit, 
  Trash2, 
  FileText, 
  Filter, 
  PieChart, 
  TrendingUp, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Form schema
const expenseFormSchema = z.object({
  date: z.string().nonempty("Date is required"),
  category: z.string().nonempty("Category is required"),
  description: z.string().nonempty("Description is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  receipt: z.string().optional()
});

// Category options
const EXPENSE_CATEGORIES = [
  'Utilities',
  'Rent',
  'Salaries',
  'Supplies',
  'Maintenance',
  'Transportation',
  'Equipment',
  'Marketing',
  'Insurance',
  'Taxes',
  'Miscellaneous'
];

// Payment methods
const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Check',
  'Digital Wallet',
  'UPI'
];

// Colors for charts
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', 
  '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57', '#83a6ed'
];

export default function ExpensesRevamped() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('this-month');
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  
  // Form initialization
  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
      amount: 0,
      paymentMethod: 'Cash',
      notes: '',
      receipt: ''
    }
  });
  
  // Handle form submission
  const handleFormSubmit = (values: z.infer<typeof expenseFormSchema>) => {
    if (isEditMode && currentEditId) {
      updateExpense(currentEditId, {
        ...values,
        updatedAt: new Date().toISOString()
      });
      toast.success("Expense updated successfully");
    } else {
      addExpense({
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast.success("Expense added successfully");
    }
    
    closeForm();
  };
  
  // Reset and close form
  const closeForm = () => {
    form.reset();
    setIsFormOpen(false);
    setIsEditMode(false);
    setCurrentEditId(null);
  };
  
  // Open edit form
  const openEditForm = (expense: Expense) => {
    setIsEditMode(true);
    setCurrentEditId(expense.id);
    form.reset({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod || 'Cash',
      notes: expense.notes || '',
      receipt: expense.receipt || ''
    });
    setIsFormOpen(true);
  };
  
  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      toast.success("Expense deleted successfully");
    }
  };
  
  // Handle receipt preview
  const handleReceiptPreview = (receiptUrl: string | undefined) => {
    if (!receiptUrl) {
      toast.error("No receipt available");
      return;
    }
    
    setReceiptPreviewUrl(receiptUrl);
  };
  
  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    // Search filter
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    // Date range filter
    let matchesDateRange = true;
    const expenseDate = parseISO(expense.date);
    
    if (dateRangeFilter === 'this-month') {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      matchesDateRange = isWithinInterval(expenseDate, { start, end });
    } else if (dateRangeFilter === 'last-month') {
      const lastMonth = subMonths(new Date(), 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      matchesDateRange = isWithinInterval(expenseDate, { start, end });
    } else if (dateRangeFilter === 'last-3-months') {
      const threeMonthsAgo = subMonths(new Date(), 3);
      matchesDateRange = expenseDate >= threeMonthsAgo;
    }
    
    return matchesSearch && matchesCategory && matchesDateRange;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate totals for the filtered expenses
  const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate expense by category
  const expensesByCategory = EXPENSE_CATEGORIES.map(category => {
    const total = filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category,
      value: total
    };
  }).filter(item => item.value > 0);
  
  // Calculate monthly trends (last 6 months)
  const monthlyTrends = (() => {
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(today, i);
      const monthName = format(month, 'MMM');
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return getMonth(expenseDate) === getMonth(month) && getYear(expenseDate) === getYear(month);
      });
      
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      data.push({
        name: monthName,
        total
      });
    }
    
    return data;
  })();
  
  // Handle export to PDF
  const handleExportPdf = () => {
    const headers = ["Date", "Category", "Description", "Amount", "Payment Method", "Notes"];
    
    const rows = filteredExpenses.map(expense => [
      format(parseISO(expense.date), 'dd/MM/yyyy'),
      expense.category,
      expense.description,
      `₹${expense.amount.toFixed(2)}`,
      expense.paymentMethod || 'Cash',
      expense.notes || '-'
    ]);
    
    exportToPdf(headers, rows, {
      title: 'Expense Report',
      subtitle: `Generated on ${format(new Date(), 'dd/MM/yyyy')}`,
      filename: `expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    });
    
    toast.success("PDF exported successfully");
  };
  
  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Could not open print window. Please allow popups.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; text-align: left; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            h1 { margin: 0; }
            .print-date { text-align: right; }
            .total { font-weight: bold; margin-top: 20px; text-align: right; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Expense Report</h1>
            <div class="print-date">Generated: ${format(new Date(), 'PPP')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(expense => `
                <tr>
                  <td>${format(parseISO(expense.date), 'dd/MM/yyyy')}</td>
                  <td>${expense.category}</td>
                  <td>${expense.description}</td>
                  <td>₹${expense.amount.toFixed(2)}</td>
                  <td>${expense.paymentMethod || 'Cash'}</td>
                  <td>${expense.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total: ₹${totalExpense.toFixed(2)}
          </div>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your business expenses</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportPdf}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={() => {
              form.reset({
                date: format(new Date(), 'yyyy-MM-dd'),
                category: '',
                description: '',
                amount: 0,
                paymentMethod: 'Cash',
                notes: '',
                receipt: ''
              });
              setIsFormOpen(true);
            }}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {(() => {
                switch (dateRangeFilter) {
                  case 'this-month':
                    return `This Month (${format(new Date(), 'MMMM')})`;
                  case 'last-month':
                    return `Last Month (${format(subMonths(new Date(), 1), 'MMMM')})`;
                  case 'last-3-months':
                    return 'Last 3 Months';
                  default:
                    return 'All Time';
                }
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const totalAllTime = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                const percentage = totalAllTime > 0 ? (totalExpense / totalAllTime) * 100 : 0;
                return `${percentage.toFixed(1)}% of total expenses`;
              })()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              if (expensesByCategory.length === 0) {
                return (
                  <div className="text-muted-foreground">No expenses</div>
                );
              }
              
              const topCategory = [...expensesByCategory].sort((a, b) => b.value - a.value)[0];
              
              return (
                <>
                  <div className="text-2xl font-bold">
                    {topCategory.name}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ₹{topCategory.value.toFixed(2)} ({((topCategory.value / totalExpense) * 100).toFixed(1)}%)
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">
            <FileText className="mr-2 h-4 w-4" />
            Expense List
          </TabsTrigger>
          <TabsTrigger value="chart">
            <PieChart className="mr-2 h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="trend">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select
            value={categoryFilter || ""}
            onValueChange={(value) => setCategoryFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {EXPENSE_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={dateRangeFilter}
            onValueChange={setDateRangeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by date" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All time</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="last-3-months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="list" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {format(parseISO(expense.date), 'dd/MM/yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {expense.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                          ₹{expense.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>{expense.paymentMethod || 'Cash'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {expense.receipt && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleReceiptPreview(expense.receipt)}
                            className="h-8 w-8"
                          >
                            <File className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditForm(expense)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(expense.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>
                Distribution of expenses across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {expensesByCategory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']} 
                    />
                    <Legend />
                  </RechartPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category (Bar Chart)</CardTitle>
              <CardDescription>
                Comparison of expenses across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {expensesByCategory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expensesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Amount" 
                      fill="#8884d8" 
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trend</CardTitle>
              <CardDescription>
                Expense trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Total']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Expenses" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Bar Chart</CardTitle>
              <CardDescription>
                Monthly expense comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Total']} />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    name="Total Expenses" 
                    fill="#8884d8"
                    background={{ fill: "#eee" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expense Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) closeForm();
        setIsFormOpen(open);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the expense details below.' 
                : 'Enter the expense details below to add to your records.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map(method => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="receipt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormDescription>
                      Enter a URL to your receipt image or document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  {isEditMode ? 'Update Expense' : 'Add Expense'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Receipt Preview Dialog */}
      <Dialog open={!!receiptPreviewUrl} onOpenChange={() => setReceiptPreviewUrl(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-2 overflow-auto" style={{ maxHeight: 'calc(80vh - 150px)' }}>
            {receiptPreviewUrl && (
              <img 
                src={receiptPreviewUrl} 
                alt="Receipt" 
                className="max-w-full h-auto object-contain mx-auto"
                onError={() => {
                  toast.error("Failed to load receipt image");
                  setReceiptPreviewUrl(null);
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptPreviewUrl(null)}>
              Close
            </Button>
            {receiptPreviewUrl && (
              <Button 
                onClick={() => {
                  window.open(receiptPreviewUrl, '_blank');
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
