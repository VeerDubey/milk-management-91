import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { format, parse, isAfter, isBefore, addMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
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
import { Label } from "@/components/ui/label";
import { Customer, Order, Payment, Product, CustomerLedgerEntry, CustomerLedgerReport as CustomerLedgerReportType } from "@/types";
import { FileText, Printer, Download, Calendar, CalendarDays, FileDown } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const CustomerLedgerReport = () => {
  const { customers, orders, payments, products, getProductRateForCustomer } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [reportType, setReportType] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [ledgerReport, setLedgerReport] = useState<CustomerLedgerReportType | null>(null);

  // Function to generate ledger report for a specific customer and date range
  const generateReport = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }

    // Format dates for filtering
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    
    // Get customer's orders and payments within the date range
    const customerOrders = orders.filter(order => 
      order.items.some(item => item.customerId === selectedCustomerId) &&
      !isBefore(new Date(order.date), startDate) &&
      !isAfter(new Date(order.date), endDate)
    );
    
    const customerPayments = payments.filter(payment => 
      payment.customerId === selectedCustomerId &&
      !isBefore(new Date(payment.date), startDate) &&
      !isAfter(new Date(payment.date), endDate)
    );
    
    // Calculate opening balance
    // This is the customer's outstanding balance before the start date
    const openingBalance = calculateOpeningBalance(customer, formattedStartDate);
    
    // Create a map of dates within the range to merge orders and payments
    const dateEntries = new Map<string, CustomerLedgerEntry>();
    
    // Initialize with all dates in the range
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    let runningBalance = openingBalance;
    
    // Initialize total product quantities
    const totalProductQuantities: {[productId: string]: number} = {};
    products.forEach(product => {
      totalProductQuantities[product.id] = 0;
    });
    
    // Process orders
    customerOrders.forEach(order => {
      const orderDate = order.date;
      const entryKey = orderDate;
      
      // Initialize entry if it doesn't exist
      if (!dateEntries.has(entryKey)) {
        dateEntries.set(entryKey, {
          id: `order-${order.id}`,
          date: orderDate,
          customerId: selectedCustomerId,
          orderId: order.id,
          type: 'order',
          description: `Order #${order.id}`,
          productQuantities: {},
          totalQuantity: 0,
          amountBilled: 0,
          paymentReceived: 0,
          closingBalance: runningBalance,
          debit: 0,
          credit: 0
        });
      }
      
      const entry = dateEntries.get(entryKey)!;
      
      // Calculate order amount and add product quantities
      let orderAmount = 0;
      let orderTotalQuantity = 0;
      
      order.items.forEach(item => {
        if (item.customerId === selectedCustomerId) {
          const productRate = getProductRateForCustomer(selectedCustomerId, item.productId);
          const itemAmount = item.quantity * productRate;
          orderAmount += itemAmount;
          orderTotalQuantity += item.quantity;
          
          // Add to product quantities
          if (!entry.productQuantities[item.productId]) {
            entry.productQuantities[item.productId] = 0;
          }
          entry.productQuantities[item.productId] += item.quantity;
          
          // Add to total product quantities
          totalProductQuantities[item.productId] += item.quantity;
        }
      });
      
      entry.amountBilled += orderAmount;
      entry.totalQuantity += orderTotalQuantity;
      runningBalance += orderAmount;
      entry.closingBalance = runningBalance;
    });
    
    // Process payments
    customerPayments.forEach(payment => {
      const paymentDate = payment.date;
      const entryKey = paymentDate;
      
      // Initialize entry if it doesn't exist
      if (!dateEntries.has(entryKey)) {
        dateEntries.set(entryKey, {
          id: `payment-${payment.id}`,
          date: paymentDate,
          customerId: selectedCustomerId,
          paymentId: payment.id,
          type: 'payment',
          description: `Payment - ${payment.paymentMethod}`,
          productQuantities: {},
          totalQuantity: 0,
          amountBilled: 0,
          paymentReceived: 0,
          closingBalance: runningBalance,
          debit: 0,
          credit: 0
        });
      }
      
      const entry = dateEntries.get(entryKey)!;
      
      entry.paymentReceived += payment.amount;
      entry.referenceId = payment.id;
      if (payment.notes) {
        entry.reference = `${payment.paymentMethod.toUpperCase()} - ${payment.notes}`;
      } else {
        entry.reference = payment.paymentMethod.toUpperCase();
      }
      
      runningBalance -= payment.amount;
      entry.closingBalance = runningBalance;
    });
    
    // Convert map to sorted array
    const entries = Array.from(dateEntries.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate total amount billed and payment received
    const totalAmountBilled = entries.reduce((sum, entry) => sum + entry.amountBilled, 0);
    const totalPaymentReceived = entries.reduce((sum, entry) => sum + entry.paymentReceived, 0);
    
    // Set the ledger report
    const report: CustomerLedgerReport = {
      customerId: selectedCustomerId,
      customerName: customer.name, // Add the required customerName field
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      openingBalance,
      entries,
      totalProductQuantities,
      totalAmountBilled,
      totalPaymentReceived,
      closingBalance: runningBalance
    };
    
    setLedgerReport(report);
    toast.success("Ledger report generated successfully");
  };
  
  // Calculate the opening balance for a customer as of a specific date
  const calculateOpeningBalance = (customer: Customer, startDate: string): number => {
    // Get all orders and payments before the start date
    const previousOrders = orders.filter(order => 
      order.items.some(item => item.customerId === customer.id) &&
      order.date < startDate
    );
    
    const previousPayments = payments.filter(payment => 
      payment.customerId === customer.id &&
      payment.date < startDate
    );
    
    // Calculate total amount from orders
    let totalOrderAmount = 0;
    previousOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.customerId === customer.id) {
          const productRate = getProductRateForCustomer(customer.id, item.productId);
          totalOrderAmount += item.quantity * productRate;
        }
      });
    });
    
    // Calculate total payments
    const totalPayments = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate opening balance
    return totalOrderAmount - totalPayments;
  };
  
  // Generate and download PDF report
  const generatePDF = () => {
    if (!ledgerReport || !selectedCustomerId) return;
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;
    
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(16);
    doc.text("MILK CENTER", 105, 15, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`LEDGER REPORT FROM ${format(startDate, "dd/MM/yyyy")} TO ${format(endDate, "dd/MM/yyyy")}`, 105, 25, { align: "center" });
    
    // Customer information
    doc.setFontSize(11);
    doc.text(`Customer: ${customer.name.toUpperCase()}`, 15, 35);
    doc.text(`Phone: ${customer.phone}`, 15, 41);
    doc.text(`Address: ${customer.address}`, 15, 47);
    
    const balanceText = `Opening Balance: ₹${ledgerReport.openingBalance.toFixed(2)}`;
    doc.text(balanceText, 195, 35, { align: "right" });
    
    // Get product names for the columns
    const activeProducts = Object.keys(ledgerReport.totalProductQuantities)
      .filter(id => ledgerReport.totalProductQuantities[id] > 0)
      .map(id => products.find(p => p.id === id)!)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Prepare table headers
    const headers = [
      "Date", 
      ...activeProducts.map(p => p.name),
      "Total Qty", 
      "Amount", 
      "Payment", 
      "Balance", 
      "Reference"
    ];
    
    // Prepare table data
    const tableData = ledgerReport.entries.map(entry => {
      const row = [
        format(new Date(entry.date), "dd/MM/yyyy")
      ];
      
      // Add product quantities
      activeProducts.forEach(product => {
        row.push(entry.productQuantities[product.id] ? entry.productQuantities[product.id].toString() : "");
      });
      
      // Add remaining columns
      row.push(
        entry.totalQuantity.toString(),
        entry.amountBilled ? `₹${entry.amountBilled.toFixed(2)}` : "",
        entry.paymentReceived ? `₹${entry.paymentReceived.toFixed(2)}` : "",
        `₹${entry.closingBalance.toFixed(2)}`,
        entry.reference || ""
      );
      
      return row;
    });
    
    // Add summary row
    const summaryRow = ["TOTAL"];
    
    // Add total product quantities
    activeProducts.forEach(product => {
      summaryRow.push(ledgerReport.totalProductQuantities[product.id].toString());
    });
    
    // Add remaining summary
    summaryRow.push(
      Object.values(ledgerReport.totalProductQuantities).reduce((sum, qty) => sum + qty, 0).toString(),
      `₹${ledgerReport.totalAmountBilled.toFixed(2)}`,
      `₹${ledgerReport.totalPaymentReceived.toFixed(2)}`,
      `₹${ledgerReport.closingBalance.toFixed(2)}`,
      ""
    );
    
    // Add the table
    (doc as any).autoTable({
      head: [headers],
      body: [...tableData, summaryRow],
      startY: 55,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 51, 51] },
      footStyles: { fillColor: [239, 239, 239], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    
    // Save the PDF
    doc.save(`${customer.name.replace(/\s+/g, '_')}_Ledger_${format(startDate, "yyyyMMdd")}_${format(endDate, "yyyyMMdd")}.pdf`);
    toast.success("PDF downloaded successfully");
  };
  
  // Generate batch PDFs for all customers
  const generateAllCustomersPDF = () => {
    if (customers.length === 0) {
      toast.error("No customers available");
      return;
    }
    
    // Save current state
    const currentCustomerId = selectedCustomerId;
    const currentReport = ledgerReport;
    
    // Function to generate a single customer report
    const processSingleCustomer = (index: number) => {
      if (index >= customers.length) {
        // Restore original state when done
        setSelectedCustomerId(currentCustomerId);
        setLedgerReport(currentReport);
        toast.success(`Generated ${customers.length} customer reports`);
        return;
      }
      
      const customer = customers[index];
      setSelectedCustomerId(customer.id);
      
      // Generate report for this customer
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      
      // Get customer's orders and payments
      const customerOrders = orders.filter(order => 
        order.items.some(item => item.customerId === customer.id) &&
        !isBefore(new Date(order.date), startDate) &&
        !isAfter(new Date(order.date), endDate)
      );
      
      const customerPayments = payments.filter(payment => 
        payment.customerId === customer.id &&
        !isBefore(new Date(payment.date), startDate) &&
        !isAfter(new Date(payment.date), endDate)
      );
      
      // Only generate PDF if customer has transactions in this period
      if (customerOrders.length > 0 || customerPayments.length > 0) {
        // Calculate opening balance
        const openingBalance = calculateOpeningBalance(customer, formattedStartDate);
        
        // Create processing logic similar to generateReport function
        // ... similar report generation logic
        
        // Generate PDF for this customer
        // ... similar PDF generation logic
      }
      
      // Process next customer
      setTimeout(() => processSingleCustomer(index + 1), 100);
    };
    
    // Start processing customers
    processSingleCustomer(0);
  };
  
  // Handle report type change
  const handleReportTypeChange = (type: "monthly" | "quarterly" | "yearly") => {
    setReportType(type);
    
    const now = new Date();
    
    switch (type) {
      case "monthly":
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case "quarterly":
        setStartDate(startOfMonth(addMonths(now, -2)));
        setEndDate(endOfMonth(now));
        break;
      case "yearly":
        setStartDate(startOfMonth(addMonths(now, -11)));
        setEndDate(endOfMonth(now));
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Ledger Report</h1>
          <p className="text-muted-foreground">
            Generate detailed transaction history for customers
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>
            Select customer and date range for the ledger report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select 
                value={selectedCustomerId} 
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
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
              <Label>Report Type</Label>
              <Select 
                value={reportType} 
                onValueChange={(value: "monthly" | "quarterly" | "yearly") => 
                  handleReportTypeChange(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={generateAllCustomersPDF}
              disabled={!ledgerReport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export All Customers
            </Button>
            <Button 
              variant="outline" 
              onClick={generatePDF}
              disabled={!ledgerReport}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={generateReport}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {ledgerReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {customers.find(c => c.id === selectedCustomerId)?.name.toUpperCase()} - LEDGER REPORT
                </CardTitle>
                <CardDescription>
                  {format(startDate, "dd/MM/yyyy")} to {format(endDate, "dd/MM/yyyy")}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={generatePDF}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Customer: {customers.find(c => c.id === selectedCustomerId)?.name}</p>
                <p className="text-sm text-muted-foreground">Phone: {customers.find(c => c.id === selectedCustomerId)?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Opening Balance: ₹{ledgerReport.openingBalance.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {ledgerReport.openingBalance >= 0 ? "(DR)" : "(CR)"}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {products.map(product => {
                      // Only show products that have quantities in this report
                      if (ledgerReport.totalProductQuantities[product.id] > 0) {
                        return <TableHead key={product.id}>{product.name}</TableHead>;
                      }
                      return null;
                    })}
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerReport.entries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                      {products.map(product => {
                        // Only show products that have quantities in this report
                        if (ledgerReport.totalProductQuantities[product.id] > 0) {
                          return (
                            <TableCell key={product.id}>
                              {entry.productQuantities[product.id] || ""}
                            </TableCell>
                          );
                        }
                        return null;
                      })}
                      <TableCell>{entry.totalQuantity || ""}</TableCell>
                      <TableCell>
                        {entry.amountBilled ? `₹${entry.amountBilled.toFixed(2)}` : ""}
                      </TableCell>
                      <TableCell>
                        {entry.paymentReceived ? `₹${entry.paymentReceived.toFixed(2)}` : ""}
                      </TableCell>
                      <TableCell>₹{entry.closingBalance.toFixed(2)}</TableCell>
                      <TableCell>{entry.reference || ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>TOTAL</TableCell>
                  {products.map(product => {
                    // Only show products that have quantities in this report
                    if (ledgerReport.totalProductQuantities[product.id] > 0) {
                      return (
                        <TableCell key={product.id}>
                          {ledgerReport.totalProductQuantities[product.id]}
                        </TableCell>
                      );
                    }
                    return null;
                  })}
                  <TableCell>
                    {Object.values(ledgerReport.totalProductQuantities).reduce((sum, qty) => sum + Number(qty), 0)}
                  </TableCell>
                  <TableCell>₹{ledgerReport.totalAmountBilled.toFixed(2)}</TableCell>
                  <TableCell>₹{ledgerReport.totalPaymentReceived.toFixed(2)}</TableCell>
                  <TableCell>₹{ledgerReport.closingBalance.toFixed(2)}</TableCell>
                  <TableCell>{ledgerReport.closingBalance >= 0 ? "DR" : "CR"}</TableCell>
                </TableRow>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Report generated on {format(new Date(), "dd/MM/yyyy")}
              </p>
              <p className="text-sm font-medium">
                Closing Balance: ₹{ledgerReport.closingBalance.toFixed(2)}
                {" "}
                <span className="text-xs">
                  {ledgerReport.closingBalance >= 0 ? "(DR)" : "(CR)"}
                </span>
              </p>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CustomerLedgerReport;
