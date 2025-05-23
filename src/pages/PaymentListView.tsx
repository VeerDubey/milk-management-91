import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Trash, 
  Edit, 
  Eye, 
  Calendar,
  Printer,
  CheckCircle2,
  ArrowDownUp,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Payment } from '@/types';
import { exportToPdf } from '@/utils/pdfUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function PaymentListView() {
  const { payments, customers, orders, deletePayment, deleteMultiplePayments } = useData();
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle payment selection
  const togglePaymentSelection = (paymentId: string) => {
    if (selectedPayments.includes(paymentId)) {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
    } else {
      setSelectedPayments([...selectedPayments, paymentId]);
    }
  };

  // Handle select all payments
  const toggleSelectAll = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(payment => payment.id));
    }
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Delete selected payments
  const handleDeleteSelected = () => {
    if (!selectedPayments.length) {
      toast.error("No payments selected");
      return;
    }

    if (deleteMultiplePayments) {
      deleteMultiplePayments(selectedPayments);
      setSelectedPayments([]);
      toast.success(`${selectedPayments.length} payment(s) deleted`);
    } else {
      // Fallback if deleteMultiplePayments isn't available
      selectedPayments.forEach(id => deletePayment(id));
      setSelectedPayments([]);
      toast.success(`${selectedPayments.length} payment(s) deleted`);
    }
  };

  // Export payments to PDF
  const handleExport = () => {
    const paymentsToExport = selectedPayments.length > 0 
      ? payments.filter(p => selectedPayments.includes(p.id))
      : filteredPayments;
    
    const headers = ['Payment ID', 'Date', 'Customer', 'Order', 'Amount', 'Method', 'Reference'];
    
    const rows = paymentsToExport.map(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      const order = payment.orderId ? orders.find(o => o.id === payment.orderId) : null;
      
      return [
        payment.id,
        payment.date ? format(new Date(payment.date), 'PP') : 'N/A',
        customer?.name || 'Unknown',
        order ? order.id : 'N/A',
        `₹${payment.amount.toFixed(2)}`,
        payment.paymentMethod,
        payment.referenceNumber || 'N/A'
      ];
    });
    
    exportToPdf(headers, rows, {
      title: 'Payment Report',
      subtitle: `Generated on ${format(new Date(), 'PPP')}`,
      filename: `payments-export-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    });
    
    toast.success("Payment report exported successfully");
  };

  // Print payments
  const handlePrint = () => {
    const paymentsToExport = selectedPayments.length > 0 
      ? payments.filter(p => selectedPayments.includes(p.id))
      : filteredPayments;
    
    const headers = ['Payment ID', 'Date', 'Customer', 'Amount', 'Method', 'Reference'];
    
    const rows = paymentsToExport.map(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      
      return [
        payment.id,
        payment.date ? format(new Date(payment.date), 'PP') : 'N/A',
        customer?.name || 'Unknown',
        `₹${payment.amount.toFixed(2)}`,
        payment.paymentMethod,
        payment.referenceNumber || 'N/A'
      ];
    });
    
    exportToPdf(headers, rows, {
      title: 'Payment Report',
      subtitle: `Generated on ${format(new Date(), 'PPP')}`,
      filename: `payments-print-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      autoPrint: true
    });
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    // Search term filter
    const searchMatch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customers.find(c => c.id === payment.customerId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Customer filter
    const customerMatch = !filterCustomer || payment.customerId === filterCustomer;
    
    // Date filter
    const dateMatch = !filterDate || 
      (payment.date && new Date(payment.date).toDateString() === filterDate.toDateString());
    
    // Payment method filter
    const methodMatch = !filterPaymentMethod || payment.paymentMethod === filterPaymentMethod;
    
    return searchMatch && customerMatch && dateMatch && methodMatch;
  });

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'date':
        return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'customer':
        const customerA = customers.find(c => c.id === a.customerId)?.name || '';
        const customerB = customers.find(c => c.id === b.customerId)?.name || '';
        return direction * customerA.localeCompare(customerB);
      case 'amount':
        return direction * (a.amount - b.amount);
      case 'method':
        return direction * a.paymentMethod.localeCompare(b.paymentMethod);
      default:
        return 0;
    }
  });

  // Get unique payment methods for filter dropdown
  const paymentMethods = [...new Set(payments.map(p => p.paymentMethod))];

  // Get total amount of filtered payments
  const totalAmount = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage customer payments and transaction records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={filteredPayments.length === 0}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={filteredPayments.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="default" onClick={() => window.location.href = '/payment-create'}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Payment List</CardTitle>
          <CardDescription>
            View all payment transactions with filtering and search options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => setSearchTerm('')} disabled={!searchTerm}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Label>Filter:</Label>
                </div>
                
                <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Customers</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <DatePicker
                    date={filterDate}
                    setDate={setFilterDate}
                    placeholderText="Filter by date"
                  />
                  {filterDate && (
                    <Button variant="ghost" size="icon" onClick={() => setFilterDate(undefined)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Methods</SelectItem>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {(filterCustomer || filterDate || filterPaymentMethod) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setFilterCustomer('');
                      setFilterDate(undefined);
                      setFilterPaymentMethod('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            <ScrollArea className="border rounded-md h-[calc(100vh-360px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={filteredPayments.length > 0 && selectedPayments.length === filteredPayments.length} 
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all payments"
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                      <div className="flex items-center">
                        Date {sortBy === 'date' && <ArrowDownUp className="ml-1 h-3 w-3" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('customer')}>
                      <div className="flex items-center">
                        Customer {sortBy === 'customer' && <ArrowDownUp className="ml-1 h-3 w-3" />}
                      </div>
                    </TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                      <div className="flex items-center">
                        Amount {sortBy === 'amount' && <ArrowDownUp className="ml-1 h-3 w-3" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('method')}>
                      <div className="flex items-center">
                        Method {sortBy === 'method' && <ArrowDownUp className="ml-1 h-3 w-3" />}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPayments.map(payment => {
                      const customer = customers.find(c => c.id === payment.customerId);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedPayments.includes(payment.id)} 
                              onCheckedChange={() => togglePaymentSelection(payment.id)}
                              aria-label={`Select payment ${payment.id}`}
                            />
                          </TableCell>
                          <TableCell>{format(new Date(payment.date), 'PP')}</TableCell>
                          <TableCell>{customer?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {payment.referenceNumber ? (
                                <Badge variant="outline">{payment.referenceNumber}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                              {payment.orderId && (
                                <Badge variant="secondary" className="ml-2">
                                  Order: {payment.orderId}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">₹{payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                payment.paymentMethod === 'cash' ? 'default' : 
                                payment.paymentMethod === 'bank' ? 'outline' : 
                                payment.paymentMethod === 'upi' ? 'secondary' : 'destructive'
                              }
                            >
                              {payment.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.location.href = `/payment/${payment.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.location.href = `/payment-edit/${payment.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onClick={() => {
                                    deletePayment(payment.id);
                                    toast.success("Payment deleted");
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {/* Payment summary and batch actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">
                  {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found • Total: 
                  <span className="font-medium text-foreground ml-1">₹{totalAmount.toFixed(2)}</span>
                </p>
              </div>
              {selectedPayments.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedPayments.length} selected</span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteSelected}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedPayments([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
