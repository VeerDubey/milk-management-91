
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { StockEntry, StockEntryItem } from '@/types';

interface PurchaseItem extends StockEntryItem {
  tempId?: string;
}

export function PurchaseEntryForm() {
  const { suppliers, products, addStockEntry, updateProduct } = useData();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');

  // Add initial empty item
  useEffect(() => {
    if (items.length === 0) {
      addItem();
    }
  }, []);

  const addItem = () => {
    const newItem: PurchaseItem = {
      tempId: `temp_${Date.now()}_${Math.random()}`,
      productId: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].totalPrice = quantity * unitPrice;
    }
    
    setItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }
    
    if (items.length === 0 || items.every(item => !item.productId || item.quantity <= 0)) {
      toast.error('Please add at least one valid item');
      return;
    }
    
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    
    const purchaseEntry: Omit<StockEntry, 'id'> = {
      supplierId: selectedSupplier,
      date: format(purchaseDate, 'yyyy-MM-dd'),
      items: validItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      totalAmount: calculateTotalAmount(),
      paymentStatus,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString()
    };
    
    addStockEntry(purchaseEntry);
    
    // Update product stock levels
    validItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const newStock = (product.stock || 0) + item.quantity;
        updateProduct(item.productId, { stock: newStock });
      }
    });
    
    toast.success('Purchase entry created successfully');
    
    // Reset form
    setSelectedSupplier('');
    setReferenceNumber('');
    setNotes('');
    setItems([]);
    setPaymentStatus('unpaid');
    addItem(); // Add new empty item
  };

  const resetForm = () => {
    setSelectedSupplier('');
    setReferenceNumber('');
    setNotes('');
    setItems([]);
    setPaymentStatus('unpaid');
    addItem();
  };

  return (
    <div className="space-y-6">
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">New Purchase Entry</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Record a new purchase from suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Supplier *</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    {suppliers.filter(s => s.isActive).map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Purchase Date *</Label>
                <DatePicker
                  date={purchaseDate}
                  setDate={setPurchaseDate}
                  className="neo-noir-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Reference Number</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter reference number"
                  className="neo-noir-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(value: 'paid' | 'partial' | 'unpaid') => setPaymentStatus(value)}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="neo-noir-text text-lg font-medium">Purchase Items</Label>
                <Button
                  type="button"
                  onClick={addItem}
                  className="neo-noir-button-accent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table className="neo-noir-table">
                  <TableHeader>
                    <TableRow className="neo-noir-table-header">
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price (₹)</TableHead>
                      <TableHead>Total (₹)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.tempId || index} className="neo-noir-table-row">
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(index, 'productId', value)}
                          >
                            <SelectTrigger className="neo-noir-input">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent className="neo-noir-surface">
                              {products.filter(p => p.isActive).map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="neo-noir-input"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="neo-noir-input"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{(item.totalPrice || 0).toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="neo-noir-button-ghost text-red-400"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold neo-noir-text">
                    Total Amount: ₹{calculateTotalAmount().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="neo-noir-text">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes..."
                className="neo-noir-input"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" className="neo-noir-button-accent">
                <Save className="mr-2 h-4 w-4" />
                Save Purchase Entry
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="neo-noir-button-outline">
                <X className="mr-2 h-4 w-4" />
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
