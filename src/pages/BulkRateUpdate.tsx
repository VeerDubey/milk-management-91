import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function BulkRateUpdate() {
  const { 
    customers, 
    products, 
    customerProductRates, 
    addCustomerProductRate, 
    updateCustomerProductRate 
  } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [rateUpdates, setRateUpdates] = useState<{ [productId: string]: number }>({});

  useEffect(() => {
    // Initialize rateUpdates with existing rates when customer is selected
    if (selectedCustomer) {
      const initialRates = products.reduce((acc: { [productId: string]: number }, product) => {
        const existingRate = customerProductRates.find(
          rate => rate.customerId === selectedCustomer && rate.productId === product.id
        );
        acc[product.id] = existingRate ? existingRate.rate : product.price;
        return acc;
      }, {});
      setRateUpdates(initialRates);
    }
  }, [selectedCustomer, products, customerProductRates]);

  // Function to get product name
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Function to handle rate change
  const handleRateChange = (productId: string, newRate: number) => {
    setRateUpdates(prev => ({
      ...prev,
      [productId]: newRate
    }));
  };

  // Function to save the rate update
  const handleSaveRateUpdate = (productId: string, newRate: number) => {
    if (!selectedCustomer) {
      toast.error("No customer selected");
      return;
    }
    
    // Check if rate already exists for this customer and product
    const existingRate = customerProductRates.find(
      rate => rate.customerId === selectedCustomer && rate.productId === productId
    );
    
    if (existingRate) {
      updateCustomerProductRate(existingRate.id, {
        rate: newRate,
        effectiveDate: new Date().toISOString()
      });
    } else {
      addCustomerProductRate({
        customerId: selectedCustomer,
        productId,
        rate: newRate,
        effectiveDate: new Date().toISOString(),
        isActive: true
      });
    }
    
    toast.success(`Rate updated for ${getProductName(productId)}`);
    
    // Update the local state to reflect changes immediately
    setRateUpdates(prev => ({
      ...prev,
      [productId]: newRate
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Rate Update</h1>
          <p className="text-muted-foreground">Update product rates for a specific customer</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-[300px]">
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
        </CardContent>
      </Card>

      {selectedCustomer && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Current Rate</TableHead>
                <TableHead>New Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{rateUpdates[product.id]}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={rateUpdates[product.id] || ''}
                      onChange={(e) => handleRateChange(product.id, parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveRateUpdate(product.id, rateUpdates[product.id])}
                    >
                      Update Rate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
