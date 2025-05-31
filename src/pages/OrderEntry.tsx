import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Customer, Product, Order, OrderItem, Vehicle, Salesman } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export default function OrderEntry() {
  const { customers, products, addOrder, vehicles, salesmen, addCustomer, addProduct } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedSalesman, setSelectedSalesman] = useState<Salesman | null>(null);
  const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', outstandingBalance: 0 });
  const [showNewProductForm, setShowNewProductForm] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, description: '', unit: '', category: '', sku: '', code: '' });

  useEffect(() => {
    setAvailableProducts(products);
  }, [products]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle || null);
  };

  const handleSalesmanChange = (salesmanId: string) => {
    const salesman = salesmen.find(s => s.id === salesmanId);
    setSelectedSalesman(salesman || null);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
  };

  const handleAddOrderItem = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);

    if (existingItemIndex > -1) {
      const updatedItems = orderItems.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
      setOrderItems(updatedItems);
    } else {
      const newOrderItem: OrderItem = {
        productId: selectedProduct.id,
        quantity: quantity,
        unitPrice: selectedProduct.price,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
        id: uuidv4()
      };
      setOrderItems([...orderItems, newOrderItem]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveOrderItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedVehicle(null);
    setSelectedSalesman(null);
    setOrderDate(new Date());
    setOrderItems([]);
    setOrderNotes('');
  };

  const createOrder = () => {
    if (!selectedCustomer || !selectedVehicle || !selectedSalesman || orderItems.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const order: Omit<Order, 'id'> = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: format(orderDate || new Date(), 'yyyy-MM-dd'),
      items: orderItems,
      vehicleId: selectedVehicle.id,
      salesmanId: selectedSalesman.id,
      status: 'pending',
      paymentStatus: 'pending',
      total: calculateTotal(),
      totalAmount: calculateTotal(),
      notes: orderNotes
    };

    const orderId = addOrder(order);
    console.log('Order created with ID:', orderId);
    
    toast.success('Order created successfully!');
    resetForm();
  };

  const handleNewCustomerToggle = () => {
    setShowNewCustomerForm(!showNewCustomerForm);
  };

  const handleNewProductToggle = () => {
    setShowNewProductForm(!showNewProductForm);
  };

  const handleAddNewCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.address) {
      toast.error('Please fill all required fields');
      return;
    }

    const customerData = {
      name: newCustomer.name,
      phone: newCustomer.phone,
      address: newCustomer.address,
      outstandingBalance: newCustomer.outstandingBalance,
      isActive: true,
      balance: newCustomer.outstandingBalance,
      createdAt: new Date().toISOString()
    };

    addCustomer(customerData);
    toast.success('Customer added successfully!');
    setNewCustomer({ name: '', phone: '', address: '', outstandingBalance: 0 });
    setShowNewCustomerForm(false);
  };

  const handleAddNewProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.unit) {
      toast.error('Please fill all required fields');
      return;
    }

    const productData = {
      name: newProduct.name,
      price: newProduct.price,
      description: newProduct.description,
      unit: newProduct.unit,
      category: newProduct.category,
      sku: newProduct.sku,
      isActive: true,
      code: newProduct.code,
      createdAt: new Date().toISOString(),
      hasVariants: false
    };

    addProduct(productData);
    toast.success('Product added successfully!');
    setNewProduct({ name: '', price: 0, description: '', unit: '', category: '', sku: '', code: '' });
    setShowNewProductForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Entry</h1>

      {/* Customer Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Customer</CardTitle>
          <CardDescription>Select an existing customer or add a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Select onValueChange={handleCustomerChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="secondary" size="sm" onClick={handleNewCustomerToggle}>
              {showNewCustomerForm ? 'Hide Form' : 'Add New'}
            </Button>
          </div>

          {showNewCustomerForm && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">New Customer Form</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-customer-name">Name</Label>
                  <Input
                    type="text"
                    id="new-customer-name"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-customer-phone">Phone</Label>
                  <Input
                    type="text"
                    id="new-customer-phone"
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-customer-address">Address</Label>
                  <Input
                    type="text"
                    id="new-customer-address"
                    value={newCustomer.address}
                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-customer-outstanding">Outstanding</Label>
                  <Input
                    type="number"
                    id="new-customer-outstanding"
                    value={newCustomer.outstandingBalance}
                    onChange={e => setNewCustomer({ ...newCustomer, outstandingBalance: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <Button type="button" size="sm" onClick={handleAddNewCustomer}>Create Customer</Button>
            </div>
          )}

          {selectedCustomer && (
            <div className="mt-2">
              <p>Selected Customer: {selectedCustomer.name}</p>
              <p>Phone: {selectedCustomer.phone}</p>
              <p>Address: {selectedCustomer.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle and Salesman Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle</CardTitle>
            <CardDescription>Select the vehicle for this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleVehicleChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVehicle && <p className="mt-2">Selected Vehicle: {selectedVehicle.name}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salesman</CardTitle>
            <CardDescription>Select the salesman for this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleSalesmanChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Salesman" />
              </SelectTrigger>
              <SelectContent>
                {salesmen.map(salesman => (
                  <SelectItem key={salesman.id} value={salesman.id}>{salesman.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSalesman && <p className="mt-2">Selected Salesman: {selectedSalesman.name}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Order Date */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Order Date</CardTitle>
          <CardDescription>Select the date for this order.</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !orderDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {orderDate ? format(orderDate, "PPP") : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={orderDate}
                onSelect={setOrderDate}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>Add products to the order.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Select onValueChange={handleProductChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map(product => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Quantity"
              className="w-24"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value))}
            />
            <Button type="button" size="sm" onClick={handleAddOrderItem}>Add Item</Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleNewProductToggle}>
              {showNewProductForm ? 'Hide Form' : 'Add New Product'}
            </Button>
          </div>

          {showNewProductForm && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">New Product Form</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-product-name">Name</Label>
                  <Input
                    type="text"
                    id="new-product-name"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-product-price">Price</Label>
                  <Input
                    type="number"
                    id="new-product-price"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-product-description">Description</Label>
                  <Input
                    type="text"
                    id="new-product-description"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-product-unit">Unit</Label>
                  <Input
                    type="text"
                    id="new-product-unit"
                    value={newProduct.unit}
                    onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-product-category">Category</Label>
                  <Input
                    type="text"
                    id="new-product-category"
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                 <div>
                  <Label htmlFor="new-product-sku">SKU</Label>
                  <Input
                    type="text"
                    id="new-product-sku"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
                 <div>
                  <Label htmlFor="new-product-code">Code</Label>
                  <Input
                    type="text"
                    id="new-product-code"
                    value={newProduct.code}
                    onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
                  />
                </div>
              </div>
              <Button type="button" size="sm" onClick={handleAddNewProduct}>Create Product</Button>
            </div>
          )}

          {orderItems.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <ul>
                {orderItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between py-2 border-b">
                    <span>{item.productName} - Quantity: {item.quantity} - Unit Price: ₹{item.unitPrice}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveOrderItem(item.id)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 font-bold">Total: ₹{calculateTotal()}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Add any notes for this order.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Order notes"
            value={orderNotes}
            onChange={e => setOrderNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Submit Order */}
      <Button onClick={createOrder} disabled={!selectedCustomer || !selectedVehicle || !selectedSalesman || orderItems.length === 0}>
        Create Order
      </Button>
    </div>
  );
}
