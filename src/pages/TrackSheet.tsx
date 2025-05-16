
import React, { useState, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
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
import { 
  PrinterIcon, 
  FileTextIcon, 
  Save, 
  Trash2, 
  ListPlus, 
  ChevronRight 
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TrackSheet = () => {
  const { customers, products, orders, addOrder, vehicles, salesmen } = useData();
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [vehicleId, setVehicleId] = useState('');
  const [salesmanId, setSalesmanId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [trackSheetNo, setTrackSheetNo] = useState(`TS-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [notes, setNotes] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  
  // Filtered customers based on search
  const filteredCustomers = customerSearch 
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
    : customers;

  const handleAddItem = () => {
    if (!newProductId) {
      toast.error("Please select a product");
      return;
    }
    
    if (newQuantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    
    setItems([...items, { productId: newProductId, quantity: newQuantity }]);
    setNewProductId('');
    setNewQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (item.quantity * (product?.price || 0));
    }, 0);
  };

  const validateForm = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return false;
    }
    
    if (!selectedDate) {
      toast.error("Please select a date");
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
    
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return false;
    }
    
    return true;
  };

  const handleCreateDispatch = () => {
    if (!validateForm()) return;
    
    try {
      // Find the chosen customer name
      const customerName = customers.find(c => c.id === selectedCustomerId)?.name || "Unknown Customer";
      
      addOrder({
        id: trackSheetNo,
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
        notes,
        createdAt: new Date().toISOString()
      });
      
      toast.success("Dispatch created successfully");
      handleResetForm();
    } catch (error) {
      console.error("Error creating dispatch:", error);
      toast.error("Failed to create dispatch");
    }
  };

  const handleResetForm = () => {
    setItems([]);
    setSelectedCustomerId('');
    setVehicleId('');
    setSalesmanId('');
    setSelectedDate(new Date());
    setCustomerSearch('');
    setNotes('');
    setTrackSheetNo(`TS-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  };

  const handlePrint = () => {
    if (!validateForm()) return;
    
    const printContent = printRef.current;
    if (!printContent) return;
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Couldn't open print window. Please check your popup blocker.");
      return;
    }
    
    // Create print-friendly version
    printWindow.document.write(`
      <html>
        <head>
          <title>Track Sheet: ${trackSheetNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            h2 { text-align: center; margin-bottom: 10px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; }
            .signature { width: 45%; border-top: 1px solid #000; padding-top: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>Track Sheet / Dispatch Sheet</h2>
          <div class="header">
            <div>
              <p><strong>Track Sheet #:</strong> ${trackSheetNo}</p>
              <p><strong>Date:</strong> ${format(selectedDate || new Date(), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p><strong>Customer:</strong> ${customers.find(c => c.id === selectedCustomerId)?.name || "Unknown"}</p>
              <p><strong>Vehicle:</strong> ${vehicles.find(v => v.id === vehicleId)?.name || "Unknown"}</p>
              <p><strong>Salesman:</strong> ${salesmen.find(s => s.id === salesmanId)?.name || "Unknown"}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Product</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${product?.name || "Unknown"}</td>
                    <td>${product?.unit || "unit"}</td>
                    <td>${item.quantity}</td>
                    <td>₹${product?.price.toFixed(2) || "0.00"}</td>
                    <td>₹${((product?.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="5" style="text-align: right;">Total:</td>
                <td>₹${calculateTotal().toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          ${notes ? `<div class="section"><strong>Notes:</strong> ${notes}</div>` : ''}
          
          <div class="footer">
            <div class="signature">Authorized Signature</div>
            <div class="signature">Received By</div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a slight delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Dispatch / Track Sheet</h1>
          <p className="text-muted-foreground">Create delivery dispatches and track sheets for customers</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleResetForm} variant="outline" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handlePrint} variant="secondary" className="flex items-center gap-2">
            <PrinterIcon className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      <div ref={printRef} className="hidden"> {/* Hidden placeholder for print content */}</div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Track Sheet Details</CardTitle>
              <CardDescription>Fill in dispatch information</CardDescription>
            </div>
            <div className="flex items-center bg-muted/30 px-4 py-2 rounded-md">
              <div className="text-sm font-medium">Track Sheet #:</div>
              <Input 
                value={trackSheetNo} 
                onChange={e => setTrackSheetNo(e.target.value)}
                className="ml-2 w-40 h-8 text-sm bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center gap-2">
                <ListPlus className="h-4 w-4" />
                Items
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer" className="form-label">Customer</Label>
                  <div className="space-y-2">
                    <Input
                      id="customerSearch"
                      placeholder="Search customers..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="form-input"
                    />
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger id="customer" className="form-input">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-muted-foreground">
                              No customers found
                            </div>
                          )}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="form-label">Date</Label>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                    className="form-input w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle" className="form-label">Vehicle</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger id="vehicle" className="form-input">
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.length > 0 ? (
                        vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-muted-foreground">
                          No vehicles available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesman" className="form-label">Salesman</Label>
                  <Select value={salesmanId} onValueChange={setSalesmanId}>
                    <SelectTrigger id="salesman" className="form-input">
                      <SelectValue placeholder="Select a salesman" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesmen.length > 0 ? (
                        salesmen.map((salesman) => (
                          <SelectItem key={salesman.id} value={salesman.id}>
                            {salesman.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-muted-foreground">
                          No salesmen available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items">
              <div className="space-y-6">
                <div className="bg-muted/20 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="product" className="form-label">Product</Label>
                      <Select value={newProductId} onValueChange={setNewProductId}>
                        <SelectTrigger id="product" className="form-input">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-72">
                            {products.length > 0 ? (
                              products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ₹{product.price} per {product.unit}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-muted-foreground">
                                No products available
                              </div>
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity" className="form-label">Quantity</Label>
                      <Input
                        type="number"
                        id="quantity"
                        value={String(newQuantity)}
                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                        className="form-input"
                        min="1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddItem} className="w-full">
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
                
                {items.length === 0 ? (
                  <div className="bg-muted/10 border border-dashed rounded-md p-8 text-center">
                    <p className="text-muted-foreground">No items added yet. Add items using the form above.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{product?.name || "Unknown Product"}</TableCell>
                              <TableCell>{product?.unit || "unit"}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">₹{product?.price.toFixed(2) || "0.00"}</TableCell>
                              <TableCell className="text-right">
                                ₹{((product?.price || 0) * item.quantity).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)} className="h-8 w-8 p-0">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell colSpan={5} className="text-right font-medium">Total:</TableCell>
                          <TableCell className="text-right font-bold">₹{calculateTotal().toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="notes" className="form-label">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Optional notes for this dispatch"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-6">
                <Alert className="bg-muted/20">
                  <AlertTitle>Review Dispatch Details</AlertTitle>
                  <AlertDescription>
                    Please review all details before creating the dispatch.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer & Dispatch Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Track Sheet #:</div>
                        <div className="font-medium">{trackSheetNo}</div>
                        
                        <div className="text-muted-foreground">Customer:</div>
                        <div className="font-medium">{customers.find(c => c.id === selectedCustomerId)?.name || "Not selected"}</div>
                        
                        <div className="text-muted-foreground">Date:</div>
                        <div className="font-medium">{selectedDate ? format(selectedDate, "dd MMM yyyy") : "Not selected"}</div>
                        
                        <div className="text-muted-foreground">Vehicle:</div>
                        <div className="font-medium">{vehicles.find(v => v.id === vehicleId)?.name || "Not selected"}</div>
                        
                        <div className="text-muted-foreground">Salesman:</div>
                        <div className="font-medium">{salesmen.find(s => s.id === salesmanId)?.name || "Not selected"}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Total Items:</div>
                        <div className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)} units</div>
                        
                        <div className="text-muted-foreground">Unique Products:</div>
                        <div className="font-medium">{items.length}</div>
                        
                        <div className="text-muted-foreground">Total Amount:</div>
                        <div className="font-bold">₹{calculateTotal().toFixed(2)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                              <TableRow key={index}>
                                <TableCell>{product?.name || "Unknown Product"}</TableCell>
                                <TableCell className="text-center">
                                  {item.quantity} {product?.unit || "units"}
                                </TableCell>
                                <TableCell className="text-right">₹{product?.price.toFixed(2) || "0.00"}</TableCell>
                                <TableCell className="text-right">
                                  ₹{((product?.price || 0) * item.quantity).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetForm}>Reset Form</Button>
          <Button 
            onClick={handleCreateDispatch}
            className="flex items-center gap-2"
            disabled={!selectedCustomerId || !vehicleId || !salesmanId || items.length === 0}
          >
            Create Dispatch <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TrackSheet;
