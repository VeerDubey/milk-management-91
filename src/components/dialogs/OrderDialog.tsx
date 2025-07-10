import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface OrderDialogProps {
  children?: React.ReactNode;
}

export function OrderDialog({ children }: OrderDialogProps) {
  const { customers, products, vehicles, salesmen, addOrder } = useData();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [salesmanId, setSalesmanId] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1, rate: 0 }]);

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, rate: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].rate = product.price;
      }
    }
    
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.quantity * item.rate), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (orderItems.length === 0 || orderItems.some(item => !item.productId)) {
      toast.error('Please add at least one valid product');
      return;
    }

    try {
      const orderData = {
        customerId,
        vehicleId: vehicleId || (vehicles.length > 0 ? vehicles[0].id : ''),
        salesmanId: salesmanId || (salesmen.length > 0 ? salesmen[0].id : ''),
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.rate,
          rate: item.rate,
          total: item.quantity * item.rate
        })),
        total: calculateTotal(),
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        date: new Date().toISOString().split('T')[0]
      };

      addOrder(orderData);
      toast.success('Order created successfully');
      setOpen(false);
      setCustomerId('');
      setVehicleId('');
      setSalesmanId('');
      setOrderItems([{ productId: '', quantity: 1, rate: 0 }]);
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Add products and quantities to create a new order.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesman">Salesman</Label>
            <Select value={salesmanId} onValueChange={setSalesmanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select salesman" />
              </SelectTrigger>
              <SelectContent>
                {salesmen.map(salesman => (
                  <SelectItem key={salesman.id} value={salesman.id}>
                    {salesman.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label className="text-xs">Product</Label>
                  <Select 
                    value={item.productId} 
                    onValueChange={(value) => updateOrderItem(index, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₹{product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateOrderItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Total</Label>
                  <Input
                    value={`₹${(item.quantity * item.rate).toFixed(2)}`}
                    disabled
                  />
                </div>
                <div className="col-span-1">
                  {orderItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-semibold">
              Total: ₹{calculateTotal().toFixed(2)}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Order
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
