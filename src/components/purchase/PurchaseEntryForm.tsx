
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface PurchaseFormData {
  supplierId: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod: string;
  notes: string;
}

export function PurchaseEntryForm() {
  const { suppliers, products, addSupplierPayment, updateSupplier } = useData();
  
  const [formData, setFormData] = useState<PurchaseFormData>({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ productId: '', productName: '', quantity: 0, rate: 0, amount: 0 }],
    totalAmount: 0,
    paidAmount: 0,
    balance: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', productName: '', quantity: 0, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
      calculateTotal(newItems);
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
      }
    }
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotal(newItems);
  };

  const calculateTotal = (items: PurchaseItem[]) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    setFormData(prev => ({
      ...prev,
      totalAmount: total,
      balance: total - prev.paidAmount
    }));
  };

  const handlePaidAmountChange = (paidAmount: number) => {
    setFormData(prev => ({
      ...prev,
      paidAmount,
      balance: prev.totalAmount - paidAmount
    }));
  };

  const handleSubmit = () => {
    if (!formData.supplierId || formData.items.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // Create purchase entry
      const purchaseId = `PUR${Date.now()}`;
      
      // Update supplier balance
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      if (supplier) {
        const newTotalPurchases = (supplier.totalPurchases || 0) + formData.totalAmount;
        const newTotalPaid = (supplier.totalPaid || 0) + formData.paidAmount;
        const newBalanceDue = newTotalPurchases - newTotalPaid;
        
        updateSupplier(formData.supplierId, {
          totalPurchases: newTotalPurchases,
          totalPaid: newTotalPaid,
          balanceDue: newBalanceDue,
          lastPurchaseDate: formData.date
        });

        // Add payment record if payment was made
        if (formData.paidAmount > 0) {
          addSupplierPayment({
            supplierId: formData.supplierId,
            amount: formData.paidAmount,
            date: formData.date,
            paymentMethod: formData.paymentMethod,
            reference: purchaseId,
            description: `Payment for Purchase ${purchaseId}`,
            notes: formData.notes
          });
        }

        toast.success('Purchase entry created successfully');
        
        // Reset form
        setFormData({
          supplierId: '',
          date: new Date().toISOString().split('T')[0],
          items: [{ productId: '', productName: '', quantity: 0, rate: 0, amount: 0 }],
          totalAmount: 0,
          paidAmount: 0,
          balance: 0,
          paymentMethod: 'cash',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error('Failed to create purchase entry');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent-color" />
            New Purchase Entry
          </CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Record a new purchase with automatic balance tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supplier and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="neo-noir-text">Supplier *</Label>
              <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex flex-col">
                        <span>{supplier.name}</span>
                        <span className="text-sm text-orange-400">
                          Balance: ₹{(supplier.balanceDue || 0).toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Purchase Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="neo-noir-input"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="neo-noir-text text-lg">Purchase Items</Label>
              <Button onClick={addItem} size="sm" className="neo-noir-button-accent">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            <Table className="neo-noir-table">
              <TableHeader>
                <TableRow className="neo-noir-table-header">
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Rate (₹)</TableHead>
                  <TableHead className="text-center">Amount (₹)</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index} className="neo-noir-table-row">
                    <TableCell>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => updateItem(index, 'productId', value)}
                      >
                        <SelectTrigger className="neo-noir-input min-w-48">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent className="neo-noir-surface">
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="neo-noir-input text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="neo-noir-input text-center"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      ₹{item.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        onClick={() => removeItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-400/20"
                        disabled={formData.items.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="neo-noir-table-total">
                  <TableCell className="font-bold">TOTAL</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-center font-bold text-lg">
                    ₹{formData.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 neo-noir-surface rounded-lg border border-accent-color/20">
            <div className="space-y-2">
              <Label className="neo-noir-text">Amount Paid</Label>
              <Input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                className="neo-noir-input"
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
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
              <Label className="neo-noir-text">Balance Due</Label>
              <div className="flex items-center h-10 px-3 neo-noir-input bg-orange-400/20">
                <span className="font-semibold text-orange-400">
                  ₹{formData.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="neo-noir-text">Notes</Label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="neo-noir-input"
              placeholder="Additional notes..."
            />
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full neo-noir-button-accent">
            <Save className="mr-2 h-4 w-4" />
            Save Purchase Entry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
