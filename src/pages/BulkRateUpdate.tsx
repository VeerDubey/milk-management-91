
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
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
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Save, 
  Download,
  RefreshCw,
  ArrowDownUp,
  Check,
  X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Customer, Product } from '@/types';
import { exportToPdf } from '@/utils/pdfUtils';
import { format } from 'date-fns';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('single');
  const [batchRateChange, setBatchRateChange] = useState<number | null>(null);
  const [batchChangeType, setBatchChangeType] = useState<'fixed' | 'percentage'>('fixed');
  const [changesMade, setChangesMade] = useState<boolean>(false);

  // Get unique product categories
  const productCategories = [...new Set(products.map(p => p.category || 'Uncategorized').filter(Boolean))];
  
  useEffect(() => {
    // Initialize rateUpdates with existing rates when customer is selected
    if (selectedCustomer) {
      const initialRates = products.reduce((acc: { [productId: string]: number }, product) => {
        const existingRate = customerProductRates.find(
          rate => rate.customerId === selectedCustomer && rate.productId === product.id && rate.isActive
        );
        acc[product.id] = existingRate ? existingRate.rate : product.price;
        return acc;
      }, {});
      setRateUpdates(initialRates);
      setChangesMade(false);
    }
  }, [selectedCustomer, products, customerProductRates]);

  // Function to get product name
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Function to handle rate change for individual product
  const handleRateChange = (productId: string, newRate: number) => {
    setRateUpdates(prev => ({
      ...prev,
      [productId]: newRate
    }));
    setChangesMade(true);
  };

  // Function to save a single rate update
  const handleSaveRateUpdate = (productId: string, newRate: number) => {
    if (!selectedCustomer) {
      toast.error("No customer selected");
      return;
    }
    
    // Check if rate already exists for this customer and product
    const existingRate = customerProductRates.find(
      rate => rate.customerId === selectedCustomer && rate.productId === productId && rate.isActive
    );
    
    try {
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
      setChangesMade(false);
    } catch (error) {
      toast.error("Failed to update rate");
      console.error("Rate update error:", error);
    }
  };

  // Function to save all rate updates
  const handleSaveAllRates = () => {
    if (!selectedCustomer) {
      toast.error("No customer selected");
      return;
    }
    
    try {
      // Process each product rate
      Object.entries(rateUpdates).forEach(([productId, newRate]) => {
        const existingRate = customerProductRates.find(
          rate => rate.customerId === selectedCustomer && rate.productId === productId && rate.isActive
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
      });
      
      toast.success("All rates updated successfully");
      setChangesMade(false);
    } catch (error) {
      toast.error("Failed to update rates");
      console.error("Batch rate update error:", error);
    }
  };

  // Apply batch rate changes to all filtered products
  const applyBatchChanges = () => {
    if (!selectedCustomer || batchRateChange === null) {
      toast.error("Customer or rate change value not specified");
      return;
    }
    
    const updatedRates = { ...rateUpdates };
    
    filteredProducts.forEach(product => {
      if (batchChangeType === 'fixed') {
        updatedRates[product.id] = batchRateChange;
      } else {
        // Percentage change
        const currentRate = updatedRates[product.id] || product.price;
        const changeAmount = currentRate * (batchRateChange / 100);
        updatedRates[product.id] = currentRate + changeAmount;
      }
    });
    
    setRateUpdates(updatedRates);
    setChangesMade(true);
    toast.success(`Batch ${batchChangeType === 'fixed' ? 'fixed rate' : 'percentage'} change applied`);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryMatch = !filterCategory || (product.category || 'Uncategorized') === filterCategory;
    
    return searchMatch && categoryMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'price':
        return direction * ((a.price || 0) - (b.price || 0));
      case 'category':
        return direction * ((a.category || 'Uncategorized').localeCompare(b.category || 'Uncategorized'));
      default:
        return 0;
    }
  });

  // Export rate sheet to PDF
  const exportRateSheet = () => {
    if (!selectedCustomer) {
      toast.error("No customer selected");
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }

    const headers = ['Product', 'Category', 'Regular Price', 'Special Rate'];
    
    const rows = sortedProducts.map(product => [
      product.name,
      product.category || 'Uncategorized',
      `₹${product.price.toFixed(2)}`,
      `₹${(rateUpdates[product.id] || product.price).toFixed(2)}`
    ]);
    
    exportToPdf(headers, rows, {
      title: `Price List for ${customer.name}`,
      subtitle: `Generated on ${format(new Date(), 'PPP')}`,
      filename: `rate-sheet-${customer.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
    });
    
    toast.success("Rate sheet exported successfully");
  };

  // Get customer name
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Rate Update</h1>
          <p className="text-muted-foreground">Update product rates for specific customers</p>
        </div>
        {selectedCustomer && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={exportRateSheet}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Rate Sheet
            </Button>
            <Button 
              variant="default" 
              onClick={handleSaveAllRates}
              disabled={!changesMade}
            >
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
          <CardDescription>Choose a customer to update their product rates</CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            onValueChange={setSelectedCustomer} 
            value={selectedCustomer || undefined}
          >
            <SelectTrigger className="w-full md:w-[300px]">
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
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="single">Individual Updates</TabsTrigger>
              <TabsTrigger value="batch">Batch Updates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="batch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Rate Update</CardTitle>
                  <CardDescription>
                    Apply the same rate change to multiple products at once
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                      <Select 
                        value={batchChangeType} 
                        onValueChange={(value: 'fixed' | 'percentage') => setBatchChangeType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Change type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Set Fixed Rate</SelectItem>
                          <SelectItem value="percentage">Percentage Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <div className="relative">
                        <Input
                          type="number"
                          value={batchRateChange === null ? '' : batchRateChange}
                          onChange={(e) => setBatchRateChange(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder={batchChangeType === 'fixed' ? 'Enter fixed rate amount' : 'Enter percentage change'}
                          className="pr-8"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          {batchChangeType === 'percentage' ? '%' : '₹'}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={applyBatchChanges} 
                      disabled={batchRateChange === null}
                    >
                      Apply to All Products
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {batchChangeType === 'fixed' 
                      ? 'This will set a fixed rate for all filtered products.'
                      : 'Positive percentage increases rates, negative percentage decreases rates.'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={filterCategory} 
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <ScrollArea className="h-[calc(100vh-440px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Product Name
                        {sortBy === 'name' && (
                          <ArrowDownUp className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        {sortBy === 'category' && (
                          <ArrowDownUp className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Regular Price
                        {sortBy === 'price' && (
                          <ArrowDownUp className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Customer Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProducts.map((product) => {
                      const existingRate = customerProductRates.find(
                        rate => rate.customerId === selectedCustomer && rate.productId === product.id && rate.isActive
                      );
                      const currentRate = rateUpdates[product.id] || product.price;
                      const isSpecialRate = existingRate !== undefined;
                      const hasChanged = existingRate?.rate !== currentRate;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            {product.category ? (
                              <Badge variant="outline">{product.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground">Uncategorized</span>
                            )}
                          </TableCell>
                          <TableCell>₹{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={currentRate}
                                onChange={(e) => handleRateChange(product.id, parseFloat(e.target.value))}
                                className={`w-24 ${isSpecialRate ? 'border-green-500' : ''}`}
                                step="0.01"
                              />
                              {isSpecialRate && (
                                <Badge variant="secondary">Special Rate</Badge>
                              )}
                              {hasChanged && (
                                <Badge variant="outline" className="bg-yellow-100">Modified</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSaveRateUpdate(product.id, currentRate)}
                              disabled={existingRate?.rate === currentRate}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRateChange(product.id, product.price)}
                              disabled={currentRate === product.price}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reset
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="p-4 flex items-center justify-between border-t">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products • Customer: {getCustomerName(selectedCustomer)}
              </p>
              {changesMade && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100">Changes not saved</Badge>
                  <Button variant="default" size="sm" onClick={handleSaveAllRates}>
                    <Save className="h-4 w-4 mr-1" />
                    Save All Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // Reset all rates to initial values
                      const initialRates = products.reduce((acc: { [productId: string]: number }, product) => {
                        const existingRate = customerProductRates.find(
                          rate => rate.customerId === selectedCustomer && rate.productId === product.id && rate.isActive
                        );
                        acc[product.id] = existingRate ? existingRate.rate : product.price;
                        return acc;
                      }, {});
                      setRateUpdates(initialRates);
                      setChangesMade(false);
                      toast.info("All changes discarded");
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Discard Changes
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
