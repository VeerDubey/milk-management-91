
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Package, Calculator } from 'lucide-react';
import { useInvoiceForm } from './InvoiceFormContext';
import { MILK_PRODUCTS } from '@/utils/invoiceTemplates';
import { formatCurrency } from '@/utils/currencyUtils';
import { toast } from 'sonner';

export default function ItemDetailsSection() {
  const { formData, updateFormData } = useInvoiceForm();
  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    description: '',
    quantity: 1,
    unit: 'liter',
    rate: 0
  });

  const addItem = () => {
    if (!newItem.productName || newItem.quantity <= 0 || newItem.rate <= 0) {
      toast.error('Please fill all item details');
      return;
    }

    const item = {
      id: `item-${Date.now()}`,
      productId: newItem.productId,
      productName: newItem.productName,
      description: newItem.description,
      quantity: newItem.quantity,
      unit: newItem.unit,
      rate: newItem.rate,
      total: newItem.quantity * newItem.rate
    };

    updateFormData({
      items: [...formData.items, item]
    });

    setNewItem({
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unit: 'liter',
      rate: 0
    });

    toast.success('Item added successfully');
  };

  const removeItem = (itemId: string) => {
    updateFormData({
      items: formData.items.filter(item => item.id !== itemId)
    });
    toast.success('Item removed');
  };

  const updateItem = (itemId: string, updates: any) => {
    updateFormData({
      items: formData.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.rate || item.rate) }
          : item
      )
    });
  };

  const selectProduct = (productId: string) => {
    const product = MILK_PRODUCTS.find(p => p.id === productId);
    if (product) {
      setNewItem({
        ...newItem,
        productId: product.id,
        productName: product.name,
        description: product.description,
        unit: product.unit,
        rate: product.defaultRate
      });
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <Package className="h-5 w-5" />
          Item Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Item */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Item
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select value={newItem.productId} onValueChange={selectProduct}>
                <SelectTrigger className="modern-input">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent className="modern-card">
                  {MILK_PRODUCTS.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={newItem.productName}
                onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                placeholder="Enter product name"
                className="modern-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                <SelectTrigger className="modern-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="modern-card">
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="ml">Milliliter</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="gm">Gram</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                className="modern-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Rate ({formData.currency.symbol}) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newItem.rate}
                onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })}
                className="modern-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Total</Label>
              <div className="modern-input bg-muted/50 flex items-center">
                {formatCurrency(newItem.quantity * newItem.rate, formData.currency)}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label>Description</Label>
            <Textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Optional product description"
              className="modern-input"
            />
          </div>

          <Button onClick={addItem} className="modern-button w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Items List */}
        {formData.items.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Added Items:</h4>
            {formData.items.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg bg-white/50">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Product</Label>
                    <div className="font-medium">{item.productName}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="modern-input h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <div className="text-sm text-muted-foreground">{item.unit}</div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Rate</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                      className="modern-input h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Total</Label>
                    <div className="font-medium text-primary">
                      {formatCurrency(item.total, formData.currency)}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calculations Summary */}
        {formData.items.length > 0 && (
          <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5" />
              <h4 className="font-medium">Invoice Summary</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(formData.subtotal, formData.currency)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Tax %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.taxPercentage}
                    onChange={(e) => updateFormData({ taxPercentage: parseFloat(e.target.value) || 0 })}
                    className="modern-input h-8"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Discount Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => updateFormData({ discountAmount: parseFloat(e.target.value) || 0 })}
                    className="modern-input h-8"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <span>Tax Amount:</span>
                <span className="font-medium">{formatCurrency(formData.taxAmount, formData.currency)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-medium">-{formatCurrency(formData.discountAmount, formData.currency)}</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Grand Total:</span>
                <span>{formatCurrency(formData.grandTotal, formData.currency)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
