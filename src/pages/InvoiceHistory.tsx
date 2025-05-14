import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/data/DataContext";
import { useInvoices } from "@/contexts/InvoiceContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isAfter, isBefore, subDays } from "date-fns";
import { 
  Download, 
  Eye, 
  Filter, 
  FileText, 
  Search,
  Plus,
  Mail,
  CalendarDays,
  Trash
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { toast } from "sonner";
import InvoiceDownloadButton from "@/components/invoices/InvoiceDownloadButton";
import { DateRange } from "react-day-picker";

export default function InvoiceHistory() {
  const { invoices } = useData();
  const { downloadInvoice, generateInvoicePreview, deleteInvoice } = useInvoices();
  
  // State for date range filtering
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedTab, setSelectedTab] = useState("all");
  const [previewInvoiceId, setPreviewInvoiceId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  // Filter invoices based on selected criteria
  const filteredInvoices = useMemo(() => {
    // Start with all invoices
    let filtered = [...invoices];
    
    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = parseISO(invoice.date);
        return !isBefore(invoiceDate, dateRange.from as Date) && !isAfter(invoiceDate, dateRange.to as Date);
      });
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.id.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (selectedTab !== "all") {
      if (selectedTab === "overdue") {
        filtered = filtered.filter(invoice => {
          // Logic to check if invoice is overdue
          const dueDate = new Date(invoice.date);
          dueDate.setDate(dueDate.getDate() + 15); // Assuming 15 days due date
          return invoice.status.toLowerCase() !== "paid" && dueDate < new Date();
        });
      } else if (selectedTab === "paid") {
        filtered = filtered.filter(invoice => invoice.status.toLowerCase() === "paid");
      } else if (selectedTab === "pending") {
        filtered = filtered.filter(invoice => invoice.status.toLowerCase() === "pending");
      }
    }
    
    // Sort invoices
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else if (sortBy === "amount") {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      } else if (sortBy === "id") {
        return sortOrder === "desc" 
          ? b.id.localeCompare(a.id) 
          : a.id.localeCompare(b.id);
      }
      return 0;
    });
    
    return filtered;
  }, [invoices, dateRange, statusFilter, searchQuery, selectedTab, sortBy, sortOrder]);
  
  // Fix the void cannot be tested for truthiness error
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await downloadInvoice(invoiceId);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };
  
  // Handle invoice preview
  const handlePreviewInvoice = (invoiceId: string) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        toast.error("Invoice not found");
        return;
      }
      
      const url = generateInvoicePreview(invoice);
      setPreviewUrl(url);
      setPreviewInvoiceId(invoiceId);
    } catch (error) {
      console.error("Error generating invoice preview:", error);
      toast.error("Failed to generate invoice preview");
    }
  };
  
  // Calculate summary data
  const summaryData = useMemo(() => {
    const total = filteredInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const paid = filteredInvoices
      .filter(inv => inv.status.toLowerCase() === "paid")
      .reduce((acc, inv) => acc + inv.amount, 0);
    const pending = filteredInvoices
      .filter(inv => inv.status.toLowerCase() === "pending")
      .reduce((acc, inv) => acc + inv.amount, 0);
    const overdue = filteredInvoices
      .filter(inv => {
        const dueDate = new Date(inv.date);
        dueDate.setDate(dueDate.getDate() + 15); // Assuming 15 days due date
        return inv.status.toLowerCase() !== "paid" && dueDate < new Date();
      })
      .reduce((acc, inv) => acc + inv.amount, 0);
      
    return { total, paid, pending, overdue };
  }, [filteredInvoices]);
  
  // Handle email invoice
  const handleEmailInvoice = (invoiceId: string) => {
    toast.info("Email functionality coming soon");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      deleteInvoice(id);
      toast.success("Invoice deleted successfully");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
          <p className="text-muted-foreground">
            Manage and track all your invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/invoice-create">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{summaryData.total.toFixed(2)}</div>
            <p className="mt-1 text-xs text-blue-100">
              {filteredInvoices.length} invoices
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{summaryData.paid.toFixed(2)}</div>
            <p className="mt-1 text-xs text-green-100">
              {filteredInvoices.filter(inv => inv.status.toLowerCase() === "paid").length} invoices
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{summaryData.pending.toFixed(2)}</div>
            <p className="mt-1 text-xs text-yellow-100">
              {filteredInvoices.filter(inv => inv.status.toLowerCase() === "pending").length} invoices
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{summaryData.overdue.toFixed(2)}</div>
            <p className="mt-1 text-xs text-red-100">
              {filteredInvoices.filter(inv => {
                const dueDate = new Date(inv.date);
                dueDate.setDate(dueDate.getDate() + 15);
                return inv.status.toLowerCase() !== "paid" && dueDate < new Date();
              }).length} invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:w-auto md:flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [by, order] = value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
                <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
                <SelectItem value="id-desc">Invoice # (Z-A)</SelectItem>
                <SelectItem value="id-asc">Invoice # (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <p className="text-lg font-medium">No invoices found</p>
                            <p className="text-sm text-muted-foreground">
                              Try changing your filters or create a new invoice
                            </p>
                            <Button asChild className="mt-4">
                              <Link to="/invoice-create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Invoice
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>{invoice.customerName}</TableCell>
                          <TableCell>
                            {format(new Date(invoice.date), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status.toLowerCase() === "paid"
                                  ? "success"
                                  : invoice.status.toLowerCase() === "pending"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePreviewInvoice(invoice.id)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Preview</span>
                              </Button>
                              <InvoiceDownloadButton
                                invoiceId={invoice.id}
                                variant="ghost"
                                size="icon"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEmailInvoice(invoice.id)}
                              >
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">Email</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(invoice.id)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Showing {filteredInvoices.length} of {invoices.length} invoices
                </div>
                <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {dateRange.from ? format(dateRange.from, "dd MMM yyyy") : ""} - {dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {previewInvoiceId && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoice Preview</CardTitle>
                <CardDescription>
                  Preview of invoice #{previewInvoiceId}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPreviewInvoiceId(null)}
                >
                  Close
                </Button>
                <InvoiceDownloadButton
                  invoiceId={previewInvoiceId}
                  size="sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] w-full border rounded overflow-auto">
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full" 
                  title="Invoice Preview"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
