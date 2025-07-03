import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  productId: string;
  quantity: number;
  rate: number;
}

export default function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, customers, products, updateOrder } = useData();

  const order = orders.find(o => o.id === id);
  
  const [customerId, setCustomerId] = useState(order?.customerId || '');
  const [status, setStatus] = useState(order?.status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'pending');
  const [notes, setNotes] = useState(order?.notes || '');
  const [items, setItems] = useState<OrderItem[]>(order?.items?.map(item => ({
    ...item,
    rate: item.rate || 0
  })) || []);

  useEffect(() => {
    if (!order) {
      toast.error('Order not found');
      navigate('/orders');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.rate), 0);
  };

  const handleSave = () => {
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const updatedOrder = {
      ...order,
      customerId,
      status,
      paymentStatus,
      notes,
      items,
      total: calculateTotal()
    };

    updateOrder(order.id, updatedOrder);
    toast.success('Order updated successfully');
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(`/orders/${order.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Order</h1>
            <p className="text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Order notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="text-lg font-semibold text-primary">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Order Items</CardTitle>
          <Button onClick={addItem} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => updateItem(index, 'productId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
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
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate (₹)</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">₹{(item.quantity * item.rate).toFixed(2)}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items added. Click "Add Item" to add products to this order.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}