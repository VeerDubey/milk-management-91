import React, { useState, useRef } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { CalendarIcon, Package, Plus, Truck, User, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TruckSheet = () => {
  const { customers, products, orders, addOrder, vehicles, salesmen } = useData();
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [salesmanId, setSalesmanId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  
  // Keep track of customer search input
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  
  // Calculate total units and amount
  const totalUnits = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  
  const totalAmount = items.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  // Handle adding a new item row
  const addItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  // Handle removing an item row
  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Handle item change
  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === 'quantity' ? Number(value) : value 
    };
    setItems(newItems);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    
    if (items.length === 0 || items.some(item => !item.productId)) {
      toast.error("Please add at least one product");
      return;
    }
    
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      
      if (!customer) {
        toast.error("Selected customer not found");
        return;
      }
      
      // Create order items with product details
      const orderItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          unit: product.unit || 'pcs'
        };
      });
      
      // Add order to the system
      addOrder({
        customerId: selectedCustomerId,
        customerName: customer.name,
        date: date.toISOString(),
        items: orderItems,
        total: totalAmount,
        status: 'pending',
        vehicleId,
        salesmanId,
        notes
      });
      
      toast.success("Dispatch created successfully");
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create dispatch");
    }
  };

  const resetForm = () => {
    setItems([]);
    setSelectedCustomerId('');
    setCustomerSearchQuery('');
    setVehicleId('');
    setSalesmanId('');
    setDate(new Date());
    setNotes('');
  };
  
  // Filter customers by search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Truck Sheet</h1>
          <p className="text-muted-foreground">
            Create dispatch orders for delivery
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <div className="flex w-full items-center space-x-2">
                  <Popover open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selectedCustomerId ? 
                          customers.find(c => c.id === selectedCustomerId)?.name :
                          "Select customer..."}
                        <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <div className="p-2">
                        <div className="flex items-center border rounded-md">
                          <Input
                            className="border-0"
                            placeholder="Search customers..."
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="max-h-[300px] overflow-auto">
                        {filteredCustomers.length === 0 ? (
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            No customers found
                          </div>
                        ) : (
                          filteredCustomers.map(customer => (
                            <div
                              key={customer.id}
                              className={cn(
                                "flex cursor-default select-none items-center rounded-sm py-1.5 px-2",
                                selectedCustomerId === customer.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                              )}
                              onClick={() => {
                                setSelectedCustomerId(customer.id);
                                setIsCustomerSearchOpen(false);
                              }}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-xs text-muted-foreground">{customer.phone}</p>
                              </div>
                              {customer.outstandingBalance > 0 && (
                                <Badge variant={customer.outstandingBalance > 1000 ? "destructive" : "secondary"} className="ml-2">
                                  ₹{customer.outstandingBalance.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>
                          Add a new customer to your list
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            className="col-span-3"
                            placeholder="Customer name"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            className="col-span-3"
                            placeholder="Phone number"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="address" className="text-right">
                            Address
                          </Label>
                          <Input
                            id="address"
                            className="col-span-3"
                            placeholder="Customer address"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button">Add Customer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && setDate(newDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                          {vehicle.name} - {vehicle.number}
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery instructions or special notes" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Add products for dispatch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate (₹)</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const amount = product ? product.price * item.quantity : 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Select 
                            value={item.productId} 
                            onValueChange={(value) => handleItemChange(index, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.unit || 'pcs'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="w-20"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          {product ? product.price.toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell className="text-right">
                          {amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeItemRow(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No items added yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={addItemRow}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Total Units:</span>
                  <span>{totalUnits}</span>
                </div>
                <div className="flex justify-between font-medium mt-2">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedCustomerId && customers.find(c => c.id === selectedCustomerId)?.outstandingBalance > 1000 && (
          <Alert variant="destructive">
            <AlertTitle>Warning: High Outstanding Balance!</AlertTitle>
            <AlertDescription>
              This customer has an outstanding balance of ₹
              {customers.find(c => c.id === selectedCustomerId)?.outstandingBalance.toFixed(2)}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button type="submit">
            Create Dispatch
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TruckSheet;
