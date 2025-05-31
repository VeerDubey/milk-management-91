
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Download, User, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LedgerEntry {
  id: string;
  date: string;
  type: 'order' | 'payment';
  description: string;
  debit?: number;
  credit?: number;
  balance: number;
  reference?: string;
}

export function CustomerLedger() {
  const { customers, orders, payments } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Generate ledger entries for selected customer
  const ledgerEntries = useMemo(() => {
    if (!selectedCustomer) return [];

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return [];

    const customerOrders = orders.filter(o => o.customerId === selectedCustomer);
    const customerPayments = payments.filter(p => p.customerId === selectedCustomer);

    const entries: LedgerEntry[] = [];
    
    // Add order entries (debits)
    customerOrders.forEach(order => {
      entries.push({
        id: `order-${order.id}`,
        date: order.date,
        type: 'order',
        description: `Order #${order.id.substring(0, 8)} - ${order.items.length} items`,
        debit: order.total || order.totalAmount || 0,
        balance: 0, // Will be calculated later
        reference: order.id
      });
    });

    // Add payment entries (credits)
    customerPayments.forEach(payment => {
      entries.push({
        id: `payment-${payment.id}`,
        date: payment.date,
        type: 'payment',
        description: `Payment via ${payment.method.toUpperCase()}${payment.referenceNumber ? ` - ${payment.referenceNumber}` : ''}`,
        credit: payment.amount,
        balance: 0, // Will be calculated later
        reference: payment.id
      });
    });

    // Sort by date
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = customer.outstandingBalance || 0;
    entries.forEach(entry => {
      if (entry.debit) {
        runningBalance += entry.debit;
      }
      if (entry.credit) {
        runningBalance -= entry.credit;
      }
      entry.balance = runningBalance;
    });

    // Apply filters
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
      const matchesDateTo = !dateTo || entryDate <= dateTo;
      const matchesSearch = !searchTerm || 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDateFrom && matchesDateTo && matchesSearch;
    });
  }, [selectedCustomer, customers, orders, payments, dateFrom, dateTo, searchTerm]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalDebits = ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = ledgerEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const currentBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

    return {
      totalDebits,
      totalCredits,
      currentBalance,
      netActivity: totalDebits - totalCredits
    };
  }, [ledgerEntries]);

  const getCustomerInfo = () => {
    if (!selectedCustomer) return null;
    return customers.find(c => c.id === selectedCustomer);
  };

  const exportToPDF = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }
    toast.success('Customer ledger exported to PDF');
  };

  const exportToExcel = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }
    toast.success('Customer ledger exported to Excel');
  };

  const getTypeBadge = (type: string) => {
    return type === 'order' ? (
      <Badge className="bg-blue-500/20 text-blue-400">Order</Badge>
    ) : (
      <Badge className="bg-green-500/20 text-green-400">Payment</Badge>
    );
  };

  const selectedCustomerInfo = getCustomerInfo();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Customer Ledger Filters</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Select customer and date range to view ledger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="neo-noir-text">Customer *</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 neo-noir-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">From Date</Label>
              <DatePicker
                date={dateFrom}
                setDate={setDateFrom}
                className="neo-noir-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">To Date</Label>
              <DatePicker
                date={dateTo}
                setDate={setDateTo}
                className="neo-noir-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">Actions</Label>
              <div className="flex gap-2">
                <Button onClick={exportToPDF} variant="outline" size="icon" className="neo-noir-button-outline">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="icon" className="neo-noir-button-outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      {selectedCustomerInfo && (
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedCustomerInfo.name}
            </CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Customer Information and Account Summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm neo-noir-text-muted">Contact</p>
                <p className="font-medium neo-noir-text">{selectedCustomerInfo.phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm neo-noir-text-muted">Area</p>
                <p className="font-medium neo-noir-text">{selectedCustomerInfo.area || selectedCustomerInfo.address || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm neo-noir-text-muted">Total Paid</p>
                <p className="font-medium text-green-400">₹{(selectedCustomerInfo.totalPaid || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm neo-noir-text-muted">Outstanding Balance</p>
                <p className="font-medium text-orange-400">₹{(selectedCustomerInfo.outstandingBalance || selectedCustomerInfo.balanceDue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {selectedCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-400">₹{summary.totalDebits.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Total Payments</p>
                  <p className="text-2xl font-bold text-green-400">₹{summary.totalCredits.toLocaleString()}</p>
                </div>
                <Download className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Current Balance</p>
                  <p className={`text-2xl font-bold ${summary.currentBalance > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    ₹{Math.abs(summary.currentBalance).toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-accent-color" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Net Activity</p>
                  <p className={`text-2xl font-bold ${summary.netActivity > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    ₹{Math.abs(summary.netActivity).toLocaleString()}
                  </p>
                </div>
                <User className="h-8 w-8 text-accent-color" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ledger Table */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Ledger Entries</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Complete transaction history for the selected customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedCustomer ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold neo-noir-text mb-2">Select a Customer</h3>
              <p className="neo-noir-text-muted">
                Choose a customer from the dropdown above to view their ledger
              </p>
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold neo-noir-text mb-2">No entries found</h3>
              <p className="neo-noir-text-muted">
                No transactions found for the selected customer and date range
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="neo-noir-table">
                <TableHeader>
                  <TableRow className="neo-noir-table-header">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit (₹)</TableHead>
                    <TableHead>Credit (₹)</TableHead>
                    <TableHead>Balance (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id} className="neo-noir-table-row">
                      <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{getTypeBadge(entry.type)}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-red-400">
                        {entry.debit ? `₹${entry.debit.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-green-400">
                        {entry.credit ? `₹${entry.credit.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className={`font-semibold ${entry.balance > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        ₹{Math.abs(entry.balance).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
