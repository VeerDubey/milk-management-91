
import { useState } from "react";
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
  Eye,
  FileText,
  Download,
  Search,
  Calendar,
  Filter,
  Mail,
  Phone,
  AlertCircle,
  MessageSquare,
  Printer,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Utility function for reporting
function generateReport(customers: any[], type: string) {
  // In a real app, this would generate a CSV, PDF, or Excel report
  toast.success(`${type} report generated successfully`);
}

// Get severity based on days overdue
function getSeverity(daysOverdue: number) {
  if (daysOverdue > 60) return "critical";
  if (daysOverdue > 30) return "high";
  if (daysOverdue > 15) return "medium";
  return "low";
}

export default function OutstandingAmounts() {
  const { customers, addInvoice } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("list");

  const handleSendReminder = (customer: any) => {
    setSelectedCustomer(customer);
    setIsReminderDialogOpen(true);
    
    // Pre-fill the reminder message
    const daysOverdue = customer.lastPaymentDate
      ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
      : 0;
      
    setReminderMessage(
      `Dear ${customer.name},\n\nThis is a friendly reminder about your outstanding balance of ₹${
        customer.outstandingBalance || 0
      } which is ${daysOverdue > 0 ? `overdue by ${daysOverdue} days` : "due"}.\n\nPlease settle your account at your earliest convenience.\n\nThank you,\nVikas Milk Centre`
    );
  };

  const handleViewStatement = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const sendReminder = () => {
    if (!selectedCustomer || !reminderMessage.trim()) {
      toast.error("Please enter a valid reminder message");
      return;
    }
    
    // In a real app, this would send an email or SMS
    toast.success(`Reminder sent to ${selectedCustomer.name}`);
    setIsReminderDialogOpen(false);
  };

  // Filter customers with outstanding balances
  const customersWithOutstanding = customers.filter(
    (customer) => (customer.outstandingBalance || 0) > 0
  );

  // Apply search filter
  const searchFiltered = customersWithOutstanding.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  // Apply severity filter
  const filteredCustomers = severityFilter === "all"
    ? searchFiltered
    : searchFiltered.filter(customer => {
        const daysOverdue = customer.lastPaymentDate
          ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
          : 0;
        return getSeverity(daysOverdue) === severityFilter;
      });

  // Calculate summary statistics
  const totalOutstanding = filteredCustomers.reduce(
    (sum, customer) => sum + (customer.outstandingBalance || 0),
    0
  );
  
  const criticalCount = filteredCustomers.filter(customer => {
    const daysOverdue = customer.lastPaymentDate
      ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
      : 0;
    return daysOverdue > 60;
  }).length;
  
  const averageDue = filteredCustomers.length > 0
    ? totalOutstanding / filteredCustomers.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outstanding Amounts</h1>
        <p className="text-muted-foreground">
          Track and manage customer outstanding balances
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
              Across {filteredCustomers.length} customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">
              Overdue by more than 60 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Per customer with balance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateReport(filteredCustomers, "Summary")}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Batch reminders sent successfully")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Batch Reminders
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Due Collection</CardTitle>
              <CardDescription>View and manage outstanding payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>From:</span>
                    <DatePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>To:</span>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by customer name or phone..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low (< 15 days)</SelectItem>
                      <SelectItem value="medium">Medium (15-30 days)</SelectItem>
                      <SelectItem value="high">High (30-60 days)</SelectItem>
                      <SelectItem value="critical">Critical (> 60 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead className="text-right">Total Due (₹)</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead className="text-right">Days Overdue</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No outstanding balances found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => {
                          const daysOverdue = customer.lastPaymentDate
                            ? differenceInDays(
                                new Date(),
                                new Date(customer.lastPaymentDate)
                              )
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
                                {customer.name}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{customer.outstandingBalance?.toLocaleString() || "0"}
                              </TableCell>
                              <TableCell>
                                {customer.lastPaymentDate
                                  ? format(new Date(customer.lastPaymentDate), "MMM dd, yyyy")
                                  : "No payments"}
                              </TableCell>
                              <TableCell className="text-right">
                                <span 
                                  className={`font-medium ${
                                    daysOverdue > 60 ? "text-red-600" : 
                                    daysOverdue > 30 ? "text-red-500" :
                                    daysOverdue > 15 ? "text-amber-600" : 
                                    "text-green-600"
                                  }`}
                                >
                                  {daysOverdue}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col text-sm">
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span>{customer.phone}</span>
                                  </div>
                                  {customer.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 text-muted-foreground" />
                                      <span>{customer.email}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{statusBadge}</TableCell>
                              <TableCell>
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleSendReminder(customer)}
                                    title="Send Reminder"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewStatement(customer)}
                                    title="View Statement"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toast.success(`Statement for ${customer.name} printed`)}
                                    title="Print Statement"
                                  >
                                    <Printer className="h-4 w-4" />
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
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Analysis</CardTitle>
              <CardDescription>Analyze customer outstanding amounts by different factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Outstanding by Age</h3>
                    <div className="space-y-3">
                      {[
                        { label: "0-15 days", color: "bg-green-500" },
                        { label: "15-30 days", color: "bg-amber-500" },
                        { label: "30-60 days", color: "bg-orange-500" },
                        { label: "60+ days", color: "bg-red-500" }
                      ].map((category, index) => {
                        // Calculate customers in each category
                        const count = filteredCustomers.filter(customer => {
                          const daysOverdue = customer.lastPaymentDate
                            ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
                            : 0;
                          
                          if (category.label === "0-15 days") return daysOverdue >= 0 && daysOverdue < 15;
                          if (category.label === "15-30 days") return daysOverdue >= 15 && daysOverdue < 30;
                          if (category.label === "30-60 days") return daysOverdue >= 30 && daysOverdue < 60;
                          return daysOverdue >= 60;
                        }).length;
                        
                        const percentage = filteredCustomers.length > 0
                          ? (count / filteredCustomers.length) * 100
                          : 0;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{category.label}</span>
                              <span>{count} customers ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${category.color} rounded-full`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Outstanding by Amount</h3>
                    <div className="space-y-3">
                      {[
                        { label: "₹0 - ₹1,000", color: "bg-blue-500" },
                        { label: "₹1,000 - ₹5,000", color: "bg-indigo-500" },
                        { label: "₹5,000 - ₹10,000", color: "bg-purple-500" },
                        { label: "₹10,000+", color: "bg-pink-500" }
                      ].map((category, index) => {
                        // Calculate customers in each category
                        const count = filteredCustomers.filter(customer => {
                          const amount = customer.outstandingBalance || 0;
                          
                          if (category.label === "₹0 - ₹1,000") return amount > 0 && amount <= 1000;
                          if (category.label === "₹1,000 - ₹5,000") return amount > 1000 && amount <= 5000;
                          if (category.label === "₹5,000 - ₹10,000") return amount > 5000 && amount <= 10000;
                          return amount > 10000;
                        }).length;
                        
                        const percentage = filteredCustomers.length > 0
                          ? (count / filteredCustomers.length) * 100
                          : 0;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{category.label}</span>
                              <span>{count} customers ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${category.color} rounded-full`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Top 5 Customers with Highest Outstanding</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer Name</TableHead>
                          <TableHead className="text-right">Outstanding Amount (₹)</TableHead>
                          <TableHead className="text-right">Days Overdue</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers
                          .sort((a, b) => 
                            (b.outstandingBalance || 0) - (a.outstandingBalance || 0)
                          )
                          .slice(0, 5)
                          .map(customer => {
                            const daysOverdue = customer.lastPaymentDate
                              ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
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
                                <TableCell>{customer.name}</TableCell>
                                <TableCell className="text-right font-medium">
                                  ₹{customer.outstandingBalance?.toLocaleString() || "0"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span 
                                    className={`font-medium ${
                                      daysOverdue > 60 ? "text-red-600" : 
                                      daysOverdue > 30 ? "text-red-500" :
                                      daysOverdue > 15 ? "text-amber-600" : 
                                      "text-green-600"
                                    }`}
                                  >
                                    {daysOverdue}
                                  </span>
                                </TableCell>
                                <TableCell>{statusBadge}</TableCell>
                              </TableRow>
                            );
                          })
                        }
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View Statement Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Statement</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.name} - Outstanding Balance: ₹{selectedCustomer?.outstandingBalance || 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">Customer Details</h4>
                <p className="text-sm">{selectedCustomer?.name}</p>
                <p className="text-sm">{selectedCustomer?.phone}</p>
                {selectedCustomer?.email && <p className="text-sm">{selectedCustomer.email}</p>}
              </div>
              <div className="text-right">
                <h4 className="font-semibold">Statement Date</h4>
                <p className="text-sm">{format(new Date(), "MMM dd, yyyy")}</p>
                <p className="text-sm">Vikas Milk Centre</p>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Transaction history will appear here
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between pt-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Please settle your outstanding balance at your earliest convenience.
                </p>
              </div>
              <div className="text-right space-y-2">
                <div className="flex justify-end gap-2">
                  <span className="text-sm font-medium">Total Outstanding:</span>
                  <span className="text-sm font-bold">₹{selectedCustomer?.outstandingBalance || 0}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSendReminder(selectedCustomer)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast.success("Statement printed")}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder to {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="reminderMessage" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="reminderMessage"
                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This message will be sent via SMS or email to the customer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-500">
                Ensure the contact information is correct before sending.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendReminder}>
              <Mail className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
