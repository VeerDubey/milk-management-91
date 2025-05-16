
import { useState, useEffect } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { CustomerLedgerEntry, CustomerLedgerReport } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { exportToPdf } from "@/utils/pdfUtils";
import { cn } from "@/lib/utils";

const CustomerLedger = () => {
  const { customers, orders, payments } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [ledgerReport, setLedgerReport] = useState<CustomerLedgerReport | null>(null);
  
  // Generate ledger report when customer or date range changes
  useEffect(() => {
    if (selectedCustomerId && dateRange?.from && dateRange?.to) {
      generateLedgerReport();
    }
  }, [selectedCustomerId, dateRange]);
  
  const generateLedgerReport = () => {
    if (!selectedCustomerId || !dateRange?.from || !dateRange?.to) {
      toast.error("Please select a customer and date range");
      return;
    }
    
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;
    
    const fromDate = dateRange.from;
    const toDate = dateRange.to || dateRange.from;
    
    // Get all orders for the customer within date range
    const customerOrders = orders.filter(
      (order) => order.customerId === selectedCustomerId &&
      new Date(order.date) >= fromDate &&
      new Date(order.date) <= toDate
    );
    
    // Get all payments for the customer within date range
    const customerPayments = payments.filter(
      (payment) => payment.customerId === selectedCustomerId &&
      new Date(payment.date) >= fromDate &&
      new Date(payment.date) <= toDate
    );
    
    // Calculate opening balance (all transactions before fromDate)
    const previousOrders = orders.filter(
      (order) => order.customerId === selectedCustomerId &&
      new Date(order.date) < fromDate
    );
    
    const previousPayments = payments.filter(
      (payment) => payment.customerId === selectedCustomerId &&
      new Date(payment.date) < fromDate
    );
    
    const totalPreviousOrders = previousOrders.reduce((sum, order) => sum + order.total, 0);
    const totalPreviousPayments = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const openingBalance = totalPreviousOrders - totalPreviousPayments;
    
    // Combine and sort all transactions by date
    const allTransactions = [
      ...customerOrders.map((order) => ({
        id: `order-${order.id}`,
        customerId: order.customerId,
        date: order.date,
        type: 'order' as const,
        description: `Order #${order.id}`,
        debit: order.total,
        credit: 0,
        orderId: order.id,
        productQuantities: order.items.reduce((acc, item) => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>),
        totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        amountBilled: order.total
      })),
      ...customerPayments.map((payment) => ({
        id: `payment-${payment.id}`,
        customerId: payment.customerId,
        date: payment.date,
        type: 'payment' as const,
        description: `Payment - ${payment.paymentMethod}`,
        debit: 0,
        credit: payment.amount,
        paymentId: payment.id,
        paymentReceived: payment.amount
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate running balance
    let runningBalance = openingBalance;
    const entries = allTransactions.map((transaction) => {
      runningBalance = runningBalance + (transaction.debit || 0) - (transaction.credit || 0);
      return {
        ...transaction,
        balance: runningBalance
      };
    });
    
    // Calculate totals
    const totalAmountBilled = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const totalPaymentReceived = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate product quantities
    const totalProductQuantities = customerOrders.reduce((acc, order) => {
      order.items.forEach((item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);
    
    // Create the report
    setLedgerReport({
      customerId: selectedCustomerId,
      customerName: customer.name,
      startDate: fromDate.toISOString(),
      endDate: toDate.toISOString(),
      entries,
      openingBalance,
      closingBalance: runningBalance,
      totalAmountBilled,
      totalPaymentReceived,
      totalProductQuantities
    });
    
    toast.success("Ledger report generated");
  };
  
  const exportLedger = () => {
    if (!ledgerReport) {
      toast.error("Please generate a report first");
      return;
    }
    
    const headers = ["Date", "Description", "Debit (₹)", "Credit (₹)", "Balance (₹)"];
    
    const rows = [
      ["Opening Balance", "", "", "", ledgerReport.openingBalance.toFixed(2)],
      ...ledgerReport.entries.map((entry) => [
        format(new Date(entry.date), "dd/MM/yyyy"),
        entry.description,
        entry.debit ? entry.debit.toFixed(2) : "",
        entry.credit ? entry.credit.toFixed(2) : "",
        entry.balance.toFixed(2)
      ]),
      ["", "Closing Balance", "", "", ledgerReport.closingBalance.toFixed(2)]
    ];
    
    exportToPdf(headers, rows, {
      title: `Customer Ledger: ${ledgerReport.customerName}`,
      subtitle: `Period: ${format(new Date(ledgerReport.startDate), "dd/MM/yyyy")} to ${format(new Date(ledgerReport.endDate), "dd/MM/yyyy")}`,
      filename: `customer_ledger_${ledgerReport.customerId}.pdf`,
      additionalInfo: [
        { label: "Total Amount Billed", value: `₹${ledgerReport.totalAmountBilled?.toFixed(2) || "0.00"}` },
        { label: "Total Payment Received", value: `₹${ledgerReport.totalPaymentReceived?.toFixed(2) || "0.00"}` },
      ]
    });
  };

  // Filter the entries based on search term
  const filteredEntries = ledgerReport?.entries.filter(entry => 
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Ledger</h1>
          <p className="text-muted-foreground">
            View transaction history and balance for customers
          </p>
        </div>
        
        {ledgerReport && (
          <div className="flex gap-2">
            <Button onClick={exportLedger} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <DateRangePicker 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={generateLedgerReport}>
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {ledgerReport && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ledger for {ledgerReport.customerName}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-medium">
                  {format(new Date(ledgerReport.startDate), "dd MMM yyyy")} - {format(new Date(ledgerReport.endDate), "dd MMM yyyy")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <p className="text-sm">Opening Balance:</p>
                  <p className={cn("text-sm font-mono", ledgerReport.openingBalance >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")}>
                    ₹{ledgerReport.openingBalance.toFixed(2)}
                  </p>
                  <p className="text-sm">Total Billed:</p>
                  <p className="text-sm font-mono">₹{ledgerReport.totalAmountBilled?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm">Total Received:</p>
                  <p className="text-sm font-mono">₹{ledgerReport.totalPaymentReceived?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm font-medium">Closing Balance:</p>
                  <p className={cn("text-sm font-mono font-medium", ledgerReport.closingBalance >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")}>
                    ₹{ledgerReport.closingBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit (₹)</TableHead>
                    <TableHead className="text-right">Credit (₹)</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{format(new Date(ledgerReport.startDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>Opening Balance</TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right font-medium">
                      {ledgerReport.openingBalance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">{entry.debit ? entry.debit.toFixed(2) : ""}</TableCell>
                        <TableCell className="text-right">{entry.credit ? entry.credit.toFixed(2) : ""}</TableCell>
                        <TableCell className="text-right font-medium">{entry.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        {searchTerm ? "No matching transactions found" : "No transactions in this period"}
                      </TableCell>
                    </TableRow>
                  )}
                  
                  <TableRow className="bg-muted/30">
                    <TableCell>{format(new Date(ledgerReport.endDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="font-medium">Closing Balance</TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right font-medium">
                      {ledgerReport.closingBalance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerLedger;
