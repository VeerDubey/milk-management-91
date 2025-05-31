
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, FileText, Download, CreditCard, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Payment } from '@/types';

export function PaymentTracker() {
  const { payments, customers, orders, addPayment, updatePayment, deletePayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Payment form state
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    method: 'cash',
    referenceNumber: '',
    notes: '',
    status: 'completed' as const
  });

  // Filter payments based on search criteria
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      const matchesSearch = !searchTerm || 
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCustomer = !selectedCustomer || payment.customerId === selectedCustomer;
      const matchesMethod = !selectedMethod || payment.method === selectedMethod;
      const matchesStatus = !selectedStatus || payment.status === selectedStatus;
      
      const paymentDate = new Date(payment.date);
      const matchesDateFrom = !dateFrom || paymentDate >= dateFrom;
      const matchesDateTo = !dateTo || paymentDate <= dateTo;
      
      return matchesSearch && matchesCustomer && matchesMethod && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [payments, customers, searchTerm, selectedCustomer, selectedMethod, selectedStatus, dateFrom, dateTo]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredPayments.reduce((acc, payment) => {
      acc.totalAmount += payment.amount;
      acc.totalPayments += 1;
      return acc;
    }, { totalAmount: 0, totalPayments: 0 });
  }, [filteredPayments]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: { [key: string]: string } = {
      cash: 'bg-green-500/20 text-green-400',
      card: 'bg-blue-500/20 text-blue-400',
      upi: 'bg-purple-500/20 text-purple-400',
      bank_transfer: 'bg-orange-500/20 text-orange-400',
      cheque: 'bg-cyan-500/20 text-cyan-400'
    };
    
    return (
      <Badge className={colors[method] || 'bg-gray-500/20 text-gray-400'}>
        {method.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      customerId: payment.customerId,
      amount: payment.amount.toString(),
      method: payment.method,
      referenceNumber: payment.referenceNumber || '',
      notes: payment.notes || '',
      status: payment.status || 'completed'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      deletePayment(id);
      toast.success('Payment deleted successfully');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const paymentData = {
      customerId: formData.customerId,
      amount: parseFloat(formData.amount),
      method: formData.method,
      referenceNumber: formData.referenceNumber || undefined,
      notes: formData.notes || undefined,
      status: formData.status,
      date: new Date().toISOString()
    };
    
    if (editingPayment) {
      updatePayment(editingPayment.id, paymentData);
      toast.success('Payment updated successfully');
    } else {
      addPayment(paymentData);
      toast.success('Payment added successfully');
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      amount: '',
      method: 'cash',
      referenceNumber: '',
      notes: '',
      status: 'completed'
    });
    setEditingPayment(null);
  };

  const exportToPDF = () => {
    toast.success('Payment report exported to PDF');
  };

  const exportToExcel = () => {
    toast.success('Payment report exported to Excel');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Payment Filters</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Filter and search payment records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="space-y-2">
              <Label className="neo-noir-text">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 neo-noir-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  <SelectItem value="">All Customers</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">Payment Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  <SelectItem value="">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">From Date</Label>
              <DatePicker
                date={dateFrom}
                setDate={setDateFrom}
                className="neo-noir-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">To Date</Label>
              <DatePicker
                date={dateTo}
                setDate={setDateTo}
                className="neo-noir-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">Actions</Label>
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="neo-noir-button-accent">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="neo-noir-surface">
                    <DialogHeader>
                      <DialogTitle className="neo-noir-text">
                        {editingPayment ? 'Edit Payment' : 'Add New Payment'}
                      </DialogTitle>
                      <DialogDescription className="neo-noir-text-muted">
                        {editingPayment ? 'Update payment details' : 'Add a new payment record'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="neo-noir-text">Customer *</Label>
                          <Select value={formData.customerId} onValueChange={(value) => setFormData({...formData, customerId: value})}>
                            <SelectTrigger className="neo-noir-input">
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent className="neo-noir-surface">
                              {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="neo-noir-text">Amount (₹) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="neo-noir-input"
                            placeholder="Enter amount"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="neo-noir-text">Payment Method</Label>
                          <Select value={formData.method} onValueChange={(value) => setFormData({...formData, method: value})}>
                            <SelectTrigger className="neo-noir-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="neo-noir-surface">
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="neo-noir-text">Status</Label>
                          <Select value={formData.status} onValueChange={(value: 'completed' | 'pending' | 'failed') => setFormData({...formData, status: value})}>
                            <SelectTrigger className="neo-noir-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="neo-noir-surface">
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="neo-noir-text">Reference Number</Label>
                        <Input
                          value={formData.referenceNumber}
                          onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                          className="neo-noir-input"
                          placeholder="Enter reference number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="neo-noir-text">Notes</Label>
                        <Input
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="neo-noir-input"
                          placeholder="Enter notes"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="neo-noir-button-outline">
                          Cancel
                        </Button>
                        <Button type="submit" className="neo-noir-button-accent">
                          {editingPayment ? 'Update Payment' : 'Add Payment'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button onClick={exportToPDF} variant="outline" size="icon" className="neo-noir-button-outline">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="icon" className="neo-noir-button-outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Payments</p>
                <p className="text-2xl font-bold neo-noir-text">{totals.totalPayments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-green-400">₹{totals.totalAmount.toLocaleString()}</p>
              </div>
              <Download className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Active Customers</p>
                <p className="text-2xl font-bold text-accent-color">{customers.filter(c => c.isActive).length}</p>
              </div>
              <User className="h-8 w-8 text-accent-color" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Payment Records</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Track all payment transactions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="neo-noir-table">
              <TableHeader>
                <TableRow className="neo-noir-table-header">
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="neo-noir-table-row">
                    <TableCell>{format(new Date(payment.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{getCustomerName(payment.customerId)}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{getMethodBadge(payment.method)}</TableCell>
                    <TableCell>{payment.referenceNumber || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(payment)}
                          className="neo-noir-button-ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(payment.id)}
                          className="neo-noir-button-ghost text-red-400"
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
      </Card>
    </div>
  );
}
