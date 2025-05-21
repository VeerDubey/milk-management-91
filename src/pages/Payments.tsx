import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Payment, Customer } from "@/types";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  FileSpreadsheet,
  FileText, // Changed from FilePdf
  SendHorizonal,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  CalendarRange 
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isAfter, isBefore, isEqual, subDays } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { BatchReminderDialog } from "@/components/payments/BatchReminderDialog";
import { PaymentExportDialog } from "@/components/payments/PaymentExportDialog";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Payments = () => {
  const { customers, payments, addPayment, deletePayment, deleteMultiplePayments } = useData();
  const [open, setOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    customerId: "",
    amount: "",
    paymentMethod: "cash" as "cash" | "bank" | "upi" | "other",
    notes: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: "date",
    direction: "desc",
  });
  const [filterConfig, setFilterConfig] = useState({
    paymentMethod: "all",
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date()
    } as DateRange,
    customerId: ""
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Reset form when dialog closes
  const resetForm = () => {
    setFormData({
      customerId: "",
      amount: "",
      paymentMethod: "cash",
      notes: "",
    });
    setPaymentDate(new Date());
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "amount") {
      // Only allow numbers with up to 2 decimal places
      if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Customer and amount are required");
      return;
    }

    addPayment({
      customerId: formData.customerId,
      amount: parseFloat(formData.amount),
      date: format(paymentDate, "yyyy-MM-dd"),
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });

    toast.success("Payment recorded successfully");
    setOpen(false);
    resetForm();
  };

  const handleDeletePayment = (payment: Payment) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      deletePayment(payment.id);
      toast.success("Payment deleted successfully");
      // Remove from selected if present
      setSelectedPayments(prev => prev.filter(id => id !== payment.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPayments.length === 0) {
      toast.error("No payments selected");
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedPayments.length} selected payments?`)) {
      deleteMultiplePayments(selectedPayments);
      setSelectedPayments([]);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // For select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFilteredIds = filteredPayments.map(payment => payment.id);
      setSelectedPayments(allFilteredIds);
    } else {
      setSelectedPayments([]);
    }
  };

  // For individual row checkbox
  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  // Get customer name by ID
  const getCustomerName = (customerId: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  // Filter payments based on search query and other filters
  const filteredPayments = useMemo(() => {
    return payments
      .filter(payment => {
        // Tab filter
        if (activeTab === "today" && 
            format(new Date(payment.date), "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")) {
          return false;
        }
        if (activeTab === "week" && 
            !isAfter(new Date(payment.date), subDays(new Date(), 7))) {
          return false;
        }
        if (activeTab === "month" && 
            !isAfter(new Date(payment.date), subDays(new Date(), 30))) {
          return false;
        }

        // Search query
        const customerName = getCustomerName(payment.customerId).toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === "" || 
          customerName.includes(searchLower) ||
          payment.date.includes(searchLower) ||
          payment.amount.toString().includes(searchLower) ||
          payment.paymentMethod.toLowerCase().includes(searchLower) ||
          (payment.notes && payment.notes.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;

        // Payment method filter
        if (filterConfig.paymentMethod !== "all" && 
            payment.paymentMethod !== filterConfig.paymentMethod) {
          return false;
        }

        // Customer filter
        if (filterConfig.customerId && payment.customerId !== filterConfig.customerId) {
          return false;
        }

        // Date range filter
        if (filterConfig.dateRange.from && filterConfig.dateRange.to) {
          const paymentDate = parseISO(payment.date);
          const fromDate = filterConfig.dateRange.from;
          const toDate = filterConfig.dateRange.to;

          // Adding time components to ensure correct comparison
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);

          return (
            (isAfter(paymentDate, fromDate) || isEqual(paymentDate, fromDate)) && 
            (isBefore(paymentDate, toDate) || isEqual(paymentDate, toDate))
          );
        }

        return true;
      })
      .sort((a, b) => {
        const key = sortConfig.key;
        let valA, valB;
        
        if (key === 'customer') {
          valA = getCustomerName(a.customerId);
          valB = getCustomerName(b.customerId);
        } else if (key === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        } else if (key === 'amount') {
          valA = a.amount;
          valB = b.amount;
        } else {
          // @ts-ignore
          valA = a[key];
          // @ts-ignore
          valB = b[key];
        }
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [payments, searchQuery, sortConfig, activeTab, filterConfig, customers]);

  // Calculate summaries
  const totalPayments = filteredPayments.reduce((total, p) => total + p.amount, 0);
  const customersWithDues = customers.filter(c => c.outstandingBalance > 0);
  const totalOutstanding = customersWithDues.reduce((total, c) => total + c.outstandingBalance, 0);
  const totalSelected = selectedPayments.reduce((total, id) => {
    const payment = payments.find(p => p.id === id);
    return total + (payment?.amount || 0);
  }, 0);
  
  // Get customers with outstanding balances for reminders
  const customersForReminders = customersWithDues.sort((a, b) => 
    b.outstandingBalance - a.outstandingBalance
  );
  
  // Send reminders handler
  const handleSendReminders = (data: { 
    template: string; 
    channel: string; 
    customMessage: string;
    customers: Customer[];
  }) => {
    console.log("Sending reminders with data:", data);
    
    // In a real app, this would send actual reminders
    // For now, we'll just show a success toast
    toast.success(`${data.customers.length} reminders sent successfully via ${data.channel}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Record and track customer payments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedPayments.length > 0 ? (
            <>
              <p className="text-sm mr-2">
                <span className="font-medium">{selectedPayments.length}</span> selected 
                (₹{totalSelected.toFixed(2)})
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete selected payments</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                    <CalendarRange className="mr-2 h-4 w-4" />
                    Export with Date Range
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert("Quick Export to Excel")}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Quick Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert("Quick Export to PDF")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Quick Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setIsReminderDialogOpen(true)} variant="outline">
                <SendHorizonal className="mr-2 h-4 w-4" />
                Send Reminders
              </Button>
            </>
          )}
          <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  Enter payment details received from customer
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("customerId", value)
                      }
                      value={formData.customerId}
                    >
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} (₹{customer.outstandingBalance} due)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Payment Date</Label>
                    <DatePicker date={paymentDate} setDate={setPaymentDate} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("paymentMethod", value)
                      }
                      defaultValue={formData.paymentMethod}
                    >
                      <SelectTrigger id="paymentMethod">
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
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional details about the payment"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Record Payment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total amount due from all customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.length} payments in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Customers with Dues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customersWithDues.length} / {customers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Number of customers with outstanding balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View all payment transactions
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                className={isFilterOpen ? "bg-accent" : ""}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filter section */}
          {isFilterOpen && (
            <div className="pt-4 grid gap-4 md:grid-cols-3">
              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={filterConfig.paymentMethod}
                  onValueChange={(value) => setFilterConfig(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Customer</Label>
                <Select
                  value={filterConfig.customerId}
                  onValueChange={(value) => setFilterConfig(prev => ({ ...prev, customerId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by customer" />
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
              </div>
              <div>
                <Label>Date Range</Label>
                <DateRangePicker
                  value={filterConfig.dateRange}
                  onChange={(range) => setFilterConfig(prev => ({ ...prev, dateRange: range || { from: undefined, to: undefined } }))}
                  align="start"
                />
              </div>
            </div>
          )}
          
          {/* Tabs for quick filters */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
            <TabsList>
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No payments recorded yet</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Record Your First Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {/* Same dialog content as above */}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={
                          filteredPayments.length > 0 && 
                          selectedPayments.length === filteredPayments.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("customer")}>
                      <div className="flex items-center">
                        Customer
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                      <div className="flex items-center">
                        Amount
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        <p className="text-muted-foreground">No payments match your filters</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className={selectedPayments.includes(payment.id) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedPayments.includes(payment.id)}
                            onCheckedChange={(checked) => 
                              handleSelectPayment(payment.id, checked as boolean)
                            }
                            aria-label={`Select payment from ${getCustomerName(payment.customerId)}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{format(new Date(payment.date), "PP")}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(payment.date), "EEEE")}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getCustomerName(payment.customerId)}
                        </TableCell>
                        <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className="capitalize">{payment.paymentMethod}</span>
                        </TableCell>
                        <TableCell>
                          {payment.notes ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-[200px] truncate">
                                    {payment.notes}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {payment.notes}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert("View Receipt")}>
                                View Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const customer = customers.find(c => c.id === payment.customerId);
                                if (customer) {
                                  navigator.clipboard.writeText(
                                    `Payment of ₹${payment.amount} received from ${customer.name} on ${payment.date}`
                                  );
                                  toast.success("Payment details copied to clipboard");
                                }
                              }}>
                                Copy Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeletePayment(payment)}
                              >
                                Delete Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
          {filteredPayments.length > 0 && (
            <div className="text-sm">
              Total: <span className="font-semibold">₹{totalPayments.toFixed(2)}</span>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Payment Export Dialog */}
      <PaymentExportDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        payments={payments}
        customers={customers}
      />

      {/* Batch Reminder Dialog */}
      <BatchReminderDialog
        open={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        selectedCustomers={customersForReminders}
        onSendReminders={handleSendReminders}
      />
    </div>
  );
};

export default Payments;
