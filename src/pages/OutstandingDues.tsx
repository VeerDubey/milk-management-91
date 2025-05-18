
import { useState, useEffect } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  FileText,
  Calendar,
  Search,
  Filter,
  Phone,
  UserCircle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const DUE_CATEGORIES = {
  ALL: "all",
  OVERDUE: "overdue",
  UPCOMING: "upcoming",
  CRITICAL: "critical",
};

export default function OutstandingDues() {
  const { customers, payments, updateCustomer } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(DUE_CATEGORIES.ALL);
  const [reminderMessage, setReminderMessage] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleSendReminder = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setReminderDialogOpen(true);
    
    // Pre-populate message based on customer details
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const daysOverdue = customer.lastPaymentDate 
        ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
        : 0;
      
      setReminderMessage(
        `Dear ${customer.name},\n\nThis is a friendly reminder that your payment of ₹${
          customer.outstandingBalance
        } is ${daysOverdue > 0 ? `overdue by ${daysOverdue} days` : "due"}.\n\nPlease arrange for payment at your earliest convenience.\n\nRegards,\nVikas Milk Centre`
      );
    }
  };

  const handleMarkAsPaid = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setPaymentDialogOpen(true);
    
    // Pre-fill payment amount with outstanding balance
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setPaymentAmount(customer.outstandingBalance?.toString() || "0");
    }
  };

  const submitPayment = () => {
    if (!selectedCustomerId || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        const amount = parseFloat(paymentAmount);
        
        // Update customer outstanding balance
        const newBalance = Math.max(0, (customer.outstandingBalance || 0) - amount);
        
        updateCustomer(selectedCustomerId, {
          outstandingBalance: newBalance,
          lastPaymentDate: new Date().toISOString()
        });
        
        toast.success(`Payment of ₹${amount} recorded for ${customer.name}`);
        setPaymentDialogOpen(false);
        setPaymentAmount("");
        setSelectedCustomerId(null);
      }
    } catch (error) {
      toast.error("Failed to record payment");
      console.error(error);
    }
  };

  const submitReminder = () => {
    if (!selectedCustomerId || !reminderMessage.trim()) {
      toast.error("Please enter a reminder message");
      return;
    }
    
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        // In a real app, this would send an SMS or email
        toast.success(`Reminder sent to ${customer.name}`);
        setReminderDialogOpen(false);
        setReminderMessage("");
        setSelectedCustomerId(null);
      }
    } catch (error) {
      toast.error("Failed to send reminder");
      console.error(error);
    }
  };

  const filterCustomersByCategory = (customers: any[]) => {
    switch(selectedCategory) {
      case DUE_CATEGORIES.OVERDUE:
        return customers.filter(c => {
          const lastPayment = c.lastPaymentDate ? new Date(c.lastPaymentDate) : null;
          return lastPayment && differenceInDays(new Date(), lastPayment) > 30;
        });
      case DUE_CATEGORIES.UPCOMING:
        return customers.filter(c => {
          const lastPayment = c.lastPaymentDate ? new Date(c.lastPaymentDate) : null;
          const days = lastPayment ? differenceInDays(new Date(), lastPayment) : 0;
          return days >= 15 && days <= 30;
        });
      case DUE_CATEGORIES.CRITICAL:
        return customers.filter(c => {
          const lastPayment = c.lastPaymentDate ? new Date(c.lastPaymentDate) : null;
          return lastPayment && differenceInDays(new Date(), lastPayment) > 60;
        });
      case DUE_CATEGORIES.ALL:
      default:
        return customers;
    }
  };

  // Filter customers with outstanding balances
  const customersWithDues = customers
    .filter(customer => (customer.outstandingBalance || 0) > 0)
    .filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  
  const filteredCustomers = filterCustomersByCategory(customersWithDues);
  
  // Calculate statistics
  const totalOutstanding = filteredCustomers.reduce(
    (total, customer) => total + (customer.outstandingBalance || 0),
    0
  );
  
  const criticalDues = customers.filter(c => {
    const lastPayment = c.lastPaymentDate ? new Date(c.lastPaymentDate) : null;
    return (
      (c.outstandingBalance || 0) > 0 && 
      lastPayment && 
      differenceInDays(new Date(), lastPayment) > 60
    );
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outstanding Dues</h1>
        <p className="text-muted-foreground">
          Track and manage your customer payment dues
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredCustomers.length} customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalDues}</div>
            <p className="text-xs text-muted-foreground">
              Over 60 days past due
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Due Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredCustomers.length > 0
                  ? Math.round(
                      filteredCustomers.reduce((sum, customer) => {
                        const lastPayment = customer.lastPaymentDate
                          ? new Date(customer.lastPaymentDate)
                          : new Date();
                        return sum + differenceInDays(new Date(), lastPayment);
                      }, 0) / filteredCustomers.length
                    )
                  : 0
              } days
            </div>
            <p className="text-xs text-muted-foreground">
              Average time since last payment
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Due Collection</CardTitle>
          <CardDescription>View and manage customer dues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row justify-between">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">From:</span>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">To:</span>
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DUE_CATEGORIES.ALL}>All Dues</SelectItem>
                    <SelectItem value={DUE_CATEGORIES.OVERDUE}>Overdue (30+ days)</SelectItem>
                    <SelectItem value={DUE_CATEGORIES.UPCOMING}>Upcoming (15-30 days)</SelectItem>
                    <SelectItem value={DUE_CATEGORIES.CRITICAL}>Critical (60+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Amount Due (₹)</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className="text-right">Days Overdue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No outstanding dues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const lastPaymentDate = customer.lastPaymentDate
                        ? new Date(customer.lastPaymentDate)
                        : null;
                      const daysOverdue = lastPaymentDate
                        ? differenceInDays(new Date(), lastPaymentDate)
                        : 0;
                      
                      let statusBadge;
                      if (daysOverdue > 60) {
                        statusBadge = <Badge variant="destructive">Critical</Badge>;
                      } else if (daysOverdue > 30) {
                        statusBadge = <Badge variant="destructive">Overdue</Badge>;
                      } else if (daysOverdue > 15) {
                        statusBadge = <Badge variant="warning">Due Soon</Badge>;
                      } else {
                        statusBadge = <Badge variant="outline">Current</Badge>;
                      }
                      
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-5 w-5 text-muted-foreground" />
                              {customer.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {customer.phone}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{customer.outstandingBalance?.toLocaleString() || "0"}
                          </TableCell>
                          <TableCell>
                            {lastPaymentDate
                              ? format(lastPaymentDate, "MMM dd, yyyy")
                              : "No payments"}
                          </TableCell>
                          <TableCell className="text-right">
                            <span 
                              className={`font-medium ${
                                daysOverdue > 30 ? "text-red-600" : 
                                daysOverdue > 15 ? "text-amber-600" : 
                                "text-green-600"
                              }`}
                            >
                              {daysOverdue}
                            </span>
                          </TableCell>
                          <TableCell>{statusBadge}</TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendReminder(customer.id)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsPaid(customer.id)}
                              >
                                <FileText className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>
      
      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder to the customer via SMS or email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                className="w-full min-h-[150px] p-3 rounded-md border border-input"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              ></textarea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReminder}>Send Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this outstanding balance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="paymentAmount" className="text-sm font-medium">
                Payment Amount (₹)
              </label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="paymentDate" className="text-sm font-medium">
                Payment Date
              </label>
              <Input
                id="paymentDate"
                type="date"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
