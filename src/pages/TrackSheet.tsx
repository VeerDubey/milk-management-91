import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Order } from '@/types';

const TrackSheet = () => {
  const { customers, products, orders, addOrder, vehicles, salesmen } = useData();
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [vehicleId, setVehicleId] = useState('');
  const [salesmanId, setSalesmanId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleAddItem = () => {
    if (newProductId && newQuantity > 0) {
      setItems([...items, { productId: newProductId, quantity: newQuantity }]);
      setNewProductId('');
      setNewQuantity(1);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + item.quantity * (product?.price || 0);
    }, 0);
  };

  // Fix the addOrder call to include all required fields
const handleCreateDispatch = () => {
  try {
    // Find the chosen customer name
    const customerName = customers.find(c => c.id === selectedCustomerId)?.name || "Unknown Customer";
    
    addOrder({
      date: format(selectedDate || new Date(), "yyyy-MM-dd"),
      customerName,
      customerId: selectedCustomerId,
      status: 'pending',
      total: items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + item.quantity * (product?.price || 0);
      }, 0),
      items: items.map(item => ({
        customerId: selectedCustomerId,
        productId: item.productId,
        quantity: item.quantity,
        // Add missing required properties
        id: crypto.randomUUID(),
        productName: products.find(p => p.id === item.productId)?.name || "Unknown Product",
        unitPrice: products.find(p => p.id === item.productId)?.price || 0,
        unit: products.find(p => p.id === item.productId)?.unit || "unit"
      })),
      vehicleId,
      salesmanId
    });
    
    // Reset form
    setItems([]);
    setSelectedCustomerId('');
    setVehicleId('');
    setSalesmanId('');
    setSelectedDate(new Date());
    
    toast.success("Dispatch created successfully");
  } catch (error) {
    console.error("Error creating dispatch:", error);
    toast.error("Failed to create dispatch");
  }
};

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Dispatch / Track Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger id="vehicle">
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salesman">Salesman</Label>
                  <Select value={salesmanId} onValueChange={setSalesmanId}>
                    <SelectTrigger id="salesman">
                      <SelectValue placeholder="Select a salesman" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesmen.map((salesman) => (
                        <SelectItem key={salesman.id} value={salesman.id}>
                          {salesman.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select value={newProductId} onValueChange={setNewProductId}>
                    <SelectTrigger id="product">
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
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    id="quantity"
                    value={String(newQuantity)}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddItem}>Add Item</Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <TableRow key={index}>
                        <TableCell>{product?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">
                    Total Items: {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                  <p className="text-lg font-semibold">Total Amount: ₹{calculateTotal()}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateDispatch}>Create Dispatch</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TrackSheet;
