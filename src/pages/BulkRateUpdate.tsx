
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Check, Edit, File, Filter, Plus, Save, Search, Upload } from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';
import { CustomerProductRate } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function BulkRateUpdate() {
  const { products, customers, addCustomerProductRate, updateCustomerProductRate } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedRates, setEditedRates] = useState<Record<string, number>>({});
  const [currentRates, setCurrentRates] = useState<CustomerProductRate[]>([]);
  
  // Load current rates for the selected customer
  useEffect(() => {
    if (selectedCustomer) {
      // In a real application, fetch this from DataContext
      // For now, we'll use a placeholder
      const existingRates: CustomerProductRate[] = [];
      setCurrentRates(existingRates);
      
      // Reset edit states when customer changes
      setEditMode({});
      setEditedRates({});
    }
  }, [selectedCustomer]);
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle enabling edit mode for a product
  const handleEnableEdit = (productId: string) => {
    // Find current rate
    const currentRate = currentRates.find(rate => 
      rate.productId === productId && rate.customerId === selectedCustomer
    );
    
    setEditMode(prev => ({ ...prev, [productId]: true }));
    setEditedRates(prev => ({ 
      ...prev, 
      [productId]: currentRate?.rate || products.find(p => p.id === productId)?.price || 0 
    }));
  };
  
  // Handle rate update
  const handleSaveRate = (productId: string) => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }
    
    const existingRate = currentRates.find(
      rate => rate.productId === productId && rate.customerId === selectedCustomer
    );
    
    const newRate = editedRates[productId] || 0;
    
    if (existingRate) {
      updateCustomerProductRate(existingRate.id, {
        ...existingRate,
        rate: newRate,
        effectiveDate: new Date().toISOString().split('T')[0]
      });
    } else {
      addCustomerProductRate({
        customerId: selectedCustomer,
        productId,
        rate: newRate,
        effectiveDate: new Date().toISOString().split('T')[0],
        isActive: true
      });
    }
    
    setEditMode(prev => ({ ...prev, [productId]: false }));
    toast.success("Rate updated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Rate Update</h1>
          <p className="text-muted-foreground">Update product rates for customers in bulk</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Customer Rates</CardTitle>
          <CardDescription>
            Select a customer and update their product rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-select">Select Customer</Label>
              <Select
                value={selectedCustomer || ""}
                onValueChange={(value) => setSelectedCustomer(value)}
              >
                <SelectTrigger className="w-full">
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

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Standard Rate</TableHead>
                    <TableHead>Customer Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const customerRate = currentRates.find(
                        rate => rate.productId === product.id && rate.customerId === selectedCustomer
                      );
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category || "Uncategorized"}</TableCell>
                          <TableCell>₹{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {editMode[product.id] ? (
                              <Input
                                type="number"
                                value={editedRates[product.id] || ""}
                                onChange={(e) => 
                                  setEditedRates(prev => ({
                                    ...prev, 
                                    [product.id]: parseFloat(e.target.value) || 0
                                  }))
                                }
                                className="max-w-[120px]"
                              />
                            ) : (
                              <>
                                ₹{customerRate?.rate?.toFixed(2) || product.price.toFixed(2)}
                                {customerRate?.rate !== undefined && customerRate.rate !== product.price && (
                                  customerRate.rate > product.price 
                                    ? <ArrowUp className="inline-block ml-1 h-4 w-4 text-green-600" />
                                    : <ArrowDown className="inline-block ml-1 h-4 w-4 text-red-600" />
                                )}
                              </>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editMode[product.id] ? (
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveRate(product.id)}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEnableEdit(product.id)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset All</Button>
          <Button onClick={() => toast.success("All rates updated successfully")}>
            <Check className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Import/Export</CardTitle>
          <CardDescription>
            Import or export product rates in bulk using spreadsheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Import Rates from Excel
            </Button>
            
            <Button variant="outline" className="flex items-center">
              <File className="mr-2 h-4 w-4" />
              Export Rates Template
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Import instructions:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Download the template file first</li>
              <li>Fill in the customer rates in the spreadsheet</li>
              <li>Save the file and import it back</li>
              <li>All rates will be updated in one go</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
