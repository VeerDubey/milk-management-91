
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { format, parseISO, addDays, differenceInDays, isAfter } from 'date-fns';
import { Search, AlertCircle, Calendar, FileText, CreditCard, Users, ArrowDown, ArrowUp, Filter, Download } from 'lucide-react';
import { Customer, Payment } from '@/types';

const OutstandingDues = () => {
  const { customers, orders, payments, addPayment } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('outstanding');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'upi' | 'other'>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) || 
        (customer.phone && customer.phone.includes(searchQuery))
      );
    }
    
    // Apply status filter
    if (activeTab === 'overdue') {
      filtered = filtered.filter(customer => {
        const hasOverdueOrders = orders.some(order => {
          if (order.customerId === customer.id && order.paymentStatus === 'unpaid') {
            const orderDate = parseISO(order.date);
            const dueDate = addDays(orderDate, 15); // Assuming 15 days payment term
            return isAfter(new Date(), dueDate);
          }
          return false;
        });
        return hasOverdueOrders || customer.outstandingBalance > 0;
      });
    } else if (activeTab === 'recent') {
      // Show customers with orders in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      filtered = filtered.filter(customer => {
        return orders.some(order => 
          order.customerId === customer.id && 
          new Date(order.date) >= thirtyDaysAgo
        );
      });
    } else if (activeTab === 'high') {
      // Only customers with high outstanding balance (more than ₹5000)
      filtered = filtered.filter(customer => customer.outstandingBalance > 5000);
    }
    
    // Sort customers
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortColumn === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortColumn === 'outstanding') {
        comparison = (a.outstandingBalance || 0) - (b.outstandingBalance || 0);
      } else if (sortColumn === 'lastPayment') {
        const dateA = a.lastPaymentDate ? new Date(a.lastPaymentDate).getTime() : 0;
        const dateB = b.lastPaymentDate ? new Date(b.lastPaymentDate).getTime() : 0;
        comparison = dateA - dateB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [customers, searchQuery, sortColumn, sortDirection, orders, activeTab]);
  
  // Calculate total outstanding amount
  const totalOutstanding = useMemo(() => 
    filteredCustomers.reduce((sum, customer) => sum + (customer.outstandingBalance || 0), 0),
    [filteredCustomers]
  );
  
  // Calculate the average days overdue
  const averageDaysOverdue = useMemo(() => {
    const overdueCustomers = filteredCustomers.filter(customer => customer.outstandingBalance > 0);
    
    if (overdueCustomers.length === 0) return 0;
    
    const totalDaysOverdue = overdueCustomers.reduce((sum, customer) => {
      const lastPaymentDate = customer.lastPaymentDate 
        ? parseISO(customer.lastPaymentDate) 
        : new Date(0);
      
      const daysOverdue = differenceInDays(new Date(), lastPaymentDate) - 15; // Assuming 15 days term
      return sum + (daysOverdue > 0 ? daysOverdue : 0);
    }, 0);
    
    return Math.round(totalDaysOverdue / overdueCustomers.length);
  }, [filteredCustomers]);
  
  // Get customer order history
  const getCustomerOrderHistory = (customerId: string) => {
    return orders
      .filter(order => order.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Get customer payment history
  const getCustomerPaymentHistory = (customerId: string) => {
    return payments
      .filter(payment => payment.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Handle recording a new payment
  const handleRecordPayment = () => {
    if (!selectedCustomer) return;
    
    const amountValue = parseFloat(paymentAmount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    const newPayment: Omit<Payment, 'id'> = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      amount: amountValue,
      date: new Date().toISOString(),
      paymentMethod: paymentMethod,
      notes: paymentNotes
    };
    
    addPayment(newPayment);
    toast.success(`Payment of ₹${amountValue.toFixed(2)} recorded for ${selectedCustomer.name}`);
    
    // Reset form
    setPaymentAmount('0');
    setPaymentNotes('');
    setIsPaymentDialogOpen(false);
  };
  
  // Toggle sort direction or change sort column
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outstanding Dues</h1>
          <p className="text-muted-foreground">
            Track and manage customer outstanding balances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}>
            {viewMode === 'cards' ? 'Table View' : 'Card View'}
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {filteredCustomers.length} customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Days Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDaysOverdue} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on payment terms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOutstanding > 0 ? 
                `${Math.round((payments.reduce((sum, p) => sum + p.amount, 0) / (totalOutstanding + payments.reduce((sum, p) => sum + p.amount, 0))) * 100)}%` : 
                "100%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Of billed amount collected
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="high">High Balance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-2 text-lg font-semibold">No customers found</h2>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "No outstanding dues to display"}
              </p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <Card key={customer.id} className={customer.outstandingBalance > 5000 ? "border-red-200" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{customer.name}</CardTitle>
                      <CardDescription>{customer.phone || 'No phone'}</CardDescription>
                    </div>
                    {customer.outstandingBalance > 0 && (
                      <Badge variant={customer.outstandingBalance > 5000 ? "destructive" : "secondary"}>
                        {customer.outstandingBalance > 5000 ? 'High Balance' : 'Due'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                      <p className="text-2xl font-bold">₹{customer.outstandingBalance.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Payment</p>
                        <p>{customer.lastPaymentDate ? format(parseISO(customer.lastPaymentDate), 'dd MMM yyyy') : 'Never'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Amount</p>
                        <p>₹{customer.lastPaymentAmount?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <Button variant="outline" onClick={() => {
                      setSelectedCustomer(customer);
                      setPaymentAmount(customer.outstandingBalance.toString());
                      setIsPaymentDialogOpen(true);
                    }}>
                      Record Payment
                    </Button>
                    <Button variant="outline">
                      View History
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                    Customer
                    {sortColumn === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('outstanding')}>
                    Outstanding Balance
                    {sortColumn === 'outstanding' && (
                      sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('lastPayment')}>
                    Last Payment
                    {sortColumn === 'lastPayment' && (
                      sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">No customers found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery ? "Try adjusting your search" : "No outstanding dues to display"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone || 'No phone'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={customer.outstandingBalance > 5000 ? "font-bold text-destructive" : ""}>
                          ₹{customer.outstandingBalance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {customer.lastPaymentDate ? (
                          <div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{format(parseISO(customer.lastPaymentDate), 'dd MMM yyyy')}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">₹{customer.lastPaymentAmount?.toFixed(2) || '0.00'}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No payment history</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.outstandingBalance > 5000 ? (
                          <Badge variant="destructive">High Balance</Badge>
                        ) : customer.outstandingBalance > 0 ? (
                          <Badge variant="secondary">Due</Badge>
                        ) : (
                          <Badge variant="outline">Paid</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedCustomer(customer);
                            setPaymentAmount(customer.outstandingBalance.toString());
                            setIsPaymentDialogOpen(true);
                          }}>
                            <CreditCard className="h-3.5 w-3.5 mr-1" />
                            Pay
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            History
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedCustomer && `Record payment for ${selectedCustomer.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="method" className="text-sm font-medium">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Input
                id="notes"
                placeholder="Optional notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
            
            {selectedCustomer && selectedCustomer.outstandingBalance > 0 && (
              <div className="flex items-center rounded-md border p-4 mt-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">Outstanding Balance</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{selectedCustomer.outstandingBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutstandingDues;
