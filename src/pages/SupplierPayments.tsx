
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SupplierPayment } from '@/types';
import { format, parse, isValid } from 'date-fns';
import { toast } from 'sonner';

// Add TanStack React Table dependencies
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

export default function SupplierPayments() {
  const { suppliers, supplierPayments, addSupplierPayment, deleteSupplierPayment } = useData();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'upi' | 'other'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<SupplierPayment[]>([]);

  useEffect(() => {
    setFilteredPayments(supplierPayments);
  }, [supplierPayments]);

  const handleAddPayment = () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const payment = {
      supplierId: selectedSupplier,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod,
      date: format(paymentDate, 'yyyy-MM-dd'),
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    };

    addSupplierPayment(payment);
    toast.success("Payment added successfully");

    // Reset form
    setSelectedSupplier('');
    setAmount('');
    setPaymentMethod('cash');
    setReferenceNumber('');
    setNotes('');
    setPaymentDate(new Date());
    setIsAddingPayment(false);
  };

  const handleDeletePayment = (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      deleteSupplierPayment(id);
      toast.success("Payment deleted successfully");
    }
  };

  const columns: ColumnDef<SupplierPayment>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
        return isValid(parsedDate) ? format(parsedDate, 'dd/MM/yyyy') : date;
      }
    },
    {
      accessorKey: 'supplierId',
      header: 'Supplier',
      cell: ({ row }) => {
        const supplierId = row.getValue('supplierId') as string;
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier?.name || 'Unknown Supplier';
      }
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `₹${(row.getValue('amount') as number).toFixed(2)}`
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.original.paymentMethod || row.original.method; // Use either paymentMethod or method
        return method ? method.toUpperCase() : 'N/A';
      }
    },
    {
      accessorKey: 'referenceNumber',
      header: 'Reference',
      cell: ({ row }) => row.getValue('referenceNumber') || '-'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(row.original.id)}>
          Delete
        </Button>
      )
    }
  ];

  const table = useReactTable({
    data: filteredPayments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Payments</h1>
          <p className="text-muted-foreground">Manage payments made to suppliers</p>
        </div>
        <div>
          <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
            <DialogTrigger asChild>
              <Button>Add Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Supplier Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select value={selectedSupplier} onValueChange={(value: string) => setSelectedSupplier(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <DatePicker date={paymentDate} setDate={setPaymentDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select 
                    value={paymentMethod} 
                    onValueChange={(value: 'cash' | 'bank' | 'upi' | 'other') => setPaymentMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Transaction ID / Reference"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleAddPayment}>Add Payment</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent payments made to suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b bg-muted/50">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="h-24 text-center">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
