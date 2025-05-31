import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { generateInvoicePdf, printInvoice } from '@/utils/invoiceUtils';
import { Order, OrderItem } from '@/types';

interface InvoiceGeneratorProps {
  order?: Order;
  onClose?: () => void;
}

export default function InvoiceGenerator({ order, onClose }: InvoiceGeneratorProps) {
  const { customers, products, addInvoice } = useData();
  
  const [formData, setFormData] = useState({
    customerId: order?.customerId || '',
    customerName: order?.customerName || '',
    date: order?.date || new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: order?.items || [],
    notes: '',
    termsAndConditions: 'Payment due within 15 days. Late payments may incur additional charges.'
  });
  
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: '',
    unitPrice: ''
  });
  
  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) {
      toast.error('Please fill all item details');
      return;
    }
    
    const product = products.find(p => p.id === newItem.productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }
    
    const item: OrderItem = {
      id: `item-${Date.now()}`,
      productId: newItem.productId,
      productName: product.name,
      quantity: Number(newItem.quantity),
      unitPrice: Number(newItem.unitPrice),
      unit: product.unit
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    
    setNewItem({ productId: '', quantity: '', unitPrice: '' });
  };
  
  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };
  
  const handleGenerateInvoice = async () => {
    if (!formData.customerId || formData.items.length === 0) {
      toast.error('Please select customer and add items');
      return;
    }
    
    try {
      const customer = customers.find(c => c.id === formData.customerId);
      if (!customer) {
        toast.error('Customer not found');
        return;
      }
      
      const invoice = {
        number: `INV-${Date.now().toString().slice(-6)}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customerId: formData.customerId,
        customerName: customer.name,
        date: formData.date,
        dueDate: formData.dueDate,
        items: formData.items,
        subtotal: calculateTotal(),
        taxRate: 0,
        taxAmount: 0,
        total: calculateTotal(),
        status: 'draft' as const,
        notes: formData.notes,
        termsAndConditions: formData.termsAndConditions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      addInvoice(invoice);
      toast.success('Invoice created successfully');
      onClose?.();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!formData.customerId || formData.items.length === 0) {
      toast.error('Please complete the invoice details first');
      return;
    }
    
    try {
      const customer = customers.find(c => c.id === formData.customerId);
      if (!customer) {
        toast.error('Customer not found');
        return;
      }
      
      const invoiceData = {
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        },
        date: formData.date,
        dueDate: formData.dueDate,
        items: formData.items,
        subtotal: calculateTotal(),
        total: calculateTotal(),
        notes: formData.notes,
        termsAndConditions: formData.termsAndConditions
      };
      
      generateInvoicePdf(invoiceData);
      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };
  
  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="text-gradient flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {order ? 'Generate Invoice from Order' : 'Create New Invoice'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={formData.customerId} onValueChange={(value) => {
              const customer = customers.find(c => c.id === value);
              setFormData(prev => ({
                ...prev,
                customerId: value,
                customerName: customer?.name || ''
              }));
            }}>
              <SelectTrigger className="modern-input">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="modern-card">
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Invoice Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="modern-input"
            />
          </div>
        </div>
        
        {/* Add Item Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Invoice Items</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Select value={newItem.productId} onValueChange={(value) => {
              const product = products.find(p => p.id === value);
              setNewItem(prev => ({
                ...prev,
                productId: value,
                unitPrice: product?.price.toString() || ''
              }));
            }}>
              <SelectTrigger className="modern-input">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className="modern-card">
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
              className="modern-input"
            />
            
            <Input
              placeholder="Unit Price"
              type="number"
              step="0.01"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: e.target.value }))}
              className="modern-input"
            />
            
            <Button onClick={handleAddItem} className="modern-button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Items List */}
        {formData.items.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Items:</h4>
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-muted-foreground ml-2">
                    {item.quantity} × ₹{item.unitPrice} = ₹{(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="text-right text-lg font-bold">
              Total: ₹{calculateTotal().toFixed(2)}
            </div>
          </div>
        )}
        
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes for the invoice..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="modern-input"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleGenerateInvoice} className="modern-button flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button onClick={handleDownloadPdf} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
