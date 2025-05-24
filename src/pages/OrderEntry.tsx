
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Save, Download, FileText, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderEntry() {
  const { products, customers, addOrder } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [orderData, setOrderData] = useState<Record<string, Record<string, number>>>({});
  
  // Get active products and customers
  const activeProducts = products.filter(p => p.isActive);
  const activeCustomers = customers.filter(c => c.isActive);
  
  // Initialize order data structure
  useEffect(() => {
    const initialData: Record<string, Record<string, number>> = {};
    activeProducts.forEach(product => {
      initialData[product.id] = {};
      activeCustomers.forEach(customer => {
        initialData[product.id][customer.id] = 0;
      });
    });
    setOrderData(initialData);
  }, [activeProducts, activeCustomers]);
  
  // Handle quantity change
  const handleQuantityChange = (productId: string, customerId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10) || 0;
    setOrderData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [customerId]: numValue
      }
    }));
  };
  
  // Calculate totals per customer
  const getCustomerTotal = (customerId: string) => {
    return activeProducts.reduce((total, product) => {
      const quantity = orderData[product.id]?.[customerId] || 0;
      return total + (quantity * product.price);
    }, 0);
  };
  
  // Calculate totals per product
  const getProductTotal = (productId: string) => {
    return activeCustomers.reduce((total, customer) => {
      return total + (orderData[productId]?.[customer.id] || 0);
    }, 0);
  };
  
  // Calculate grand total
  const getGrandTotal = () => {
    return activeProducts.reduce((total, product) => {
      return total + activeCustomers.reduce((customerTotal, customer) => {
        const quantity = orderData[product.id]?.[customer.id] || 0;
        return customerTotal + (quantity * product.price);
      }, 0);
    }, 0);
  };
  
  // Save orders
  const saveOrders = () => {
    const orders = [];
    
    activeCustomers.forEach(customer => {
      const customerItems = [];
      let customerTotal = 0;
      
      activeProducts.forEach(product => {
        const quantity = orderData[product.id]?.[customer.id] || 0;
        if (quantity > 0) {
          const amount = quantity * product.price;
          customerItems.push({
            productId: product.id,
            description: product.name,
            quantity,
            unitPrice: product.price,
            amount
          });
          customerTotal += amount;
        }
      });
      
      if (customerItems.length > 0) {
        orders.push({
          customerId: customer.id,
          customerName: customer.name,
          date: format(selectedDate, 'yyyy-MM-dd'),
          items: customerItems,
          total: customerTotal,
          totalAmount: customerTotal,
          status: 'pending' as const,
          paymentStatus: 'pending' as const,
          vehicleId: '',
          salesmanId: ''
        });
      }
    });
    
    if (orders.length === 0) {
      toast.error('No orders to save');
      return;
    }
    
    orders.forEach(order => addOrder(order));
    toast.success(`${orders.length} orders saved successfully`);
  };
  
  // Generate track sheet
  const generateTrackSheet = () => {
    // Navigate to track sheet with pre-filled data
    const trackSheetData = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      rows: activeCustomers.map(customer => {
        const quantities: Record<string, number> = {};
        activeProducts.forEach(product => {
          const qty = orderData[product.id]?.[customer.id] || 0;
          if (qty > 0) {
            quantities[product.name] = qty;
          }
        });
        
        return {
          customerId: customer.id,
          name: customer.name,
          quantities,
          total: Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
          amount: getCustomerTotal(customer.id),
          products: activeProducts.map(p => p.name)
        };
      }).filter(row => row.total > 0)
    };
    
    // Store in localStorage and navigate
    localStorage.setItem('trackSheetData', JSON.stringify(trackSheetData));
    toast.success('Track sheet data prepared');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Entry System</h1>
          <p className="text-muted-foreground">Excel-like order entry with automatic calculations</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={saveOrders}>
            <Save className="mr-2 h-4 w-4" />
            Save Orders
          </Button>
          <Button variant="outline" onClick={generateTrackSheet}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Track Sheet
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Entry Table
            <div className="flex items-center space-x-4">
              <Label htmlFor="date">Date:</Label>
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                className="w-48"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left font-semibold">
                    Product / Customer
                  </th>
                  {activeCustomers.map(customer => (
                    <th key={customer.id} className="border border-gray-300 p-2 text-center font-semibold min-w-24">
                      {customer.name}
                    </th>
                  ))}
                  <th className="border border-gray-300 p-2 text-center font-semibold bg-blue-50">
                    Total Qty
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeProducts.map(product => (
                  <tr key={product.id}>
                    <td className="border border-gray-300 p-2 font-medium">
                      <div>
                        <div>{product.name}</div>
                        <div className="text-sm text-gray-500">₹{product.price}/unit</div>
                      </div>
                    </td>
                    {activeCustomers.map(customer => (
                      <td key={customer.id} className="border border-gray-300 p-1">
                        <Input
                          type="number"
                          min="0"
                          value={orderData[product.id]?.[customer.id] || ''}
                          onChange={(e) => handleQuantityChange(product.id, customer.id, e.target.value)}
                          className="w-full text-center border-0 focus-visible:ring-1"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 p-2 text-center font-semibold bg-blue-50">
                      {getProductTotal(product.id)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-yellow-50">
                  <td className="border border-gray-300 p-2 font-bold">
                    Total Amount
                  </td>
                  {activeCustomers.map(customer => (
                    <td key={customer.id} className="border border-gray-300 p-2 text-center font-bold">
                      ₹{getCustomerTotal(customer.id).toFixed(2)}
                    </td>
                  ))}
                  <td className="border border-gray-300 p-2 text-center font-bold bg-green-100">
                    ₹{getGrandTotal().toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Customer Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeCustomers.map(customer => {
                const total = getCustomerTotal(customer.id);
                if (total > 0) {
                  return (
                    <div key={customer.id} className="flex justify-between">
                      <span>{customer.name}</span>
                      <span className="font-semibold">₹{total.toFixed(2)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Product Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeProducts.map(product => {
                const total = getProductTotal(product.id);
                if (total > 0) {
                  return (
                    <div key={product.id} className="flex justify-between">
                      <span>{product.name}</span>
                      <span className="font-semibold">{total} units</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
