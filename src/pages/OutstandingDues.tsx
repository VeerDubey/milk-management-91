import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { 
  AlertCircle, 
  Check, 
  CreditCard, 
  DollarSign, 
  Filter, 
  Search, 
  Plus,
  SortDesc,
  SortAsc,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Payment } from '@/types';

const OutstandingDues = () => {
  const navigate = useNavigate();
  const { customers, orders, payments, addPayment } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minAmount, setMinAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Calculate outstanding amount for each customer
  const customersWithOutstanding = useMemo(() => {
    return customers.map(customer => {
      // Get all orders for this customer
      const customerOrders = orders.filter(order => order.customerId === customer.id);
      const totalOrdered = customerOrders.reduce((total, order) => total + order.totalAmount, 0);
      
      // Get all payments for this customer
      const customerPayments = payments.filter(payment => payment.customerId === customer.id);
      const totalPaid = customerPayments.reduce((total, payment) => total + payment.amount, 0);
      
      // Calculate outstanding
      const outstandingAmount = totalOrdered - totalPaid;
      
      // Get last payment info if available
      const lastPayment = customerPayments.length > 0
        ? customerPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;
      
      return {
        ...customer,
        totalOrdered,
        totalPaid,
        outstandingAmount,
        lastPaymentDate: lastPayment?.date,
        lastPaymentAmount: lastPayment?.amount,
      };
    }).filter(customer => {
      // Filter out customers with no outstanding amount
      const minAmountValue = minAmount ? parseFloat(minAmount) : 0;
      return customer.outstandingAmount > minAmountValue;
    });
  }, [customers, orders, payments, minAmount]);

  // Apply search and filters
  const filteredCustomers = useMemo(() => {
    return customersWithOutstanding
      .filter(customer => {
        if (!searchQuery) return true;
        return (
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.phone && customer.phone.includes(searchQuery)) ||
          (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .filter(customer => {
        if (!selectedCustomerId) return true;
        return customer.id === selectedCustomerId;
      })
      .sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.outstandingAmount - b.outstandingAmount 
          : b.outstandingAmount - a.outstandingAmount;
      });
  }, [customersWithOutstanding, searchQuery, selectedCustomerId, sortOrder]);

  // Calculate total outstanding
  const totalOutstanding = useMemo(() => {
    return filteredCustomers.reduce((total, customer) => total + customer.outstandingAmount, 0);
  }, [filteredCustomers]);

  const handleAddPayment = (customerId: string, customerName: string, amount: number) => {
    const payment: Omit<Payment, "id"> = {
      customerId,
      customerName,
      amount,
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: paymentMethod as 'cash' | 'bank' | 'upi' | 'other',
      notes: paymentNotes
    };

    addPayment(payment);
    toast.success(`Payment of ₹${amount.toFixed(2)} added for ${customerName}`);
    setSelectedCustomerId("");
    setPaymentAmount("");
    setPaymentMethod("cash");
    setPaymentNotes("");
    setPaymentDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outstanding Dues</h1>
          <p className="text-muted-foreground">
            Manage and track customer outstanding balances
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Add a payment to reduce outstanding balance
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select 
                  value={selectedCustomerId} 
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersWithOutstanding
                      .filter(c => c.outstandingAmount > 0)
                      .map(customer => (
                        <SelectItem 
                          key={customer.id} 
                          value={customer.id}
                        >
                          {customer.name} (₹{customer.outstandingAmount.toLocaleString()})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    className="pl-8"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes about this payment"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => handleAddPayment(selectedCustomerId, customers.find(c => c.id === selectedCustomerId)?.name || '', Number(paymentAmount))}>Record Payment</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Outstanding Balances</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-8 w-full sm:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="mr-2 h-4 w-4" />
                ) : (
                  <SortDesc className="mr-2 h-4 w-4" />
                )}
                Amount
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium leading-none">Filter Options</h4>
                    <div className="space-y-2">
                      <Label htmlFor="customer-filter">Customer</Label>
                      <Select
                        value={selectedCustomerId}
                        onValueChange={setSelectedCustomerId}
                      >
                        <SelectTrigger id="customer-filter">
                          <SelectValue placeholder="All Customers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Customers</SelectItem>
                          {customersWithOutstanding.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-amount">Minimum Amount</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                        <Input
                          id="min-amount"
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedCustomerId('');
                          setMinAmount('');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Separator />
          <CardDescription className="flex justify-between">
            <span>Showing {filteredCustomers.length} customers with outstanding balance</span>
            <span className="font-medium">
              Total Outstanding: ₹{totalOutstanding.toLocaleString()}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="overflow-hidden">
                  <div className="bg-muted h-1">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(
                          (customer.totalPaid / (customer.totalOrdered || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{customer.name}</h3>
                        {customer.phone && (
                          <span className="text-sm text-muted-foreground">
                            ({customer.phone})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customer.address}
                      </p>
                      {customer.lastPaymentDate && (
                        <p className="text-xs text-muted-foreground">
                          Last payment: ₹{customer.lastPaymentAmount?.toLocaleString()} on{' '}
                          {format(new Date(customer.lastPaymentDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <span className="font-bold text-lg">
                        ₹{customer.outstandingAmount.toLocaleString()}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setPaymentAmount(customer.outstandingAmount.toString());
                            const dialogTrigger = document.querySelector('[data-state="closed"]');
                            if (dialogTrigger instanceof HTMLButtonElement) {
                              dialogTrigger.click();
                            }
                          }}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/customer-detail/${customer.id}`)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No outstanding balances found</h3>
                <p className="text-muted-foreground mb-4">
                  There are no customers with outstanding balance matching your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCustomerId('');
                    setMinAmount('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/outstanding')}>
            Back to Overview
          </Button>
          <Button variant="outline" onClick={() => navigate('/payments')}>
            View All Payments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OutstandingDues;
