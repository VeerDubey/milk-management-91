import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  FileText,
  Save,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const SupplierPayments = () => {
  const {
    suppliers,
    supplierPayments,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment,
  } = useData();

  // Supplier form state
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [supplierNotes, setSupplierNotes] = useState("");

  // Payment form state
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SupplierPayment | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  // Get payments for the selected supplier
  const payments = selectedSupplierId
    ? supplierPayments.filter(
        (payment) => payment.supplierId === selectedSupplierId
      )
    : supplierPayments;

  // Supplier CRUD operations
  const handleAddSupplier = () => {
    const newSupplier = {
      name: supplierName,
      contactName: contactPerson, // Changed to match the interface
      phone: supplierPhone,
      email: supplierEmail,
      address: supplierAddress,
      gstNumber: gstNumber,
      outstandingBalance: 0,
      notes: supplierNotes,
      products: [], // Added required property
      isActive: true // Added required property
    };

    addSupplier(newSupplier);
    toast.success("Supplier added successfully");
    
    // Reset form
    setSupplierName("");
    setContactPerson("");
    setSupplierPhone("");
    setSupplierEmail("");
    setSupplierAddress("");
    setGstNumber("");
    setSupplierNotes("");
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setContactPerson(supplier.contactName || "");
    setSupplierPhone(supplier.phone);
    setSupplierEmail(supplier.email || "");
    setSupplierAddress(supplier.address);
    setGstNumber(supplier.gstNumber || "");
    setSupplierNotes(supplier.notes || "");
    setIsAddingSupplier(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (window.confirm("Are you sure you want to delete this supplier? This cannot be undone.")) {
      deleteSupplier(supplierId);
      toast.success("Supplier deleted successfully");
    }
  };

  const resetSupplierForm = () => {
    setIsAddingSupplier(false);
    setEditingSupplier(null);
    setSupplierName("");
    setContactPerson("");
    setSupplierPhone("");
    setSupplierEmail("");
    setSupplierAddress("");
    setGstNumber("");
    setSupplierNotes("");
  };

  // Payment CRUD operations
  const handleAddPayment = () => {
    if (!selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }

    const newPayment = {
      supplierId: selectedSupplierId,
      amount: parseFloat(paymentAmount),
      date: format(paymentDate, "yyyy-MM-dd"),
      paymentMethod: paymentMethod as 'cash' | 'bank' | 'upi' | 'other',
      notes: paymentNotes,
      referenceNumber: referenceNumber
    };

    addSupplierPayment(newPayment);
    toast.success("Payment added successfully");
    
    // Reset form
    setSelectedSupplierId("");
    setPaymentAmount("");
    setPaymentDate(new Date());
    setPaymentMethod("cash");
    setPaymentNotes("");
    setReferenceNumber("");
  };

  const handleEditPayment = (payment: SupplierPayment) => {
    setEditingPayment(payment);
    setSelectedSupplierId(payment.supplierId);
    setPaymentAmount(payment.amount.toString());
    setPaymentDate(new Date(payment.date));
    setPaymentMethod(payment.paymentMethod);
    setPaymentNotes(payment.notes || "");
    setReferenceNumber(payment.referenceNumber || "");
    setIsAddingPayment(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (window.confirm("Are you sure you want to delete this payment? This cannot be undone.")) {
      deleteSupplierPayment(paymentId);
      toast.success("Payment deleted successfully");
    }
  };

  const resetPaymentForm = () => {
    setIsAddingPayment(false);
    setEditingPayment(null);
    setSelectedSupplierId("");
    setPaymentAmount("");
    setPaymentDate(new Date());
    setPaymentMethod("cash");
    setPaymentNotes("");
    setReferenceNumber("");
  };

  // Update functions
  const handleUpdateSupplier = () => {
    if (!editingSupplier) return;

    updateSupplier(editingSupplier.id, {
      name: supplierName,
      contactName: contactPerson, // Changed from contactPerson to match interface
      phone: supplierPhone,
      email: supplierEmail,
      address: supplierAddress,
      gstNumber: gstNumber,
      notes: supplierNotes
    });
    toast.success("Supplier updated successfully");
    resetSupplierForm();

    setEditingSupplier(prevState => {
      if (prevState) {
        return {
          ...prevState,
          name: supplierName,
          contactName: contactPerson,
          phone: supplierPhone,
          email: supplierEmail,
          address: supplierAddress,
          gstNumber: gstNumber,
          notes: supplierNotes
        };
      }
      return prevState;
    });

    setIsAddingSupplier(false);
  };

  const handleUpdatePayment = () => {
    if (!editingPayment) return;

    updateSupplierPayment(editingPayment.id, {
      supplierId: selectedSupplierId,
      amount: parseFloat(paymentAmount),
      date: format(paymentDate, "yyyy-MM-dd"),
      paymentMethod: paymentMethod as 'cash' | 'bank' | 'upi' | 'other',
      notes: paymentNotes,
      referenceNumber: referenceNumber
    });
    toast.success("Payment updated successfully");
    resetPaymentForm();

    setEditingPayment(prevState => {
      if (prevState) {
        return {
          ...prevState,
          amount: parseFloat(paymentAmount),
          date: format(paymentDate, "yyyy-MM-dd"),
          paymentMethod: paymentMethod as 'cash' | 'bank' | 'upi' | 'other',
          notes: paymentNotes,
          referenceNumber: referenceNumber
        };
      }
      return prevState;
    });

    setIsAddingPayment(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier Payments
          </h1>
          <p className="text-muted-foreground">
            Manage supplier payments and records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddingPayment(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Supplier Payments Management</CardTitle>
            <Button variant="outline" onClick={() => setIsAddingSupplier(true)}>
              <Truck className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Add Supplier Dialog */}
            <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Truck className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSupplier
                      ? "Update supplier details below"
                      : "Add supplier details to create a new supplier."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplierPhone">Phone</Label>
                    <Input
                      id="supplierPhone"
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplierEmail">Email</Label>
                    <Input
                      id="supplierEmail"
                      type="email"
                      value={supplierEmail}
                      onChange={(e) => setSupplierEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplierAddress">Address</Label>
                    <Input
                      id="supplierAddress"
                      value={supplierAddress}
                      onChange={(e) => setSupplierAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplierNotes">Notes</Label>
                    <Textarea
                      id="supplierNotes"
                      value={supplierNotes}
                      onChange={(e) => setSupplierNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary" onClick={resetSupplierForm}>
                      Cancel
                    </Button>
                  </DialogClose>
                  {editingSupplier ? (
                    <Button onClick={handleUpdateSupplier}>Update Supplier</Button>
                  ) : (
                    <Button onClick={handleAddSupplier}>Add Supplier</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Payment Dialog */}
            <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingPayment ? "Edit Payment" : "Add New Payment"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPayment
                      ? "Update payment details below"
                      : "Add payment details to create a new payment."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      value={selectedSupplierId}
                      onValueChange={setSelectedSupplierId}
                    >
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Select a supplier" />
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
                    <Label htmlFor="paymentAmount">Payment Amount</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={format(paymentDate, "yyyy-MM-dd")}
                      onChange={(e) => setPaymentDate(new Date(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
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
                    <Label htmlFor="paymentNotes">Payment Notes</Label>
                    <Textarea
                      id="paymentNotes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="referenceNumber">Reference Number</Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary" onClick={resetPaymentForm}>
                      Cancel
                    </Button>
                  </DialogClose>
                  {editingPayment ? (
                    <Button onClick={handleUpdatePayment}>Update Payment</Button>
                  ) : (
                    <Button onClick={handleAddPayment}>Add Payment</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Suppliers List */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Suppliers</h3>
              {suppliers.map(supplier => (
                <div key={supplier.id} className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-medium">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payments List */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Payments</h3>
              {payments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-medium">
                      ₹{payment.amount.toFixed(2)} - {format(new Date(payment.date), "dd/MM/yyyy")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Ref: {payment.referenceNumber || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierPayments;
