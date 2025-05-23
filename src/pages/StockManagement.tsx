
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/data/DataContext';
import { PlusCircle, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function StockManagement() {
  const { products, stockEntries, addStockEntry } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  // Filter stock entries based on search term
  const filteredStock = stockEntries.filter(
    entry => {
      const product = products.find(p => {
        if (entry.items && entry.items.length > 0) {
          return entry.items.some(item => item.productId === p.id);
        } else {
          return false;
        }
      });
      return product && product.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );
  
  const handleAddStock = () => {
    if (!selectedProduct || !stockQuantity || isNaN(Number(stockQuantity))) {
      toast.error('Please select a product and enter a valid quantity');
      return;
    }
    
    // Get product to find its price
    const product = products.find(p => p.id === selectedProduct);
    const unitPrice = product?.price || 0;
    
    // Create new stock entry with items array containing the product
    addStockEntry({
      date: new Date().toISOString(),
      type: 'addition',
      totalAmount: 0,
      supplierId: '', // Adding a default empty string for supplierId which is required
      items: [{
        productId: selectedProduct,
        quantity: Number(stockQuantity),
        unitPrice: unitPrice // Adding the required unitPrice property
      }]
    });
    
    toast.success('Stock updated successfully');
    setShowAddDialog(false);
    setSelectedProduct('');
    setStockQuantity('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Stock
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
          <CardDescription>Manage your inventory stock levels</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium">Product Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Current Stock</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Min Stock Level</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Last Updated</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((entry) => {
                  // Get first item from entry to display product information
                  const firstItem = entry.items && entry.items.length > 0 ? entry.items[0] : null;
                  const product = firstItem ? products.find(p => p.id === firstItem.productId) : null;
                  
                  // Check if product exists and if stock level is low
                  const itemQuantity = firstItem ? firstItem.quantity : 0;
                  const isLow = product && product.minStockLevel && (itemQuantity < product.minStockLevel);
                  
                  return (
                    <tr key={entry.id} className="border-b">
                      <td className="p-4 align-middle">{product?.name || 'Unknown Product'}</td>
                      <td className="p-4 align-middle">{firstItem ? firstItem.quantity : 0}</td>
                      <td className="p-4 align-middle">{product?.minStockLevel || 'Not set'}</td>
                      <td className="p-4 align-middle">
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isLow ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle">
                        <Button size="sm" variant="outline">Update</Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No stock entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock}>
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
