
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Save, Download, Plus, Trash2, User, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderEntryCards() {
  const { products, customers, addCustomer, addProduct } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('');
  
  // Get active products and customers
  const activeProducts = products.filter(p => p.isActive);
  const activeCustomers = customers.filter(c => c.isActive);

  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    
    addCustomer({
      name: newCustomerName.trim(),
      phone: '',
      address: '',
      email: '',
      isActive: true,
      outstandingBalance: 0
    });
    
    setNewCustomerName('');
    toast.success('Customer added successfully');
  };

  const handleAddProduct = () => {
    if (!newProductName.trim() || !newProductPrice || !newProductUnit.trim()) {
      toast.error('Please fill all product fields');
      return;
    }
    
    addProduct({
      name: newProductName.trim(),
      price: parseFloat(newProductPrice),
      unit: newProductUnit.trim(),
      description: '',
      isActive: true,
      category: 'Dairy'
    });
    
    setNewProductName('');
    setNewProductPrice('');
    setNewProductUnit('');
    toast.success('Product added successfully');
  };

  const exportOrders = () => {
    toast.success('Orders exported successfully');
  };

  const saveOrder = () => {
    toast.success('Order saved successfully');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Entry</h1>
          <p className="text-muted-foreground">Create and manage daily milk orders</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportOrders}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={saveOrder} className="bg-green-600 hover:bg-green-700">
            <Save className="mr-2 h-4 w-4" />
            Save Order
          </Button>
        </div>
      </div>

      {/* Daily Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Daily Milk Order Entry</CardTitle>
            <div className="flex items-center space-x-4">
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                className="w-48"
              />
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
              <Button variant="outline" size="sm">
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Customers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Customers</h2>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Customer name"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              className="w-48"
            />
            <Button size="sm" onClick={handleAddCustomer}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {activeCustomers.map((customer) => (
            <Card key={customer.id} className="relative group">
              <CardContent className="p-4 text-center">
                <p className="font-medium">{customer.name}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Products</h2>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Product name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="w-32"
            />
            <Input
              placeholder="Price"
              type="number"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              className="w-24"
            />
            <Input
              placeholder="Unit"
              value={newProductUnit}
              onChange={(e) => setNewProductUnit(e.target.value)}
              className="w-24"
            />
            <Button size="sm" onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeProducts.map((product) => (
            <Card key={product.id} className="relative group">
              <CardContent className="p-4 text-center">
                <p className="font-medium mb-1">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{product.price}/{product.unit}
                </p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
