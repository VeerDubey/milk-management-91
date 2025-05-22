
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, TrendingUp, TrendingDown, AlertTriangle, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function StockManagement() {
  const { 
    products, stockEntries, addStockEntry, 
    stockTransactions, addStockTransaction,
    suppliers
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [supplierId, setSupplierId] = useState('');
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const [notes, setNotes] = useState('');

  // Calculate current stock levels
  const stockLevels = products.map(product => {
    // Sum all stock entries for this product
    const incomingStock = stockEntries
      ?.filter(entry => entry.productId === product.id)
      .reduce((sum, entry) => sum + entry.quantity, 0) || 0;
    
    // Sum all outgoing transactions
    const outgoingStock = stockTransactions
      ?.filter(transaction => 
        transaction.productId === product.id && 
        transaction.type === 'out'
      )
      .reduce((sum, transaction) => sum + transaction.quantity, 0) || 0;
    
    // Sum all incoming transactions
    const additionalIncoming = stockTransactions
      ?.filter(transaction => 
        transaction.productId === product.id && 
        transaction.type === 'in'
      )
      .reduce((sum, transaction) => sum + transaction.quantity, 0) || 0;
    
    const currentStock = incomingStock + additionalIncoming - outgoingStock;
    
    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku || '',
      unit: product.unit || 'unit',
      currentStock,
      minStockLevel: product.minStockLevel || 0,
      lowStock: currentStock < (product.minStockLevel || 5)
    };
  });
  
  const filteredStock = stockLevels.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStock = () => {
    if (!selectedProductId || quantity <= 0 || !supplierId) {
      toast.error('Please fill all required fields');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (!product || !supplier) {
      toast.error('Invalid product or supplier selection');
      return;
    }

    addStockEntry({
      productId: selectedProductId,
      supplierId: supplierId,
      quantity: quantity,
      date: new Date().toISOString(),
      notes: notes
    });

    toast.success(`Added ${quantity} ${product.unit || 'units'} of ${product.name} to stock`);
    
    // Reset form
    setSelectedProductId('');
    setQuantity(0);
    setSupplierId('');
    setNotes('');
    setShowAddStockDialog(false);
  };

  const handleAddTransaction = () => {
    if (!selectedProductId || quantity <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    
    if (!product) {
      toast.error('Invalid product selection');
      return;
    }

    const stockLevel = stockLevels.find(s => s.productId === selectedProductId);
    
    if (transactionType === 'out' && (stockLevel?.currentStock || 0) < quantity) {
      toast.error(`Not enough stock. Current level: ${stockLevel?.currentStock} ${product.unit || 'units'}`);
      return;
    }

    addStockTransaction({
      productId: selectedProductId,
      type: transactionType,
      quantity: quantity,
      date: new Date().toISOString(),
      notes: notes
    });

    toast.success(
      transactionType === 'in' 
      ? `Added ${quantity} ${product.unit || 'units'} of ${product.name} to stock` 
      : `Removed ${quantity} ${product.unit || 'units'} of ${product.name} from stock`
    );
    
    // Reset form
    setSelectedProductId('');
    setQuantity(0);
    setTransactionType('in');
    setNotes('');
    setShowTransactionDialog(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Monitor and manage your inventory levels</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTransactionDialog(true)}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Record Stock Movement
          </Button>
          <Button onClick={() => setShowAddStockDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Stock
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Current Stock Levels</CardTitle>
              <CardDescription>Monitor product stock levels and receive alerts for low stock</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No products found. {searchQuery && "Try adjusting your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{item.currentStock}</TableCell>
                      <TableCell className="text-right">{item.minStockLevel}</TableCell>
                      <TableCell>
                        {item.lowStock ? (
                          <div className="flex items-center text-amber-500">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Low Stock
                          </div>
                        ) : (
                          <div className="flex items-center text-green-500">
                            <PackageCheck className="h-4 w-4 mr-1" />
                            In Stock
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddStockDialog} onOpenChange={setShowAddStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stock</DialogTitle>
            <DialogDescription>
              Record new inventory received from suppliers
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select 
                value={supplierId} 
                onValueChange={setSupplierId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
            <DialogDescription>
              Track inventory additions or removals
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Movement Type</Label>
              <Select 
                value={transactionType} 
                onValueChange={(value) => setTransactionType(value as 'in' | 'out')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                      Stock In
                    </div>
                  </SelectItem>
                  <SelectItem value="out">
                    <div className="flex items-center">
                      <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                      Stock Out
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for stock movement"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddTransaction}>Record Movement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
