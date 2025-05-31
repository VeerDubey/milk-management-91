
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Search, Plus, Pencil, Trash2, Download, ArrowUpDown,
  Calendar, CreditCard, AlertCircle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { ElectronService } from '@/services/ElectronService';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function Payments() {
  const { toast } = useToast();
  const {
    customers,
    payments,
    addPayment,
    updatePayment,
    deletePayment
  } = useData();
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    customerId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash' as 'cash' | 'bank' | 'upi' | 'other',
    notes: ''
  });
  
  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = payments;
    
    // Filter by customer
    if (selectedCustomerId !== 'all') {
      filtered = filtered.filter(payment => payment.customerId === selectedCustomerId);
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => {
        const customer = customers.find(c => c.id === payment.customerId);
        return (
          customer?.name.toLowerCase().includes(search) ||
          payment.method?.toLowerCase().includes(search) ||
          payment.notes?.toLowerCase().includes(search)
        );
      });
    }
    
    return filtered;
  }, [payments, selectedCustomerId, searchTerm, customers]);
  
  // Sort payments
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortColumn) {
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'customer':
          const customerA = customers.find(c => c.id === a.customerId);
          const customerB = customers.find(c => c.id === b.customerId);
          valueA = customerA?.name?.toLowerCase() || '';
          valueB = customerB?.name?.toLowerCase() || '';
          break;
        case 'method':
          valueA = a.method?.toLowerCase() || '';
          valueB = b.method?.toLowerCase() || '';
          break;
        default:
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredPayments, sortColumn, sortDirection, customers]);
  
  // Calculate total amount
  const totalAmount = useMemo(() => {
    return sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [sortedPayments]);
  
  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Function to handle form submission
  const handleSubmit = () => {
    if (!paymentFormData.customerId || !paymentFormData.amount) {
      toast({
        title: "Validation Error",
        description: "Customer and amount are required",
        variant: "destructive"
      });
      return;
    }
    
    const paymentData = {
      customerId: paymentFormData.customerId,
      amount: parseFloat(paymentFormData.amount),
      date: paymentFormData.date,
      paymentMethod: paymentFormData.paymentMethod,
      method: paymentFormData.paymentMethod,
      notes: paymentFormData.notes,
      status: 'completed' as const
    };
    
    try {
      addPayment(paymentData);
      toast({
        title: "Payment Added",
        description: "Payment has been recorded successfully"
      });
      
      // Reset form
      setPaymentFormData({
        customerId: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'cash',
        notes: ''
      });
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive"
      });
    }
  };
  
  // Function to confirm delete
  const confirmDelete = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDeleteDialogOpen(true);
  };
  
  // Function to handle delete
  const handleDeletePayment = () => {
    if (!selectedPaymentId) return;
    
    try {
      deletePayment(selectedPaymentId);
      toast({
        title: "Payment Deleted",
        description: "Payment has been deleted successfully"
      });
      setIsDeleteDialogOpen(false);
      setSelectedPaymentId(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Payments</h1>
      
      <div className="flex flex-col space-y-6">
        {/* Filter and search controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>Record and track customer payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="customerFilter" className="block text-sm font-medium mb-1">Filter by Customer</label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger id="customerFilter">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-1">Search Payments</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search payments..."
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button onClick={() => setIsPaymentDialogOpen(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {sortedPayments.length} payment transactions
            </p>
          </CardContent>
        </Card>
        
        {/* Payments table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>List of all payments received from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
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
                      className="cursor-pointer"
                      onClick={() => handleSort('customer')}
                    >
                      Customer
                      {sortColumn === 'customer' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      {sortColumn === 'amount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('method')}
                    >
                      Method
                      {sortColumn === 'method' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No payment records found.
                        <div className="mt-2">
                          <Button variant="outline" onClick={() => setIsPaymentDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Record New Payment
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPayments.map((payment) => {
                      const customer = customers.find(c => c.id === payment.customerId);
                      
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {format(parseISO(payment.date), 'dd MMM yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{customer?.name || 'Unknown Customer'}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{payment.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.method || 'Cash'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.notes || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(payment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                {sortedPayments.length} payments totaling ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Payment dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
            <DialogDescription>
              Enter the payment details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <Select 
                value={paymentFormData.customerId} 
                onValueChange={(value) => setPaymentFormData({...paymentFormData, customerId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({...paymentFormData, amount: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={paymentFormData.date}
                onChange={(e) => setPaymentFormData({...paymentFormData, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Method
              </Label>
              <Select 
                value={paymentFormData.paymentMethod} 
                onValueChange={(value: 'cash' | 'bank' | 'upi' | 'other') => setPaymentFormData({...paymentFormData, paymentMethod: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this payment record.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePayment} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
