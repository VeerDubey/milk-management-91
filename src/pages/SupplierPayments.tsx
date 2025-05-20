import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { SupplierPayment, Supplier } from "@/types";
import { toast } from "sonner";

const SupplierPayments = () => {
  const {
    suppliers,
    supplierPayments,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment,
  } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bank" | "upi" | "other"
  >("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [editingPayment, setEditingPayment] = useState<SupplierPayment | null>(
    null
  );

  const handleAddPayment = () => {
    if (!selectedSupplier || !amount || !paymentDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    addSupplierPayment({
      supplierId: selectedSupplier,
      amount: parseFloat(amount),
      date: format(paymentDate, "yyyy-MM-dd"),
      paymentMethod: paymentMethod, // Use paymentMethod instead of method
      referenceNumber: referenceNumber,
      notes: notes,
    });

    resetForm();
    setDialogOpen(false);
    toast.success("Payment added successfully");
  };

  const handleEditPayment = (payment: SupplierPayment) => {
    setSelectedSupplier(payment.supplierId);
    setAmount(payment.amount.toString());
    setPaymentDate(new Date(payment.date));
    setPaymentMethod(payment.paymentMethod); // Use paymentMethod instead of method
    setReferenceNumber(payment.referenceNumber || "");
    setNotes(payment.notes || "");
    setEditingPayment(payment);
    setDialogOpen(true);
  };

  const handleUpdatePayment = () => {
    if (!editingPayment) return;

    updateSupplierPayment(editingPayment.id, {
      supplierId: selectedSupplier,
      amount: parseFloat(amount),
      date: format(paymentDate, "yyyy-MM-dd"),
      paymentMethod: paymentMethod, // Use paymentMethod instead of method
      referenceNumber: referenceNumber,
      notes: notes,
    });

    resetForm();
    setDialogOpen(false);
    toast.success("Payment updated successfully");
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      deleteSupplierPayment(id);
      toast.success("Payment deleted successfully");
    }
  };

  const resetForm = () => {
    setSelectedSupplier("");
    setAmount("");
    setPaymentDate(new Date());
    setPaymentMethod("cash");
    setReferenceNumber("");
    setNotes("");
    setEditingPayment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier Payments
          </h1>
          <p className="text-muted-foreground">
            Manage and track payments to suppliers
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment List</CardTitle>
          <CardDescription>View and manage supplier payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference Number</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {
                        suppliers.find((supplier) => supplier.id === payment.supplierId)?.name
                      }
                    </TableCell>
                    <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(payment.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{payment.referenceNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? "Edit Payment" : "Add Payment"}
            </DialogTitle>
            <DialogDescription>
              {editingPayment
                ? "Update the payment details below."
                : "Enter the payment details to create a new payment."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "w-[240px] justify-start text-left font-normal" +
                      (paymentDate ? " pl-3.5" : "")
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? (
                      format(paymentDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  sideOffset={5}
                >
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    className="rounded-md border"
                    style={{ width: "300px" }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "cash" | "bank" | "upi" | "other")
                }
              >
                <SelectTrigger id="paymentMethod">
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
            <div className="grid gap-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={editingPayment ? handleUpdatePayment : handleAddPayment}>
              {editingPayment ? "Update Payment" : "Add Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierPayments;
