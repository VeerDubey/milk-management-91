
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'cash' | 'digital' | 'cheque';
  date: string;
  orderId?: string;
  status: 'completed' | 'pending';
}

interface CustomerLedger {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalPaid: number;
  balanceDue: number;
  lastPaymentDate: string;
}

export function PaymentTracker() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Mock data
  const customerLedgers: CustomerLedger[] = [
    { customerId: '1', customerName: 'SHAMIM DAIRY', totalOrders: 25000, totalPaid: 22000, balanceDue: 3000, lastPaymentDate: '2025-05-29' },
    { customerId: '2', customerName: 'INDIA DAIRY', totalOrders: 18500, totalPaid: 18500, balanceDue: 0, lastPaymentDate: '2025-05-30' },
    { customerId: '3', customerName: 'FRESH MILK CENTER', totalOrders: 32000, totalPaid: 30000, balanceDue: 2000, lastPaymentDate: '2025-05-28' },
  ];

  const recentPayments: Payment[] = [
    { id: '1', customerId: '1', customerName: 'SHAMIM DAIRY', amount: 1500, method: 'digital', date: '2025-05-30', status: 'completed' },
    { id: '2', customerId: '2', customerName: 'INDIA DAIRY', amount: 2000, method: 'cash', date: '2025-05-30', status: 'completed' },
    { id: '3', customerId: '3', customerName: 'FRESH MILK CENTER', amount: 1800, method: 'cheque', date: '2025-05-29', status: 'pending' },
  ];

  const handlePaymentSubmit = () => {
    if (!selectedCustomer || !paymentAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success('Payment recorded successfully');
    setShowPaymentModal(false);
    setSelectedCustomer('');
    setPaymentAmount('');
  };

  const totalOutstanding = customerLedgers.reduce((sum, ledger) => sum + ledger.balanceDue, 0);
  const totalPaid = customerLedgers.reduce((sum, ledger) => sum + ledger.totalPaid, 0);

  return (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Outstanding</p>
                <p className="text-2xl font-bold text-orange-400">₹{totalOutstanding.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Collected</p>
                <p className="text-2xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-400">
                  {((totalPaid / (totalPaid + totalOutstanding)) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Ledger */}
      <Card className="neo-noir-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="neo-noir-text">Customer Ledger</CardTitle>
              <CardDescription className="neo-noir-text-muted">
                Track customer balances and payment history
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="neo-noir-button-accent"
            >
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="neo-noir-table">
            <TableHeader>
              <TableRow className="neo-noir-table-header">
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Last Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerLedgers.map((ledger) => (
                <TableRow key={ledger.customerId} className="neo-noir-table-row">
                  <TableCell className="font-medium">{ledger.customerName}</TableCell>
                  <TableCell className="text-right">₹{ledger.totalOrders.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-400">₹{ledger.totalPaid.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-orange-400">₹{ledger.balanceDue.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ledger.balanceDue === 0 ? "default" : "destructive"}>
                      {ledger.balanceDue === 0 ? 'Clear' : 'Outstanding'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{ledger.lastPaymentDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Recent Payments</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Latest payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="neo-noir-table">
            <TableHeader>
              <TableRow className="neo-noir-table-header">
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Method</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((payment) => (
                <TableRow key={payment.id} className="neo-noir-table-row">
                  <TableCell className="font-medium">{payment.customerName}</TableCell>
                  <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{payment.method.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{payment.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={payment.status === 'completed' ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="neo-noir-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="neo-noir-text">Record Payment</CardTitle>
              <CardDescription className="neo-noir-text-muted">
                Register a new payment from customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    {customerLedgers.map(ledger => (
                      <SelectItem key={ledger.customerId} value={ledger.customerId}>
                        {ledger.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="neo-noir-text">Payment Amount</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="neo-noir-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="neo-noir-text">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setShowPaymentModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePaymentSubmit}
                  className="flex-1 neo-noir-button-accent"
                >
                  Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
