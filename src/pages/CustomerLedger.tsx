import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Printer, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { exportToPdf } from "@/utils/pdfUtils";
import { exportToExcel } from "@/utils/excelUtils";
import { toast } from "sonner";

export default function CustomerLedger() {
  const { customers, payments, orders } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  // Combine orders and payments for ledger entries
  const getLedgerEntries = () => {
    if (!selectedCustomer) return [];

    const customerOrders = orders.filter(order => order.customerId === selectedCustomer);
    const customerPayments = payments.filter(payment => payment.customerId === selectedCustomer);

    const ledgerEntries = [
      ...customerOrders.map(order => ({
        date: new Date(order.date),
        type: 'Order',
        description: `Order #${order.id}`,
        debit: order.total, // Using total instead of totalAmount
        credit: 0,
        balance: order.total // Using total instead of totalAmount
      })),
      ...customerPayments.map(payment => ({
        date: new Date(payment.date),
        type: 'Payment',
        description: `Payment - ${payment.paymentMethod}`,
        debit: 0,
        credit: payment.amount,
        balance: -payment.amount
      }))
    ];

    // Sort by date
    ledgerEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance
    let runningBalance = 0;
    ledgerEntries.forEach(entry => {
      runningBalance = runningBalance + entry.debit - entry.credit;
      entry.balance = runningBalance;
    });

    // Filter by date range if set
    if (dateRange?.from && dateRange?.to) {
      return ledgerEntries.filter(entry => 
        entry.date >= dateRange.from! && 
        entry.date <= dateRange.to!
      );
    }

    return ledgerEntries;
  };
  
  // Helper function to calculate order total if not already available
  const calculateOrderTotal = (order: any) => {
    if (order.totalAmount) return order.totalAmount;
    
    let total = 0;
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        if (item.price && item.quantity) {
          total += item.price * item.quantity;
        }
      });
    }
    return total;
  };

  const ledgerEntries = getLedgerEntries();
  const customer = customers.find(c => c.id === selectedCustomer);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportToPdf = () => {
    if (!customer) {
      toast.error("Please select a customer first");
      return;
    }
    
    const headers = [
      "Date", "Description", "Type", "Debit (₹)", "Credit (₹)", "Balance (₹)"
    ];
    
    const data = ledgerEntries.map(entry => [
      format(entry.date, "dd/MM/yyyy"),
      entry.description,
      entry.type,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      entry.balance.toFixed(2)
    ]);
    
    const dateInfo = dateRange?.from && dateRange?.to
      ? `Period: ${format(dateRange.from, "dd/MM/yyyy")} to ${format(dateRange.to, "dd/MM/yyyy")}`
      : "All transactions";
    
    exportToPdf(
      headers,
      data,
      {
        title: `Customer Ledger: ${customer.name}`,
        subtitle: dateInfo,
        dateInfo: `Generated on ${format(new Date(), "dd/MM/yyyy")}`,
        additionalInfo: [
          { label: "Phone", value: customer.phone || "N/A" },
          { label: "Address", value: customer.address || "N/A" },
          { label: "Current Balance", value: `₹${ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance.toFixed(2) : "0.00"}` }
        ],
        filename: `customer-ledger-${customer.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
      }
    );
    
    toast.success("Ledger exported to PDF");
  };
  
  const handleExportToExcel = () => {
    if (!customer) {
      toast.error("Please select a customer first");
      return;
    }
    
    const headers = [
      "Date", "Description", "Type", "Debit (₹)", "Credit (₹)", "Balance (₹)"
    ];
    
    const data = ledgerEntries.map(entry => [
      format(entry.date, "dd/MM/yyyy"),
      entry.description,
      entry.type,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      entry.balance.toFixed(2)
    ]);
    
    exportToExcel(
      headers,
      data,
      `customer-ledger-${customer.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`
    );
    
    toast.success("Ledger exported to Excel");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Ledger</h1>
        <p className="text-muted-foreground">
          View transaction history and balance for individual customers
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Select a customer and date range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select 
                value={selectedCustomer} 
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>

            <Button className="w-full gap-2">
              <Search className="h-4 w-4" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ledger Entries</CardTitle>
              <CardDescription>
                {customer ? `${customer.name}'s transaction history` : 'Select a customer to view ledger'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleExportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={handleExportToPdf}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              ledgerEntries.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerEntries.map((entry, i) => (
                        <TableRow key={i}>
                          <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>{entry.type}</TableCell>
                          <TableCell className="text-right">{entry.debit.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{entry.credit.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">{entry.balance.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No transactions found for the selected criteria
                </div>
              )
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Select a customer to view their ledger
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
