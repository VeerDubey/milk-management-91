import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Supplier, SupplierPayment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Truck } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SupplierLedger = () => {
  const { suppliers, supplierPayments } = useData();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Get the selected supplier
  const selectedSupplier = selectedSupplierId
    ? suppliers.find((s) => s.id === selectedSupplierId)
    : null;

  // Get payments for the selected supplier
  const supplierPaymentsList = selectedSupplierId
    ? supplierPayments
        .filter((payment) => payment.supplierId === selectedSupplierId)
        .sort((a, b) => {
          // Sort by date (most recent first)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
    : [];

  // Filter by date if date is selected
  const filteredPayments = date
    ? supplierPaymentsList.filter(
        (payment) =>
          format(new Date(payment.date), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
      )
    : supplierPaymentsList;

  // Calculate totals
  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  // Generate PDF report
  const generatePDF = () => {
    if (!selectedSupplier) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Supplier Ledger Report", 14, 22);
    
    // Add supplier details
    doc.setFontSize(12);
    doc.text(`Supplier: ${selectedSupplier.name}`, 14, 32);
    doc.text(`Contact: ${selectedSupplier.phone}`, 14, 38);
    doc.text(`Address: ${selectedSupplier.address}`, 14, 44);
    if (selectedSupplier.email) {
      doc.text(`Email: ${selectedSupplier.email}`, 14, 50);
    }
    
    if (date) {
      doc.text(`Date: ${format(date, "dd/MM/yyyy")}`, 14, 56);
    } else {
      doc.text(`Date: All records`, 14, 56);
    }
    
    // Add payment table
    const tableData = filteredPayments.map((payment) => [
      format(new Date(payment.date), "dd/MM/yyyy"),
      payment.referenceNumber || "-",
      payment.paymentMethod,
      payment.notes || "-",
      `₹${payment.amount.toFixed(2)}`,
    ]);
    
    // Add total row
    tableData.push([
      "",
      "",
      "",
      "Total",
      `₹${totalAmount.toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [["Date", "Invoice #", "Payment Method", "Notes", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [75, 75, 75] },
    });
    
    // Save the PDF
    doc.save(`Supplier_Ledger_${selectedSupplier.name.replace(/ /g, "_")}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Supplier Ledger
        </h1>
        <p className="text-muted-foreground">
          Track financial transactions with suppliers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Ledger Report</CardTitle>
          <CardDescription>
            View and download supplier ledger reports with date-wise entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <label htmlFor="supplier" className="text-sm font-medium">
                Select Supplier
              </label>
              <Select
                value={selectedSupplierId || ""}
                onValueChange={setSelectedSupplierId}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex items-center">
                        <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{supplier.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 sm:col-span-2 flex items-end">
              <div className="space-x-2 flex">
                {date && (
                  <Button
                    variant="outline"
                    onClick={() => setDate(undefined)}
                    className="mt-auto"
                  >
                    Clear Date
                  </Button>
                )}
                <Button
                  onClick={generatePDF}
                  disabled={!selectedSupplierId || filteredPayments.length === 0}
                  className="mt-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Ledger
                </Button>
              </div>
            </div>
          </div>

          {selectedSupplier && (
            <div className="mb-6 p-4 border rounded-md bg-muted/50">
              <h3 className="text-lg font-medium mb-2">Supplier Details</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Name:</p>
                  <p>{selectedSupplier.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone:</p>
                  <p>{selectedSupplier.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Address:</p>
                  <p>{selectedSupplier.address}</p>
                </div>
                {selectedSupplier.email && (
                  <div>
                    <p className="text-sm font-medium">Email:</p>
                    <p>{selectedSupplier.email}</p>
                  </div>
                )}
                {selectedSupplier.outstandingBalance !== undefined && (
                  <div>
                    <p className="text-sm font-medium">Outstanding Balance:</p>
                    <p className={`${selectedSupplier.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                      ₹{selectedSupplier.outstandingBalance.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedSupplierId ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Please select a supplier to view their ledger.
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No payment records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                            {payment.referenceNumber || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.paymentMethod}
                        </TableCell>
                        <TableCell>{payment.notes || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{payment.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-right font-medium"
                      >
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierLedger;
