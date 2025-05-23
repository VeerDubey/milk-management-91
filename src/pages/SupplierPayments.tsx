import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Search, Plus, Pencil, Trash2, Download, ArrowUpDown,
  Calendar, CreditCard, AlertCircle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { ElectronService } from '@/services/ElectronService';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function SupplierPayments() {
  const { toast } = useToast();
  const {
    suppliers,
    supplierPayments,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment
  } = useData();
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    id: '',
    supplierId: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash', // Using string to support more payment methods
    reference: '',
    description: '',
    notes: '',
    receiptNumber: '',
    transactionId: '',
    bankDetails: ''
  });
  
  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = supplierPayments;
    
    // Filter by supplier
    if (selectedSupplierId !== 'all') {
      filtered = filtered.filter(payment => payment.supplierId === selectedSupplierId);
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => {
        const supplier = suppliers.find(s => s.id === payment.supplierId);
        return (
          supplier?.name.toLowerCase().includes(search) ||
          payment.reference?.toLowerCase().includes(search) ||
          payment.description?.toLowerCase().includes(search) ||
          payment.paymentMethod?.toLowerCase().includes(search) ||
          payment.receiptNumber?.toLowerCase().includes(search) ||
          payment.transactionId?.toLowerCase().includes(search)
        );
      });
    }
    
    return filtered;
  }, [supplierPayments, selectedSupplierId, searchTerm, suppliers]);
  
  // Sort payments
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortColumn) {
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'supplier':
          const supplierA = suppliers.find(s => s.id === a.supplierId);
          const supplierB = suppliers.find(s => s.id === b.supplierId);
          valueA = supplierA?.name?.toLowerCase() || '';
          valueB = supplierB?.name?.toLowerCase() || '';
          break;
        case 'paymentMethod':
          valueA = a.paymentMethod?.toLowerCase() || '';
          valueB = b.paymentMethod?.toLowerCase() || '';
          break;
        default:
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredPayments, sortColumn, sortDirection, suppliers]);
  
  // Calculate total amount
  const totalAmount = useMemo(() => {
    return sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [sortedPayments]);
  
  // Cash and bank transfer calculations
  const cashPayments = useMemo(() => {
    return sortedPayments
      .filter(p => p.paymentMethod === 'cash')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [sortedPayments]);
  
  const bankTransferPayments = useMemo(() => {
    return sortedPayments
      .filter(p => ['bank_transfer', 'online', 'bank'].includes(p.paymentMethod))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [sortedPayments]);
  
  const cashPaymentCount = useMemo(() => {
    return sortedPayments.filter(p => p.paymentMethod === 'cash').length;
  }, [sortedPayments]);
  
  const bankTransferCount = useMemo(() => {
    return sortedPayments.filter(p => 
      ['bank_transfer', 'online', 'bank'].includes(p.paymentMethod)
    ).length;
  }, [sortedPayments]);
  
  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Function to open dialog for adding new payment
  const openAddPaymentDialog = () => {
    setPaymentFormData({
      id: '',
      supplierId: selectedSupplierId === 'all' ? '' : selectedSupplierId,
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'cash',
      reference: '',
      description: '',
      notes: '',
      receiptNumber: '',
      transactionId: '',
      bankDetails: ''
    });
    setIsPaymentDialogOpen(true);
  };
  
  // Function to open dialog for editing payment
  const openEditPaymentDialog = (payment: any) => {
    setPaymentFormData({
      id: payment.id,
      supplierId: payment.supplierId,
      amount: payment.amount,
      date: payment.date,
      paymentMethod: payment.paymentMethod || 'cash',
      reference: payment.reference || '',
      description: payment.description || '',
      notes: payment.notes || '',
      receiptNumber: payment.receiptNumber || '',
      transactionId: payment.transactionId || '',
      bankDetails: payment.bankDetails || ''
    });
    setIsPaymentDialogOpen(true);
  };
  
  // Function to handle form changes
  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setPaymentFormData({
      ...paymentFormData,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    });
  };
  
  // Function to handle form submission
  const handlePaymentFormSubmit = () => {
    if (!paymentFormData.supplierId) {
      toast({
        title: "Validation Error",
        description: "Supplier selection is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (paymentFormData.id) {
        // Update existing payment
        updateSupplierPayment(paymentFormData.id, paymentFormData);
        toast({
          title: "Payment Updated",
          description: "Supplier payment has been updated successfully"
        });
      } else {
        // Add new payment
        const supplier = suppliers.find(s => s.id === paymentFormData.supplierId);
        addSupplierPayment(paymentFormData);
        toast({
          title: "Payment Added",
          description: `Payment to ${supplier?.name || 'supplier'} has been recorded successfully`
        });
      }
      
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: "Error",
        description: "Failed to save supplier payment",
        variant: "destructive"
      });
    }
  };
  
  // Function to confirm delete
  const confirmDelete = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDeleteDialogOpen(true);
  };
  
  // Function to handle delete
  const handleDeletePayment = () => {
    if (!selectedPaymentId) return;
    
    try {
      deleteSupplierPayment(selectedPaymentId);
      toast({
        title: "Payment Deleted",
        description: "Supplier payment has been deleted successfully"
      });
      setIsDeleteDialogOpen(false);
      setSelectedPaymentId(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier payment",
        variant: "destructive"
      });
    }
  };
  
  // Function to export payments
  const exportPayments = async () => {
    const headers = [
      'Date', 'Supplier', 'Amount', 'Payment Method', 'Reference', 'Description', 'Receipt Number', 'Transaction ID'
    ];
    
    const rows = sortedPayments.map(payment => {
      const supplier = suppliers.find(s => s.id === payment.supplierId);
      return [
        payment.date,
        supplier?.name || 'Unknown Supplier',
        payment.amount.toFixed(2),
        payment.paymentMethod || '',
        payment.reference || '',
        payment.description || '',
        payment.receiptNumber || '',
        payment.transactionId || ''
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    try {
      await ElectronService.exportData(csvData, `supplier-payments-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Payments Exported",
        description: "Supplier payments have been exported successfully"
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the payments",
        variant: "destructive"
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Payments</h1>
      
      <div className="flex flex-col space-y-6">
        {/* Filters and controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>Record and track payments to suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="supplierFilter" className="block text-sm font-medium mb-1">Filter by Supplier</label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger id="supplierFilter">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-1">Search Payments</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search payments..."
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button onClick={openAddPaymentDialog} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {sortedPayments.length} payment transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{cashPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {cashPaymentCount} transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bank Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{bankTransferPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {bankTransferCount} transactions
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Payments table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>List of all payments made to suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      Date
                      {sortColumn === 'date' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('supplier')}
                    >
                      Supplier
                      {sortColumn === 'supplier' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      {sortColumn === 'amount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('paymentMethod')}
                    >
                      Payment Method
                      {sortColumn === 'paymentMethod' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No payment records found.
                        <div className="mt-2">
                          <Button variant="outline" onClick={openAddPaymentDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Record New Payment
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPayments.map((payment) => {
                      const supplier = suppliers.find(s => s.id === payment.supplierId);
                      
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(payment.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{supplier?.name || 'Unknown Supplier'}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{payment.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.paymentMethod ? payment.paymentMethod.replace('_', ' ') : 'Cash'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.reference || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditPaymentDialog(payment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(payment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                {sortedPayments.length} payments totaling ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            <Button variant="outline" onClick={exportPayments}>
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Payment dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{paymentFormData.id ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
            <DialogDescription>
              {paymentFormData.id ? 'Update the payment details below.' : 'Enter the payment details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="supplierId">Supplier</Label>
                <Select
                  value={paymentFormData.supplierId}
                  onValueChange={(value) => setPaymentFormData({...paymentFormData, supplierId: value})}
                  disabled={!!paymentFormData.id} // Disable supplier change for existing payments
                >
                  <SelectTrigger id="supplierId">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={paymentFormData.amount}
                  onChange={handlePaymentFormChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date">Payment Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={paymentFormData.date}
                  onChange={handlePaymentFormChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentFormData.paymentMethod}
                  onValueChange={(value) => setPaymentFormData({...paymentFormData, paymentMethod: value})}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={paymentFormData.reference}
                  onChange={handlePaymentFormChange}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={paymentFormData.description}
                  onChange={handlePaymentFormChange}
                />
              </div>
              
              {(paymentFormData.paymentMethod === 'bank_transfer' || 
                paymentFormData.paymentMethod === 'online' || 
                paymentFormData.paymentMethod === 'upi') && (
                <div className="col-span-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    name="transactionId"
                    value={paymentFormData.transactionId}
                    onChange={handlePaymentFormChange}
                  />
                </div>
              )}
              
              {paymentFormData.paymentMethod === 'cheque' && (
                <div className="col-span-2">
                  <Label htmlFor="bankDetails">Bank & Cheque Details</Label>
                  <Input
                    id="bankDetails"
                    name="bankDetails"
                    value={paymentFormData.bankDetails}
                    onChange={handlePaymentFormChange}
                  />
                </div>
              )}
              
              <div className="col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={paymentFormData.notes}
                  onChange={handlePaymentFormChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handlePaymentFormSubmit}>
              {paymentFormData.id ? 'Update Payment' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this payment record.
              This action cannot be undone and may affect supplier balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePayment} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
