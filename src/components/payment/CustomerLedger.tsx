
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Plus, History, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CustomerTransaction {
  id: string;
  customerId: string;
  date: string;
  type: 'order' | 'payment';
  orderId?: string;
  amount: number;
  paid: number;
  balance: number;
  description: string;
}

export function CustomerLedger() {
  const { customers, orders, payments, addPayment, updateCustomer } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    reference: '',
    notes: ''
  });

  // Calculate customer transactions and balances
  const customerTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    
    const customerOrders = orders.filter(order => order.customerId === selectedCustomerId);
    const customerPayments = payments.filter(payment => payment.customerId === selectedCustomerId);
    
    const transactions: CustomerTransaction[] = [];
    let runningBalance = 0;
    
    // Add orders
    customerOrders.forEach(order => {
      runningBalance += order.total;
      transactions.push({
        id: order.id,
        customerId: selectedCustomerId,
        date: order.date,
        type: 'order',
        orderId: order.id,
        amount: order.total,
        paid: 0,
        balance: runningBalance,
        description: `Order #${order.id.slice(-6)}`
      });
    });
    
    // Add payments
    customerPayments.forEach(payment => {
      runningBalance -= payment.amount;
      transactions.push({
        id: payment.id,
        customerId: selectedCustomerId,
        date: payment.date,
        type: 'payment',
        amount: 0,
        paid: payment.amount,
        balance: runningBalance,
        description: `Payment - ${payment.paymentMethod}`
      });
    });
    
    // Sort by date
    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedCustomerId, orders, payments]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const customerSummary = useMemo(() => {
    if (!selectedCustomer) return null;
    
    const totalOrders = orders
      .filter(order => order.customerId === selectedCustomerId)
      .reduce((sum, order) => sum + order.total, 0);
    
    const totalPaid = payments
      .filter(payment => payment.customerId === selectedCustomerId)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const balanceDue = totalOrders - totalPaid;
    
    return {
      totalOrders,
      totalPaid,
      balanceDue,
      orderCount: orders.filter(order => order.customerId === selectedCustomerId).length,
      paymentCount: payments.filter(payment => payment.customerId === selectedCustomerId).length
    };
  }, [selectedCustomerId, orders, payments, selectedCustomer]);

  const handlePaymentSubmit = () => {
    if (!selectedCustomerId || paymentFormData.amount <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // Add payment
      addPayment({
        customerId: selectedCustomerId,
        amount: paymentFormData.amount,
        date: paymentFormData.date,
        paymentMethod: paymentFormData.paymentMethod as any,
        reference: paymentFormData.reference,
        notes: paymentFormData.notes
      });

      // Update customer balance
      if (selectedCustomer && customerSummary) {
        const newTotalPaid = customerSummary.totalPaid + paymentFormData.amount;
        const newBalanceDue = customerSummary.totalOrders - newTotalPaid;
        
        updateCustomer(selectedCustomerId, {
          totalPaid: newTotalPaid,
          balanceDue: newBalanceDue,
          lastPaymentDate: paymentFormData.date,
          lastPaymentAmount: paymentFormData.amount
        });
      }

      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentFormData({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        reference: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent-color" />
            Customer Ledger
          </CardTitle>
          <CardDescription className="neo-noir-text-muted">
            View customer transaction history and manage payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="neo-noir-text">Select Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="Choose a customer to view ledger" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex flex-col">
                        <span>{customer.name}</span>
                        <span className="text-sm text-orange-400">
                          Balance: ₹{(customer.outstandingBalance || 0).toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCustomerId && (
              <div className="flex items-end">
                <Button 
                  onClick={() => setShowPaymentModal(true)}
                  className="neo-noir-button-accent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Summary */}
      {selectedCustomer && customerSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-400">₹{customerSummary.totalOrders.toLocaleString()}</p>
                  <p className="text-xs neo-noir-text-muted">{customerSummary.orderCount} orders</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Total Paid</p>
                  <p className="text-2xl font-bold text-green-400">₹{customerSummary.totalPaid.toLocaleString()}</p>
                  <p className="text-xs neo-noir-text-muted">{customerSummary.paymentCount} payments</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Balance Due</p>
                  <p className="text-2xl font-bold text-orange-400">₹{customerSummary.balanceDue.toLocaleString()}</p>
                  <p className="text-xs neo-noir-text-muted">Outstanding amount</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="neo-noir-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="neo-noir-text-muted text-sm font-medium">Payment Ratio</p>
                  <p className="text-2xl font-bold text-accent-color">
                    {customerSummary.totalOrders > 0 ? 
                      ((customerSummary.totalPaid / customerSummary.totalOrders) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-xs neo-noir-text-muted">Paid vs ordered</p>
                </div>
                <History className="h-8 w-8 text-accent-color" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      {selectedCustomer && customerTransactions.length > 0 && (
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text">Transaction History - {selectedCustomer.name}</CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Complete transaction history showing orders and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="neo-noir-table">
              <TableHeader>
                <TableRow className="neo-noir-table-header">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Order Amount</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="text-right">Running Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="neo-noir-table-row">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(transaction.date), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'order' ? 'destructive' : 'default'}>
                        {transaction.type === 'order' ? 'Order' : 'Payment'}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'order' ? (
                        <span className="text-red-400">₹{transaction.amount.toLocaleString()}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'payment' ? (
                        <span className="text-green-400">₹{transaction.paid.toLocaleString()}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={transaction.balance > 0 ? 'text-orange-400' : 'text-green-400'}>
                        ₹{transaction.balance.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="neo-noir-surface">
          <DialogHeader>
            <DialogTitle className="neo-noir-text">Record Payment</DialogTitle>
            <DialogDescription className="neo-noir-text-muted">
              Record a new payment for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Payment Amount</Label>
                <Input
                  type="number"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="neo-noir-input"
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Payment Date</Label>
                <Input
                  type="date"
                  value={paymentFormData.date}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="neo-noir-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Payment Method</Label>
              <Select 
                value={paymentFormData.paymentMethod} 
                onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger className="neo-noir-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Reference</Label>
              <Input
                value={paymentFormData.reference}
                onChange={(e) => setPaymentFormData(prev => ({ ...prev, reference: e.target.value }))}
                className="neo-noir-input"
                placeholder="Payment reference..."
              />
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Notes</Label>
              <Input
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="neo-noir-input"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit} className="neo-noir-button-accent">
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
