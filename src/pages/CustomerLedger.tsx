
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Download, FileText, Search } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

export default function CustomerLedger() {
  const { customers, orders, payments } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  type LedgerEntry = {
    id: string;
    date: string;
    description: string;
    type: "order" | "payment";
    debit: number;
    credit: number;
    balance: number;
    reference: string;
  };

  const calculateLedgerEntries = (): LedgerEntry[] => {
    if (!selectedCustomerId) return [];

    // Get customer orders and payments within date range
    const customerOrders = orders.filter(
      (order) => order.customerId === selectedCustomerId &&
        new Date(order.date) >= (startDate || new Date(0)) &&
        new Date(order.date) <= (endDate || new Date())
    );
    
    const customerPayments = payments.filter(
      (payment) => payment.customerId === selectedCustomerId &&
        new Date(payment.date) >= (startDate || new Date(0)) &&
        new Date(payment.date) <= (endDate || new Date())
    );

    // Combine and sort by date
    const entries: LedgerEntry[] = [
      ...customerOrders.map((order) => ({
        id: `order-${order.id}`,
        date: order.date,
        description: "Order",
        type: "order" as const,
        debit: order.totalAmount || order.total || 0,
        credit: 0,
        balance: 0, // Will calculate later
        reference: order.id,
      })),
      ...customerPayments.map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.date,
        description: "Payment",
        type: "payment" as const,
        debit: 0,
        credit: payment.amount,
        balance: 0, // Will calculate later
        reference: payment.id,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = 0;
    entries.forEach((entry) => {
      balance += entry.debit - entry.credit;
      entry.balance = balance;
    });

    return entries;
  };

  const ledgerEntries = calculateLedgerEntries();

  const filteredEntries = ledgerEntries.filter(
    (entry) =>
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDateRangeChange = (type: "start" | "end", date?: Date) => {
    if (type === "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const handleGenerateReport = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    
    toast.success("Generating ledger report...");
    // In a real application, we would generate a report here
  };

  // Calculate summary
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const balance = totalDebit - totalCredit;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Ledger</h1>
          <p className="text-muted-foreground">
            View and track customer transactions
          </p>
        </div>
        <Button onClick={handleGenerateReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger Filters</CardTitle>
          <CardDescription>
            Select a customer and date range to view their ledger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="customer-select" className="block text-sm font-medium mb-1">
                Customer
              </label>
              <Select
                value={selectedCustomerId}
                onValueChange={(value) => setSelectedCustomerId(value)}
              >
                <SelectTrigger id="customer-select">
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
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <DatePicker
                date={startDate}
                setDate={(date) => handleDateRangeChange("start", date)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DatePicker
                date={endDate}
                setDate={(date) => handleDateRangeChange("end", date)}
              />
            </div>
            <div className="relative">
              <label htmlFor="search-ledger" className="block text-sm font-medium mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-ledger"
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCustomerId && (
        <Card>
          <CardHeader>
            <CardTitle>
              {customers.find((c) => c.id === selectedCustomerId)?.name} - Ledger
            </CardTitle>
            <CardDescription>
              Showing {filteredEntries.length} transactions from{" "}
              {startDate ? format(startDate, "dd/MM/yyyy") : "beginning"} to{" "}
              {endDate ? format(endDate, "dd/MM/yyyy") : "now"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit (₹)</TableHead>
                    <TableHead className="text-right">Credit (₹)</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {format(new Date(entry.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {entry.type === "order" ? (
                              <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                            ) : (
                              <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
                            )}
                            {entry.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                            {entry.reference}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.debit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.balance.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No transactions found for the selected criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredEntries.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Debit:</span>
                  <span className="font-medium">₹{totalDebit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Credit:</span>
                  <span className="font-medium">₹{totalCredit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Current Balance:</span>
                  <span>₹{balance.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
