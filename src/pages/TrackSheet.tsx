
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { Order, OrderItem } from '@/types';
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, Calendar, Truck, User, ShoppingCart, X, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrackSheet = () => {
  const navigate = useNavigate();
  const { customers, products, orders, addOrder, vehicles, salesmen } = useData();
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [vehicleId, setVehicleId] = useState('');
  const [salesmanId, setSalesmanId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [trackSheetNumber, setTrackSheetNumber] = useState(`TS-${Math.floor(Math.random() * 10000)}`);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleAddItem = () => {
    if (newProductId && newQuantity > 0) {
      setItems([...items, { productId: newProductId, quantity: newQuantity }]);
      setNewProductId('');
      setNewQuantity(1);
      toast.success("Item added successfully");
    } else {
      toast.error("Please select a product and enter a valid quantity");
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    toast.info("Item removed");
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + item.quantity * (product?.price || 0);
    }, 0);
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getCustomerById = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };
  
  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };
  
  const getSalesmanById = (salesmanId: string) => {
    return salesmen.find(s => s.id === salesmanId);
  };

  const handleValidateForm = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return false;
    }
    
    if (!selectedDate) {
      toast.error("Please select a date");
      return false;
    }
    
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return false;
    }
    
    if (!vehicleId) {
      toast.error("Please select a vehicle");
      return false;
    }
    
    if (!salesmanId) {
      toast.error("Please select a salesman");
      return false;
    }
    
    return true;
  };

  const handleCreateDispatch = () => {
    if (!handleValidateForm()) {
      return;
    }
    
    try {
      // Find the chosen customer name
      const customerName = customers.find(c => c.id === selectedCustomerId)?.name || "Unknown Customer";
      
      const newOrder: Omit<Order, "id"> = {
        date: format(selectedDate || new Date(), "yyyy-MM-dd"),
        customerName,
        customerId: selectedCustomerId,
        status: 'pending',
        total: calculateTotal(),
        items: items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            id: crypto.randomUUID(),
            customerId: selectedCustomerId,
            productId: item.productId,
            productName: product?.name || "Unknown Product",
            quantity: item.quantity,
            unitPrice: product?.price || 0,
            unit: product?.unit || "unit"
          };
        }),
        vehicleId,
        salesmanId,
        notes: notes
      };
      
      addOrder(newOrder);
      
      toast.success("Dispatch created successfully", {
        description: "Track sheet has been created.",
        action: {
          label: "View",
          onClick: () => navigate("/orders")
        }
      });
      
      // Reset form
      handleResetForm();
    } catch (error) {
      console.error("Error creating dispatch:", error);
      toast.error("Failed to create dispatch", {
        description: "An unexpected error occurred. Please try again."
      });
    }
  };
  
  const handleResetForm = () => {
    setItems([]);
    setSelectedCustomerId('');
    setVehicleId('');
    setSalesmanId('');
    setSelectedDate(new Date());
    setNotes('');
    setTrackSheetNumber(`TS-${Math.floor(Math.random() * 10000)}`);
  };
  
  const handlePrintTrackSheet = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Sheet</h1>
          <p className="text-muted-foreground">Create and manage dispatch track sheets</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleResetForm}>
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintTrackSheet}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      <div className="print:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Create Dispatch / Track Sheet</span>
              <Badge variant="outline">{trackSheetNumber}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger value="items" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Items</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Summary</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger id="customer" className="w-full">
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
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <DatePicker
                      date={selectedDate}
                      setDate={setSelectedDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <Select value={vehicleId} onValueChange={setVehicleId}>
                      <SelectTrigger id="vehicle" className="w-full">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} ({vehicle.regNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salesman">Salesman</Label>
                    <Select value={salesmanId} onValueChange={setSalesmanId}>
                      <SelectTrigger id="salesman" className="w-full">
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
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Enter any special delivery instructions or notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="items">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product</Label>
                      <Select value={newProductId} onValueChange={setNewProductId}>
                        <SelectTrigger id="product">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        type="number"
                        id="quantity"
                        min={1}
                        value={String(newQuantity)}
                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex">
                      <Button onClick={handleAddItem} className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.length > 0 ? (
                          items.map((item, index) => {
                            const product = getProductById(item.productId);
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{product?.name || 'Unknown'}</TableCell>
                                <TableCell>{product?.unit || 'unit'}</TableCell>
                                <TableCell className="text-right">₹{product?.price.toFixed(2) || '0.00'}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">
                                  ₹{((product?.price || 0) * item.quantity).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                              No items added yet. Add items to the track sheet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="summary">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Customer & Delivery Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium">Customer:</p>
                            <p className="text-sm text-muted-foreground">
                              {getCustomerById(selectedCustomerId)?.name || 'Not selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Address:</p>
                            <p className="text-sm text-muted-foreground">
                              {getCustomerById(selectedCustomerId)?.address || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Delivery Date:</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Vehicle:</p>
                            <p className="text-sm text-muted-foreground">
                              {getVehicleById(vehicleId)?.name || 'Not selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Salesman:</p>
                            <p className="text-sm text-muted-foreground">
                              {getSalesmanById(salesmanId)?.name || 'Not selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Contact:</p>
                            <p className="text-sm text-muted-foreground">
                              {getCustomerById(selectedCustomerId)?.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Total Items: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                          <p className="text-sm font-medium mt-2">Total Products: {items.length}</p>
                          <p className="text-lg font-semibold mt-4">Total Amount: ₹{calculateTotal().toFixed(2)}</p>
                        </div>
                        
                        {notes && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm text-muted-foreground">{notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetForm}>Cancel</Button>
            <Button onClick={handleCreateDispatch}>Create Dispatch</Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Print Layout - Only visible when printing */}
      <div className="hidden print:block space-y-6 p-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Track Sheet</h1>
            <p className="text-sm">{trackSheetNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Date: {format(selectedDate, 'dd/MM/yyyy')}</p>
            <p className="text-sm">Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-lg border-b mb-2">Customer Details</h2>
            <p><span className="font-medium">Name:</span> {getCustomerById(selectedCustomerId)?.name || 'N/A'}</p>
            <p><span className="font-medium">Address:</span> {getCustomerById(selectedCustomerId)?.address || 'N/A'}</p>
            <p><span className="font-medium">Phone:</span> {getCustomerById(selectedCustomerId)?.phone || 'N/A'}</p>
          </div>
          <div>
            <h2 className="font-semibold text-lg border-b mb-2">Delivery Details</h2>
            <p><span className="font-medium">Vehicle:</span> {getVehicleById(vehicleId)?.name || 'N/A'} ({getVehicleById(vehicleId)?.regNumber || 'N/A'})</p>
            <p><span className="font-medium">Salesman:</span> {getSalesmanById(salesmanId)?.name || 'N/A'}</p>
            <p><span className="font-medium">Delivery Date:</span> {format(selectedDate, 'dd/MM/yyyy')}</p>
          </div>
        </div>
        
        <div>
          <h2 className="font-semibold text-lg border-b mb-2">Order Items</h2>
          <table className="w-full track-sheet-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product</th>
                <th>Unit</th>
                <th>Rate (₹)</th>
                <th>Quantity</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const product = getProductById(item.productId);
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product?.name || 'Unknown'}</td>
                    <td>{product?.unit || 'unit'}</td>
                    <td>{product?.price.toFixed(2) || '0.00'}</td>
                    <td>{item.quantity}</td>
                    <td>{((product?.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr className="track-sheet-total-row">
                <td colSpan={4} className="text-right">Total:</td>
                <td>{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td>₹{calculateTotal().toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {notes && (
          <div className="mt-4 border-t pt-4">
            <h2 className="font-semibold text-lg mb-2">Notes</h2>
            <p>{notes}</p>
          </div>
        )}
        
        <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t">
          <div className="text-center">
            <p className="font-semibold">Customer Signature</p>
            <div className="h-16 mt-2"></div>
          </div>
          <div className="text-center">
            <p className="font-semibold">Salesman Signature</p>
            <div className="h-16 mt-2"></div>
          </div>
          <div className="text-center">
            <p className="font-semibold">Authorized Signature</p>
            <div className="h-16 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackSheet;
