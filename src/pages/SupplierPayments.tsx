
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Plus, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/excelUtils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function SupplierPayments() {
  const { suppliers, supplierPayments, addSupplierPayment, updateSupplierPayment, deleteSupplierPayment } = useData();
  const [supplierId, setSupplierId] = useState<string>('');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'upi' | 'other'>('cash');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [filteredPayments, setFilteredPayments] = useState(supplierPayments);

  useEffect(() => {
    setFilteredPayments(supplierPayments);
  }, [supplierPayments]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = supplierPayments.filter(payment =>
      suppliers.find(supplier => supplier.id === payment.supplierId)?.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPayments(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId || !amount || !date) {
      toast.error("Please fill in all fields.");
      return;
    }

    const paymentData = {
      supplierId,
      amount,
      paymentMethod,
      date: format(date, 'yyyy-MM-dd'),
    };

    if (isEditMode && editPaymentId) {
      updateSupplierPayment(editPaymentId, paymentData);
      toast.success("Payment updated successfully.");
    } else {
      addSupplierPayment(paymentData);
      toast.success("Payment added successfully.");
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const payment = supplierPayments.find(payment => payment.id === id);
    if (payment) {
      setIsEditMode(true);
      setEditPaymentId(id);
      setSupplierId(payment.supplierId);
      setAmount(payment.amount);
      setPaymentMethod(payment.paymentMethod || 'cash');
      setDate(payment.date ? new Date(payment.date) : undefined);
    }
  };

  const handleDelete = (id: string) => {
    if (id) {
      deleteSupplierPayment(id);
      toast.success("Payment deleted successfully.");
    }
  };

  const resetForm = () => {
    setSupplierId('');
    setAmount(undefined);
    setPaymentMethod('cash');
    setDate(undefined);
    setIsEditMode(false);
    setEditPaymentId(null);
  };

  const exportToExcelData = () => {
    const headers = ["Supplier", "Amount", "Method", "Date"];
    const data = filteredPayments.map(payment => {
      const supplier = suppliers.find(supplier => supplier.id === payment.supplierId);
      return [supplier?.name, payment.amount, payment.paymentMethod || payment.method || 'cash', payment.date];
    });
    exportToExcel(headers, data, 'supplier-payments');
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.text("Supplier Payments", 10, 10);

    const headers = ["Supplier", "Amount", "Method", "Date"];
    const data = filteredPayments.map(payment => {
      const supplier = suppliers.find(supplier => supplier.id === payment.supplierId);
      return [supplier?.name, payment.amount, payment.paymentMethod || payment.method || 'cash', payment.date];
    });

    (doc as any).autoTable({
      head: [headers],
      body: data,
    });

    doc.save('supplier-payments.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Payments</h1>
          <p className="text-muted-foreground">Record and manage payments made to suppliers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToExcelData}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button onClick={() => {
            exportToPdf();
            toast.success("PDF exported successfully");
          }}>
            <FileText className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Payment" : "Add Payment"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierId">Supplier</Label>
                <Select value={supplierId} onValueChange={(value) => setSupplierId(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  id="amount"
                  value={amount !== undefined ? amount.toString() : ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={(value: string) => setPaymentMethod(value as 'cash' | 'bank' | 'upi' | 'other')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={date ? "w-full justify-start text-left font-normal" : "w-full justify-start text-left font-normal text-muted-foreground"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{isEditMode ? "Update Payment" : "Add Payment"}</Button>
              {isEditMode && (
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <Input
            type="search"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md ml-auto"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your recent payments to suppliers.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(payment => {
                  const supplier = suppliers.find(s => s.id === payment.supplierId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{supplier?.name || "Unknown"}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.paymentMethod || payment.method || "cash"}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(payment.id)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(payment.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
