
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CreditCard, Save, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePayment() {
  const { customers, orders } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  
  // Get customer's outstanding orders
  const getCustomerOrders = (customerId: string) => {
    return orders.filter(order => 
      order.customerId === customerId && 
      order.paymentStatus !== 'paid'
    );
  };
  
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);
  const customerOrders = selectedCustomer ? getCustomerOrders(selectedCustomer) : [];
  const totalOutstanding = customerOrders.reduce((sum, order) => sum + order.total, 0);
  
  const handleSavePayment = () => {
    if (!selectedCustomer || !amount || !paymentMethod) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Create payment record
    const payment = {
      id: `pay-${Date.now()}`,
      customerId: selectedCustomer,
      customerName: selectedCustomerData?.name || '',
      amount: paymentAmount,
      method: paymentMethod,
      date: format(paymentDate, 'yyyy-MM-dd'),
      reference,
      notes,
      createdAt: new Date().toISOString()
    };
    
    // Save payment to localStorage
    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    existingPayments.push(payment);
    localStorage.setItem('payments', JSON.stringify(existingPayments));
    
    // Reset form
    setSelectedCustomer('');
    setAmount('');
    setPaymentMethod('');
    setReference('');
    setNotes('');
    
    toast.success('Payment recorded successfully');
  };
  
  const generateReceipt = () => {
    if (!selectedCustomer || !amount) {
      toast.error('Please select customer and enter amount');
      return;
    }
    
    const receiptData = {
      customer: selectedCustomerData?.name || '',
      amount: parseFloat(amount),
      method: paymentMethod,
      date: format(paymentDate, 'yyyy-MM-dd'),
      reference
    };
    
    // Simple receipt generation
    const receiptContent = `
      PAYMENT RECEIPT
      ================
      
      Customer: ${receiptData.customer}
      Amount: ₹${receiptData.amount.toFixed(2)}
      Method: ${receiptData.method}
      Date: ${receiptData.date}
      Reference: ${receiptData.reference}
      
      Thank you for your payment!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.customer}-${receiptData.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Payment</h1>
          <p className="text-muted-foreground">Record customer payments and generate receipts</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateReceipt} variant="outline">
            <Receipt className="mr-2 h-4 w-4" />
            Generate Receipt
          </Button>
          <Button onClick={handleSavePayment}>
            <Save className="mr-2 h-4 w-4" />
            Save Payment
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.filter(c => c.isActive).map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Payment Date</Label>
              <DatePicker
                date={paymentDate}
                setDate={setPaymentDate}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction ID, Cheque number, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomerData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Total Outstanding:</span>
                  <span className="text-lg font-bold text-yellow-700">
                    ₹{totalOutstanding.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Outstanding Orders:</h4>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-2">
                      {customerOrders.map(order => (
                        <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <div className="font-medium">Order #{order.id}</div>
                            <div className="text-sm text-gray-500">{order.date}</div>
                          </div>
                          <div className="font-medium">₹{order.total.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No outstanding orders</p>
                  )}
                </div>
                
                {amount && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between">
                      <span>Payment Amount:</span>
                      <span className="font-medium">₹{parseFloat(amount || '0').toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Balance:</span>
                      <span className="font-medium">
                        ₹{Math.max(0, totalOutstanding - parseFloat(amount || '0')).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Select a customer to view outstanding amounts</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
