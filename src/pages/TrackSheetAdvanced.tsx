
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Save, Printer, Calculator, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderCell {
  productId: string;
  customerId: string;
  quantity: number;
  amount: number;
}

interface CustomerTotal {
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
}

interface ProductTotal {
  productId: string;
  totalQuantity: number;
  totalAmount: number;
}

export default function TrackSheetAdvanced() {
  const navigate = useNavigate();
  const { 
    products, 
    customers, 
    vehicles, 
    salesmen,
    addTrackSheet,
    addBatchOrders
  } = useData();
  
  const [trackSheetName, setTrackSheetName] = useState(`Track Sheet - ${format(new Date(), 'dd/MM/yyyy')}`);
  const [trackSheetDate, setTrackSheetDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [routeName, setRouteName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Get active products and customers
  const activeProducts = products.filter(p => p.isActive);
  const activeCustomers = customers.filter(c => c.isActive);
  
  // Order matrix: productId-customerId -> quantity
  const [orderMatrix, setOrderMatrix] = useState<Record<string, number>>({});
  
  // Helper function to get cell key
  const getCellKey = (productId: string, customerId: string) => `${productId}-${customerId}`;
  
  // Update quantity in matrix
  const updateQuantity = (productId: string, customerId: string, quantity: number) => {
    const key = getCellKey(productId, customerId);
    setOrderMatrix(prev => ({
      ...prev,
      [key]: quantity
    }));
  };
  
  // Get quantity for cell
  const getQuantity = (productId: string, customerId: string): number => {
    const key = getCellKey(productId, customerId);
    return orderMatrix[key] || 0;
  };
  
  // Calculate customer totals
  const getCustomerTotals = (): CustomerTotal[] => {
    return activeCustomers.map(customer => {
      let totalQuantity = 0;
      let totalAmount = 0;
      
      activeProducts.forEach(product => {
        const quantity = getQuantity(product.id, customer.id);
        totalQuantity += quantity;
        totalAmount += quantity * product.price;
      });
      
      return {
        customerId: customer.id,
        totalQuantity,
        totalAmount
      };
    });
  };
  
  // Calculate product totals
  const getProductTotals = (): ProductTotal[] => {
    return activeProducts.map(product => {
      let totalQuantity = 0;
      let totalAmount = 0;
      
      activeCustomers.forEach(customer => {
        const quantity = getQuantity(product.id, customer.id);
        totalQuantity += quantity;
        totalAmount += quantity * product.price;
      });
      
      return {
        productId: product.id,
        totalQuantity,
        totalAmount
      };
    });
  };
  
  // Save as track sheet
  const saveAsTrackSheet = () => {
    if (!trackSheetDate) {
      toast.error("Please select a date");
      return;
    }
    
    // Convert matrix to track sheet rows
    const rows = activeCustomers.map(customer => {
      const quantities: Record<string, number> = {};
      let total = 0;
      let amount = 0;
      
      activeProducts.forEach(product => {
        const quantity = getQuantity(product.id, customer.id);
        if (quantity > 0) {
          quantities[product.name] = quantity;
          total += quantity;
          amount += quantity * product.price;
        }
      });
      
      return {
        customerId: customer.id,
        name: customer.name,
        quantities,
        total,
        amount,
        products: activeProducts.map(p => p.name)
      };
    }).filter(row => row.total > 0); // Only include rows with orders
    
    if (rows.length === 0) {
      toast.error("No orders to save");
      return;
    }
    
    const trackSheetData = {
      name: trackSheetName,
      date: format(trackSheetDate, 'yyyy-MM-dd'),
      vehicleId: selectedVehicle,
      salesmanId: selectedSalesman,
      routeName,
      rows,
      notes
    };
    
    const result = addTrackSheet(trackSheetData);
    
    if (result) {
      toast.success("Track sheet saved successfully");
    }
  };
  
  // Save as orders
  const saveAsOrders = () => {
    const orders = [];
    
    for (const customer of activeCustomers) {
      const items = [];
      
      for (const product of activeProducts) {
        const quantity = getQuantity(product.id, customer.id);
        if (quantity > 0) {
          items.push({
            productId: product.id,
            quantity,
            unitPrice: product.price,
            total: quantity * product.price
          });
        }
      }
      
      if (items.length > 0) {
        const total = items.reduce((sum, item) => sum + item.total, 0);
        
        orders.push({
          customerId: customer.id,
          customerName: customer.name,
          date: format(trackSheetDate, 'yyyy-MM-dd'),
          items,
          total,
          status: 'pending' as const,
          paymentStatus: 'pending' as const,
          vehicleId: selectedVehicle || undefined,
          salesmanId: selectedSalesman || undefined,
          notes: `Generated from track sheet: ${trackSheetName}`
        });
      }
    }
    
    if (orders.length === 0) {
      toast.error("No orders to save");
      return;
    }
    
    const result = addBatchOrders(orders);
    
    if (result) {
      toast.success(`${orders.length} orders created successfully`);
    }
  };
  
  const customerTotals = getCustomerTotals();
  const productTotals = getProductTotals();
  const grandTotal = customerTotals.reduce((sum, ct) => sum + ct.totalAmount, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-600">Advanced Track Sheet</h1>
          <p className="text-muted-foreground">Excel-style order entry system</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={saveAsTrackSheet} className="bg-teal-600 hover:bg-teal-700">
            <Save className="mr-2 h-4 w-4" />
            Save as Track Sheet
          </Button>
          <Button onClick={saveAsOrders} variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
            <Plus className="mr-2 h-4 w-4" />
            Convert to Orders
          </Button>
        </div>
      </div>
      
      {/* Header Details */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-700">Track Sheet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={trackSheetName} 
                onChange={(e) => setTrackSheetName(e.target.value)}
                className="border-teal-200 focus:border-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                date={trackSheetDate}
                setDate={setTrackSheetDate}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="border-teal-200">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesman">Salesman</Label>
              <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
                <SelectTrigger className="border-teal-200">
                  <SelectValue placeholder="Select salesman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {salesmen.map(salesman => (
                    <SelectItem key={salesman.id} value={salesman.id}>
                      {salesman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Route Name</Label>
              <Input 
                id="route" 
                value={routeName} 
                onChange={(e) => setRouteName(e.target.value)}
                className="border-teal-200 focus:border-teal-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Order Matrix */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-700 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Order Entry Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-teal-200">
              {/* Header Row */}
              <thead>
                <tr className="bg-teal-50">
                  <th className="border border-teal-200 p-2 text-left font-medium text-teal-700">
                    Product
                  </th>
                  <th className="border border-teal-200 p-2 text-center font-medium text-teal-700">
                    Price (₹)
                  </th>
                  {activeCustomers.map(customer => (
                    <th key={customer.id} className="border border-teal-200 p-2 text-center font-medium text-teal-700 min-w-[100px]">
                      {customer.name}
                    </th>
                  ))}
                  <th className="border border-teal-200 p-2 text-center font-medium text-teal-700">
                    Total Qty
                  </th>
                  <th className="border border-teal-200 p-2 text-center font-medium text-teal-700">
                    Total Amount
                  </th>
                </tr>
              </thead>
              
              {/* Product Rows */}
              <tbody>
                {activeProducts.map((product, productIndex) => {
                  const productTotal = productTotals[productIndex];
                  
                  return (
                    <tr key={product.id} className="hover:bg-teal-25">
                      <td className="border border-teal-200 p-2 font-medium">
                        {product.name}
                      </td>
                      <td className="border border-teal-200 p-2 text-center">
                        ₹{product.price.toFixed(2)}
                      </td>
                      {activeCustomers.map(customer => {
                        const quantity = getQuantity(product.id, customer.id);
                        
                        return (
                          <td key={customer.id} className="border border-teal-200 p-1">
                            <Input
                              type="number"
                              min="0"
                              value={quantity || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                updateQuantity(product.id, customer.id, value);
                              }}
                              className="w-full text-center border-none bg-transparent focus:bg-teal-50"
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      <td className="border border-teal-200 p-2 text-center bg-teal-50">
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                          {productTotal.totalQuantity}
                        </Badge>
                      </td>
                      <td className="border border-teal-200 p-2 text-center bg-teal-50">
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                          ₹{productTotal.totalAmount.toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Customer Totals Row */}
                <tr className="bg-teal-100 font-semibold">
                  <td className="border border-teal-200 p-2 text-teal-700">
                    TOTAL
                  </td>
                  <td className="border border-teal-200 p-2"></td>
                  {activeCustomers.map((customer, customerIndex) => {
                    const customerTotal = customerTotals[customerIndex];
                    
                    return (
                      <td key={customer.id} className="border border-teal-200 p-2 text-center">
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-teal-600 text-white">
                            {customerTotal.totalQuantity} qty
                          </Badge>
                          <Badge className="bg-teal-700 text-white">
                            ₹{customerTotal.totalAmount.toFixed(2)}
                          </Badge>
                        </div>
                      </td>
                    );
                  })}
                  <td className="border border-teal-200 p-2 text-center">
                    <Badge className="bg-teal-600 text-white">
                      {productTotals.reduce((sum, pt) => sum + pt.totalQuantity, 0)}
                    </Badge>
                  </td>
                  <td className="border border-teal-200 p-2 text-center">
                    <Badge className="bg-teal-700 text-white">
                      ₹{grandTotal.toFixed(2)}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
