
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Plus, Trash2, Calculator, 
  Users, Package, MapPin, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
import { defaultProducts } from '@/data/defaultProducts';
import { defaultCustomers } from '@/data/defaultCustomers';
import type { DeliverySheetEntry } from '@/types/enhanced';

export default function DeliveryEntryPage() {
  const { customers, products, addOrder } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [deliveryEntries, setDeliveryEntries] = useState<DeliverySheetEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Combine existing products with default products
  const allProducts = useMemo(() => {
    const existingCodes = new Set(products.map(p => p.code).filter(Boolean));
    const newProducts = defaultProducts.filter(dp => !existingCodes.has(dp.code));
    
    return [
      ...products.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code || p.name.substring(0, 2).toUpperCase(),
        price: p.price,
        category: p.category || 'Milk',
        unit: p.unit || 'packet'
      })),
      ...newProducts.map((dp, index) => ({
        id: `default-${index}`,
        name: dp.name,
        code: dp.code,
        price: dp.price,
        category: dp.category,
        unit: dp.unit
      }))
    ];
  }, [products]);

  // Combine existing customers with default customers
  const allCustomers = useMemo(() => {
    const existingNames = new Set(customers.map(c => c.name.toUpperCase()));
    const newCustomers = defaultCustomers.filter(dc => !existingNames.has(dc.name.toUpperCase()));
    
    return [
      ...customers.map(c => ({
        id: c.id,
        name: c.name,
        area: c.area || 'Area 1'
      })),
      ...newCustomers.map((dc, index) => ({
        id: `default-${index}`,
        name: dc.name,
        area: dc.area
      }))
    ];
  }, [customers]);

  // Get unique areas
  const areas = useMemo(() => {
    const areaSet = new Set(allCustomers.map(c => c.area).filter(Boolean));
    return Array.from(areaSet);
  }, [allCustomers]);

  // Filter customers by selected area
  const filteredCustomers = useMemo(() => {
    if (!selectedArea) return allCustomers;
    return allCustomers.filter(c => c.area === selectedArea);
  }, [allCustomers, selectedArea]);

  // Initialize delivery entries when area changes
  React.useEffect(() => {
    if (selectedArea && filteredCustomers.length > 0) {
      const entries = filteredCustomers.map(customer => ({
        customerId: customer.id,
        customerName: customer.name,
        area: customer.area,
        products: {},
        totalQuantity: 0,
        totalAmount: 0
      }));
      setDeliveryEntries(entries);
    }
  }, [selectedArea, filteredCustomers]);

  const updateProductQuantity = (customerIndex: number, productCode: string, quantity: number) => {
    setDeliveryEntries(prev => {
      const updated = [...prev];
      const entry = { ...updated[customerIndex] };
      
      if (quantity > 0) {
        entry.products[productCode] = quantity;
      } else {
        delete entry.products[productCode];
      }
      
      // Recalculate totals
      entry.totalQuantity = Object.values(entry.products).reduce((sum, qty) => sum + qty, 0);
      entry.totalAmount = Object.entries(entry.products).reduce((sum, [code, qty]) => {
        const product = allProducts.find(p => p.code === code);
        return sum + (product ? product.price * qty : 0);
      }, 0);
      
      updated[customerIndex] = entry;
      return updated;
    });
  };

  const saveDeliverySheet = async () => {
    if (!selectedDate || !selectedArea || deliveryEntries.length === 0) {
      toast.error('Please select date, area, and add delivery entries');
      return;
    }

    setIsSaving(true);
    try {
      // Create orders for each customer with items
      const ordersCreated = [];
      
      for (const entry of deliveryEntries) {
        if (entry.totalQuantity > 0) {
          const orderItems = Object.entries(entry.products).map(([productCode, quantity]) => {
            const product = allProducts.find(p => p.code === productCode);
            return {
              id: `item-${Date.now()}-${Math.random()}`,
              productId: product?.id || `prod-${productCode}`,
              productName: product?.name || productCode,
              quantity,
              unitPrice: product?.price || 0,
              unit: product?.unit || 'packet'
            };
          });

          const order = {
            customerId: entry.customerId,
            customerName: entry.customerName,
            date: format(selectedDate, 'yyyy-MM-dd'),
            items: orderItems,
            vehicleId: 'default-vehicle',
            salesmanId: 'default-salesman',
            status: 'pending' as const,
            paymentStatus: 'pending' as const,
            total: entry.totalAmount,
            totalAmount: entry.totalAmount,
            notes: `Delivery for ${selectedArea} area`
          };

          const createdOrder = addOrder(order);
          ordersCreated.push(createdOrder);
        }
      }

      toast.success(`Successfully created ${ordersCreated.length} orders for delivery`);
      
      // Reset form
      setDeliveryEntries([]);
      setSelectedArea('');
      
    } catch (error) {
      console.error('Error saving delivery sheet:', error);
      toast.error('Failed to save delivery sheet');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate overall totals
  const overallTotals = useMemo(() => {
    const productTotals: { [code: string]: number } = {};
    let totalQuantity = 0;
    let totalAmount = 0;

    deliveryEntries.forEach(entry => {
      Object.entries(entry.products).forEach(([code, qty]) => {
        productTotals[code] = (productTotals[code] || 0) + qty;
      });
      totalQuantity += entry.totalQuantity;
      totalAmount += entry.totalAmount;
    });

    return { productTotals, totalQuantity, totalAmount };
  }, [deliveryEntries]);

  return (
    <div className="space-y-6 p-6 neo-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-aurora neo-glow-text">
            Delivery Entry
          </h1>
          <p className="text-muted-foreground">
            Create delivery orders by date and area
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={saveDeliverySheet} 
            disabled={isSaving || deliveryEntries.length === 0}
            className="neo-button-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Delivery Sheet'}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Delivery Configuration
          </CardTitle>
          <CardDescription>Select date and area for delivery entry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Delivery Date</Label>
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                className="w-full neo-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area">Delivery Area</Label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="neo-input">
                  <SelectValue placeholder="Select delivery area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>
                      <MapPin className="mr-2 h-4 w-4 inline" />
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedArea && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Users className="inline h-4 w-4 mr-1" />
                {filteredCustomers.length} customers in {selectedArea}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Entry Table */}
      {selectedArea && deliveryEntries.length > 0 && (
        <Card className="neo-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Quantities
            </CardTitle>
            <CardDescription>
              Enter quantities for each customer and product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left min-w-[120px]">Customer</th>
                    {allProducts.slice(0, 8).map(product => (
                      <th key={product.code} className="border border-border p-2 text-center min-w-[80px]">
                        <div className="text-xs font-bold">{product.code}</div>
                        <div className="text-xs text-muted-foreground">₹{product.price}</div>
                      </th>
                    ))}
                    <th className="border border-border p-2 text-center">QTY</th>
                    <th className="border border-border p-2 text-center">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryEntries.map((entry, customerIndex) => (
                    <tr key={entry.customerId} className="hover:bg-muted/50">
                      <td className="border border-border p-2 font-medium">
                        {entry.customerName}
                      </td>
                      {allProducts.slice(0, 8).map(product => (
                        <td key={product.code} className="border border-border p-1">
                          <Input
                            type="number"
                            min="0"
                            value={entry.products[product.code] || ''}
                            onChange={(e) => updateProductQuantity(
                              customerIndex, 
                              product.code, 
                              parseInt(e.target.value) || 0
                            )}
                            className="w-full text-center border-0 bg-transparent"
                            placeholder="0"
                          />
                        </td>
                      ))}
                      <td className="border border-border p-2 text-center font-semibold">
                        {entry.totalQuantity}
                      </td>
                      <td className="border border-border p-2 text-center font-semibold">
                        ₹{entry.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totals Row */}
                  <tr className="bg-primary/10 font-bold">
                    <td className="border border-border p-2">TOTAL</td>
                    {allProducts.slice(0, 8).map(product => (
                      <td key={product.code} className="border border-border p-2 text-center">
                        {overallTotals.productTotals[product.code] || 0}
                      </td>
                    ))}
                    <td className="border border-border p-2 text-center">
                      {overallTotals.totalQuantity}
                    </td>
                    <td className="border border-border p-2 text-center">
                      ₹{overallTotals.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="neo-card">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Customers</p>
                      <p className="text-2xl font-bold">
                        {deliveryEntries.filter(e => e.totalQuantity > 0).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="neo-card">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-success" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">{overallTotals.totalQuantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="neo-card">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calculator className="h-8 w-8 text-warning" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">₹{overallTotals.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
