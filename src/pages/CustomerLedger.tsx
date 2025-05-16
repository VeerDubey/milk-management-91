
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subDays, isWithinInterval } from 'date-fns';
import { DownloadIcon, FileTextIcon, ArrowUpDown, FileIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';

export default function CustomerLedger() {
  const { customers, orders, payments } = useData();
  
  // State variables
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending'
  });
  
  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    return customerSearch
      ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
      : customers;
  }, [customers, customerSearch]);
  
  // Get selected customer data
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);
  
  // Get transactions for the selected customer
  const customerTransactions = useMemo(() => {
    if (!selectedCustomerId || !dateRange?.from) return [];
    
    // Get customer orders
    const customerOrders = orders
      .filter(order => order.customerId === selectedCustomerId)
      .map(order => ({
        id: order.id,
        date: new Date(order.date),
        description: `Order #${order.id}`,
        debit: order.total,
        credit: 0,
        balance: 0,
        type: 'order'
      }));
    
    // Get customer payments
    const customerPayments = payments
      .filter(payment => payment.customerId === selectedCustomerId)
      .map(payment => ({
        id: payment.id,
        date: new Date(payment.date),
        description: `Payment #${payment.id}`,
        debit: 0,
        credit: payment.amount,
        balance: 0,
        type: 'payment'
      }));
    
    // Combine and filter by date range
    let allTransactions = [...customerOrders, ...customerPayments]
      .filter(transaction => 
        dateRange.to 
          ? isWithinInterval(transaction.date, { start: dateRange.from, end: dateRange.to })
          : transaction.date >= dateRange.from
      );
    
    // Sort transactions
    allTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate running balance
    let runningBalance = 0;
    allTransactions = allTransactions.map(transaction => {
      runningBalance += transaction.debit - transaction.credit;
      return { ...transaction, balance: runningBalance };
    });
    
    // Apply sorting if needed
    if (sortConfig.key) {
      allTransactions.sort((a, b) => {
        if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return allTransactions;
  }, [selectedCustomerId, dateRange, orders, payments, sortConfig]);
  
  // Calculate summary data
  const summary = useMemo(() => {
    const totalDebit = customerTransactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = customerTransactions.reduce((sum, t) => sum + t.credit, 0);
    const finalBalance = totalDebit - totalCredit;
    
    return {
      totalDebit,
      totalCredit,
      balance: finalBalance
    };
  }, [customerTransactions]);
  
  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  // Handle print ledger
  const handlePrintLedger = () => {
    if (!selectedCustomer) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const dateRangeText = dateRange?.from 
      ? `${format(dateRange.from, 'dd/MM/yyyy')} to ${dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Present'}`
      : 'All time';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Ledger - ${selectedCustomer.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            h2 { text-align: center; margin-bottom: 10px; }
            .header { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .debit { color: #d32f2f; }
            .credit { color: #388e3c; }
            .total-row { font-weight: bold; background-color: #f5f5f5; }
            .summary { margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>Customer Ledger</h2>
          <div class="header">
            <p><strong>Customer:</strong> ${selectedCustomer.name}</p>
            <p><strong>Period:</strong> ${dateRangeText}</p>
            <p><strong>Balance:</strong> ${formatCurrency(summary.balance)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit (₹)</th>
                <th>Credit (₹)</th>
                <th>Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${customerTransactions.map(transaction => `
                <tr>
                  <td>${format(transaction.date, 'dd/MM/yyyy')}</td>
                  <td>${transaction.description}</td>
                  <td class="debit">${transaction.debit > 0 ? formatCurrency(transaction.debit) : ''}</td>
                  <td class="credit">${transaction.credit > 0 ? formatCurrency(transaction.credit) : ''}</td>
                  <td>${formatCurrency(transaction.balance)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td class="debit">${formatCurrency(summary.totalDebit)}</td>
                <td class="credit">${formatCurrency(summary.totalCredit)}</td>
                <td>${formatCurrency(summary.balance)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="summary">
            <p><strong>Summary:</strong></p>
            <p>Total Debit: ${formatCurrency(summary.totalDebit)}</p>
            <p>Total Credit: ${formatCurrency(summary.totalCredit)}</p>
            <p>Balance: ${formatCurrency(summary.balance)}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Ledger</h1>
          <p className="text-muted-foreground">
            View and manage customer transactions and balances
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handlePrintLedger}
            disabled={!selectedCustomerId}
          >
            <FileTextIcon className="h-4 w-4" />
            Print Ledger
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={!selectedCustomerId}
          >
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
            <CardDescription>
              Choose a customer to view their ledger
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerSearch">Search Customer</Label>
              <Input
                id="customerSearch"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerSelect">Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger id="customerSelect">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">No customers found</div>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <DatePickerWithRange 
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
          </CardContent>
          
          {selectedCustomer && (
            <CardFooter className="flex-col items-start gap-2 border-t p-4">
              <div className="w-full">
                <h3 className="font-semibold mb-2">Customer Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{selectedCustomer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedCustomer.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className={summary.balance > 0 ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
                      {formatCurrency(summary.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Showing all transactions for the selected customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCustomerId ? (
              <div className="text-center p-8 border rounded-lg bg-muted/10">
                <FileIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium mb-1">No Customer Selected</h3>
                <p className="text-muted-foreground text-sm">
                  Please select a customer to view their ledger details
                </p>
              </div>
            ) : customerTransactions.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/10">
                <FileTextIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium mb-1">No Transactions</h3>
                <p className="text-muted-foreground text-sm">
                  No transactions found for this customer in the selected date range
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                          onClick={() => requestSort('date')}
                        >
                          Date
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-medium justify-end w-full"
                          onClick={() => requestSort('debit')}
                        >
                          Debit (₹)
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-medium justify-end w-full"
                          onClick={() => requestSort('credit')}
                        >
                          Credit (₹)
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-medium justify-end w-full"
                          onClick={() => requestSort('balance')}
                        >
                          Balance (₹)
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-24 text-center">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerTransactions.map((transaction) => (
                      <TableRow key={`${transaction.id}-${transaction.type}`}>
                        <TableCell className="font-medium">
                          {format(transaction.date, 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right text-red-500">
                          {transaction.debit > 0 ? formatCurrency(transaction.debit) : ''}
                        </TableCell>
                        <TableCell className="text-right text-green-500">
                          {transaction.credit > 0 ? formatCurrency(transaction.credit) : ''}
                        </TableCell>
                        <TableCell className={`text-right ${transaction.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatCurrency(transaction.balance)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={transaction.type === 'order' ? 'outline' : 'secondary'} className="text-xs">
                            {transaction.type === 'order' ? 'Order' : 'Payment'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/20 font-semibold">
                      <TableCell colSpan={2} className="text-right">
                        Total
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {formatCurrency(summary.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right text-green-500">
                        {formatCurrency(summary.totalCredit)}
                      </TableCell>
                      <TableCell className={`text-right ${summary.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatCurrency(summary.balance)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            {selectedCustomerId && (
              <>
                <div className="text-sm text-muted-foreground">
                  Showing {customerTransactions.length} transactions
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">Debit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Credit</span>
                  </div>
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
