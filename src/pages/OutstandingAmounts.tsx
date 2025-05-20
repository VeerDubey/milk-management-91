
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

const OutstandingAmounts = () => {
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
  const customersWithOutstanding = customers?.filter(
    (customer) => (customer.outstandingBalance || 0) > 0
  ) || [];

  // Apply search filter
  const searchFiltered = customersWithOutstanding.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
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

      {/* Stats cards */}
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

      {/* Tabs */}
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

      {/* Tab content */}
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="list">
          {/* List card */}
          <Card>
            <CardHeader>
              <CardTitle>Due Collection</CardTitle>
              <CardDescription>View and manage outstanding payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
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
                      <SelectItem value="low">{`Low (< 15 days)`}</SelectItem>
                      <SelectItem value="medium">Medium (15-30 days)</SelectItem>
                      <SelectItem value="high">High (30-60 days)</SelectItem>
                      <SelectItem value="critical">{`Critical (> 60 days)`}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
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
          {/* Analytics card */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Analysis</CardTitle>
              <CardDescription>Analyze customer outstanding amounts by different factors</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Analytics content */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Outstanding by Age</h3>
                    <div className="space-y-3">
                      {/* Age breakdown charts */}
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
                          <div key={index} className="flex items-center">
                            <div className="w-32 text-sm">{category.label}</div>
                            <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${category.color}`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="w-16 text-sm text-right ml-2">
                              {count} ({percentage.toFixed(0)}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Top Overdue Customers</h3>
                    <div className="space-y-2">
                      {/* Top customers list */}
                      {filteredCustomers
                        .sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0))
                        .slice(0, 5)
                        .map(customer => {
                          const daysOverdue = customer.lastPaymentDate
                            ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
                            : 0;

                          return (
                            <div key={customer.id} className="flex justify-between items-center p-2 border-b">
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {daysOverdue} days overdue
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">₹{customer.outstandingBalance?.toLocaleString()}</div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleSendReminder(customer)}
                                  className="h-7 text-xs"
                                >
                                  Send Reminder
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Actions Required</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Action cards */}
                    <Card>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Critical Accounts</CardTitle>
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{criticalCount}</div>
                        <Button className="w-full mt-2 bg-red-500 hover:bg-red-600" size="sm">
                          Send Urgent Reminders
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Due This Week</CardTitle>
                          <Calendar className="h-5 w-5 text-yellow-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">
                          {filteredCustomers.filter(customer => {
                            const daysOverdue = customer.lastPaymentDate
                              ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
                              : 0;
                            return daysOverdue >= 10 && daysOverdue < 15;
                          }).length}
                        </div>
                        <Button className="w-full mt-2" variant="outline" size="sm">
                          Send Reminders
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Follow-up Required</CardTitle>
                          <Phone className="h-5 w-5 text-blue-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">
                          {filteredCustomers.filter(customer => {
                            const daysOverdue = customer.lastPaymentDate
                              ? differenceInDays(new Date(), new Date(customer.lastPaymentDate))
                              : 0;
                            return daysOverdue > 30 && daysOverdue < 60;
                          }).length}
                        </div>
                        <Button className="w-full mt-2" size="sm">
                          Generate Call List
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Statement Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Statement</DialogTitle>
            <DialogDescription>
              Statement for {selectedCustomer?.name || ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h3 className="font-medium">Outstanding Balance: ₹{selectedCustomer?.outstandingBalance?.toLocaleString() || '0'}</h3>
              <p className="text-sm text-muted-foreground">This is a placeholder for the statement details.</p>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => toast.success('Statement printed successfully')}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder to {selectedCustomer?.name || ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Send via:</p>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Customer Info:</p>
                <p className="text-sm">{selectedCustomer?.phone || 'No phone'}</p>
                <p className="text-sm">{selectedCustomer?.email || 'No email'}</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <textarea
                id="message"
                className="mt-1 w-full h-40 p-2 border rounded-md"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              ></textarea>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendReminder}>Send Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutstandingAmounts;
