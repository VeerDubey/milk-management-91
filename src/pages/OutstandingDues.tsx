
import { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { format, differenceInDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { 
  Search, 
  Phone, 
  Send, 
  FileText, 
  Printer, 
  ArrowUpDown, 
  History, 
  Download, 
  Filter,
  MessageSquare,
  Mail
} from 'lucide-react';

const OutstandingDues = () => {
  const { customers, invoices, payments } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 90)),
    to: new Date()
  });
  const [sortColumn, setSortColumn] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [reminderMessage, setReminderMessage] = useState('');
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [filterOverdue, setFilterOverdue] = useState<string>('all');

  // Generate outstanding dues data
  const duesData = customers.map(customer => {
    // All invoices for this customer
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customer.id);
    
    // Sum of all invoice amounts
    const totalInvoiced = customerInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // All payments from this customer
    const customerPayments = payments.filter(payment => payment.customerId === customer.id);
    
    // Sum of all payments
    const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate outstanding amount
    const outstanding = totalInvoiced - totalPaid;
    
    // Find latest invoice
    const sortedInvoices = [...customerInvoices].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latestInvoice = sortedInvoices[0];
    
    // Find latest payment
    const sortedPayments = [...customerPayments].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latestPayment = sortedPayments[0];
    
    // Calculate days overdue from latest invoice
    const daysOverdue = latestInvoice 
      ? differenceInDays(new Date(), new Date(latestInvoice.date))
      : 0;
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      outstanding,
      daysOverdue,
      latestInvoiceDate: latestInvoice?.date || null,
      latestInvoiceAmount: latestInvoice?.total || 0,
      latestPaymentDate: latestPayment?.date || null,
      latestPaymentAmount: latestPayment?.amount || 0,
      invoiceCount: customerInvoices.length,
      invoices: customerInvoices
    };
  }).filter(data => data.outstanding > 0);

  // Filter by search query
  const filterBySearch = (data: any[]) => {
    if (!searchQuery) return data;
    return data.filter(item => 
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery)
    );
  };

  // Filter by date range
  const filterByDate = (data: any[]) => {
    if (!dateRange || !dateRange.from || !dateRange.to) return data;
    
    return data.filter(item => {
      if (!item.latestInvoiceDate) return false;
      
      const invoiceDate = new Date(item.latestInvoiceDate);
      return invoiceDate >= dateRange.from && invoiceDate <= dateRange.to;
    });
  };

  // Filter by overdue status
  const filterByOverdue = (data: any[]) => {
    switch (filterOverdue) {
      case 'all':
        return data;
      case 'current':
        return data.filter(item => item.daysOverdue < 30);
      case 'overdue-30':
        return data.filter(item => item.daysOverdue >= 30 && item.daysOverdue < 60);
      case 'overdue-60':
        return data.filter(item => item.daysOverdue >= 60 && item.daysOverdue < 90);
      case 'critical':
        return data.filter(item => item.daysOverdue >= 90);
      default:
        return data;
    }
  };

  // Filter by tab
  const filterByTab = (data: any[]) => {
    switch (activeTab) {
      case 'all':
        return data;
      case 'current':
        return data.filter(item => item.daysOverdue < 30);
      case 'overdue':
        return data.filter(item => item.daysOverdue >= 30);
      case 'critical':
        return data.filter(item => item.daysOverdue >= 90);
      default:
        return data;
    }
  };

  // Sort function
  const sortFunction = (a: any, b: any) => {
    let aValue = a[sortColumn];
    let bValue = b[sortColumn];
    
    // Handle dates
    if (sortColumn.includes('Date') && aValue && bValue) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle null values
    if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === null) return sortDirection === 'asc' ? -1 : 1;
    
    // Compare values
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  };

  // Apply all filters and sort
  let filteredData = duesData;
  filteredData = filterBySearch(filteredData);
  filteredData = filterByDate(filteredData);
  filteredData = filterByOverdue(filteredData);
  filteredData = filterByTab(filteredData);
  filteredData.sort(sortFunction);

  // Toggle sort
  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle sending reminder
  const handleSendReminder = (customer: any) => {
    setSelectedCustomer(customer);
    setIsReminderDialogOpen(true);
    setReminderMessage(`Dear ${customer.customerName},\n\nThis is a friendly reminder that you have an outstanding balance of ₹${customer.outstanding.toFixed(2)}.\n\nPlease arrange for payment at your earliest convenience.\n\nThank you,\nVikas Milk Centre`);
  };

  const sendReminder = () => {
    if (!selectedCustomer) return;
    
    // In a real app, this would send an email or SMS
    toast.success(`Payment reminder sent to ${selectedCustomer.customerName}`);
    setIsReminderDialogOpen(false);
  };

  // Handle recording a payment
  const handleAddPayment = (customer: any) => {
    setSelectedCustomer(customer);
    setPaymentAmount(customer.outstanding.toString());
    setPaymentNotes('');
    setPaymentMethod('cash');
    setIsPaymentDialogOpen(true);
  };

  const recordPayment = () => {
    if (!selectedCustomer) return;
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    // In a real app, this would record the payment in the database
    toast.success(`Payment of ₹${amount.toFixed(2)} recorded for ${selectedCustomer.customerName}`);
    setIsPaymentDialogOpen(false);
  };

  // Calculate statistics
  const totalOutstanding = duesData.reduce((sum, item) => sum + item.outstanding, 0);
  const averageOutstanding = duesData.length > 0 ? totalOutstanding / duesData.length : 0;
  const totalOverdue = duesData.filter(item => item.daysOverdue >= 30).reduce((sum, item) => sum + item.outstanding, 0);
  const criticalAccounts = duesData.filter(item => item.daysOverdue >= 90).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outstanding Dues</h1>
        <p className="text-muted-foreground">
          Track and manage customer outstanding balances and payments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {duesData.length} customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Overdue (>30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOverdue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalOverdue / totalOutstanding) * 100).toFixed(1)}% of total outstanding
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Customers with dues >90 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer with dues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Generating report...')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button onClick={() => toast.success('Sending batch reminders...')}>
            <Mail className="mr-2 h-4 w-4" />
            Send Batch Reminders
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Customer</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or phone number"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Overdue Status</label>
              <Select value={filterOverdue} onValueChange={setFilterOverdue}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="current">Current (&lt;30 days)</SelectItem>
                  <SelectItem value="overdue-30">30-60 days</SelectItem>
                  <SelectItem value="overdue-60">60-90 days</SelectItem>
                  <SelectItem value="critical">&gt;90 days (Critical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Outstanding Dues List</CardTitle>
          <Badge variant="outline">{filteredData.length} Records</Badge>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No outstanding dues found matching your criteria</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setDateRange(undefined);
                  setFilterOverdue('all');
                  setActiveTab('all');
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer w-[200px]" onClick={() => toggleSort('customerName')}>
                      <div className="flex items-center">
                        Customer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('outstanding')}>
                      <div className="flex items-center justify-end">
                        Outstanding (₹)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('latestInvoiceDate')}>
                      <div className="flex items-center">
                        Latest Invoice
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('daysOverdue')}>
                      <div className="flex items-center justify-end">
                        Days Overdue
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.customerId}>
                      <TableCell className="font-medium">{item.customerName}</TableCell>
                      <TableCell className="text-right">₹{item.outstanding.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.latestInvoiceDate ? (
                          <div>
                            <div>{format(new Date(item.latestInvoiceDate), 'dd MMM yyyy')}</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{item.latestInvoiceAmount.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          "No invoices"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={
                          item.daysOverdue >= 90 ? "text-red-600 font-medium" :
                          item.daysOverdue >= 60 ? "text-orange-600 font-medium" :
                          item.daysOverdue >= 30 ? "text-amber-600 font-medium" :
                          "text-green-600 font-medium"
                        }>
                          {item.daysOverdue}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span>{item.phone}</span>
                          </div>
                          {item.email && (
                            <div className="flex items-center">
                              <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              <span className="text-sm">{item.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.daysOverdue >= 90 ? (
                          <Badge variant="destructive">Critical</Badge>
                        ) : item.daysOverdue >= 60 ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : item.daysOverdue >= 30 ? (
                          <Badge variant="warning">Overdue</Badge>
                        ) : (
                          <Badge variant="outline">Current</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleAddPayment(item)}
                            title="Record Payment"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleSendReminder(item)}
                            title="Send Reminder"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toast.success(`Viewing history for ${item.customerName}`)}
                            title="View History"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toast.success(`Printing statement for ${item.customerName}`)}
                            title="Print Statement"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {duesData.length} records
          </div>
        </CardFooter>
      </Card>

      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">To: {selectedCustomer?.customerName}</p>
              <div className="flex flex-col text-sm text-muted-foreground">
                <span>Phone: {selectedCustomer?.phone}</span>
                {selectedCustomer?.email && <span>Email: {selectedCustomer?.email}</span>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reminder Message</label>
              <textarea 
                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2"
                value={reminderMessage}
                onChange={e => setReminderMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Send via</label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sms" defaultChecked />
                  <label htmlFor="sms">SMS</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="email" defaultChecked={!!selectedCustomer?.email} disabled={!selectedCustomer?.email} />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="whatsapp" defaultChecked />
                  <label htmlFor="whatsapp">WhatsApp</label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendReminder}>Send Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Customer: {selectedCustomer?.customerName}</p>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Outstanding Amount:</span>
                <span className="font-medium">₹{selectedCustomer?.outstanding.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Amount (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Optional notes"
                value={paymentNotes}
                onChange={e => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={recordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutstandingDues;
