
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlidersHorizontal, Search, Save, Printer, Download, Check, AlertTriangle, Clock } from 'lucide-react';
import { Product } from '@/types';
import { exportToPdf } from '@/utils/pdfUtils';
import { format } from 'date-fns';

export default function BulkRateUpdate() {
  const { products, customers, updateProduct, productRates, updateProductRate, addProductRate } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [updatePercentage, setUpdatePercentage] = useState<number>(0);
  const [isFixedAmount, setIsFixedAmount] = useState<boolean>(false);
  const [isRateHistoryDialogOpen, setIsRateHistoryDialogOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [changedProducts, setChangedProducts] = useState<{ id: string, oldPrice: number, newPrice: number }[]>([]);

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle product selection
  const toggleProductSelection = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts);
    }
  };

  // Handle price update
  const handlePriceUpdate = () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    if (updatePercentage === 0 && isFixedAmount === false) {
      toast.error("Please enter a valid percentage or fixed amount");
      return;
    }

    const changes = selectedProducts.map(product => {
      const oldPrice = product.price;
      let newPrice: number;
      
      if (isFixedAmount) {
        newPrice = updatePercentage;
      } else {
        newPrice = oldPrice + (oldPrice * updatePercentage / 100);
      }
      
      // Round to 2 decimal places
      newPrice = Math.round(newPrice * 100) / 100;
      
      return {
        id: product.id,
        oldPrice,
        newPrice
      };
    });
    
    setChangedProducts(changes);
    setShowConfirmDialog(true);
  };

  // Apply price updates
  const applyPriceUpdates = () => {
    changedProducts.forEach(change => {
      const product = products.find(p => p.id === change.id);
      if (product) {
        // Update product price
        updateProduct(change.id, { price: change.newPrice });
        
        // Record price history
        addProductRate({
          productId: change.id,
          date: new Date().toISOString(),
          rate: change.newPrice,
          previousRate: change.oldPrice,
          effectiveDate: new Date().toISOString(),
          notes: isFixedAmount 
            ? `Set to fixed price ₹${change.newPrice}` 
            : `${updatePercentage > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(updatePercentage)}%`
        });
      }
    });
    
    toast.success(`Updated prices for ${changedProducts.length} products`);
    setShowConfirmDialog(false);
    setSelectedProducts([]);
    setChangedProducts([]);
  };

  // Handle export to PDF
  const handleExportPdf = () => {
    const headers = ["Product ID", "Product Name", "Old Price", "New Price", "Change"];
    
    const rows = changedProducts.map(change => {
      const product = products.find(p => p.id === change.id);
      const priceDifference = change.newPrice - change.oldPrice;
      const percentChange = (priceDifference / change.oldPrice) * 100;
      
      return [
        change.id,
        product ? product.name : "Unknown",
        `₹${change.oldPrice.toFixed(2)}`,
        `₹${change.newPrice.toFixed(2)}`,
        `${priceDifference >= 0 ? '+' : ''}${priceDifference.toFixed(2)} (${percentChange.toFixed(2)}%)`
      ];
    });
    
    exportToPdf(headers, rows, {
      title: 'Bulk Price Update',
      subtitle: `Generated on ${format(new Date(), 'dd/MM/yyyy')}`,
      filename: `price-update-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    });
    
    toast.success("PDF exported successfully");
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Could not open print window. Please allow popups.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk Price Update</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; text-align: left; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            h1 { margin: 0; }
            .print-date { text-align: right; }
            .positive { color: green; }
            .negative { color: red; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bulk Price Update</h1>
            <div class="print-date">Generated: ${format(new Date(), 'PPP')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Old Price</th>
                <th>New Price</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              ${changedProducts.map(change => {
                const product = products.find(p => p.id === change.id);
                const priceDifference = change.newPrice - change.oldPrice;
                const percentChange = (priceDifference / change.oldPrice) * 100;
                const changeClass = priceDifference >= 0 ? 'positive' : 'negative';
                
                return `
                  <tr>
                    <td>${change.id}</td>
                    <td>${product ? product.name : "Unknown"}</td>
                    <td>₹${change.oldPrice.toFixed(2)}</td>
                    <td>₹${change.newPrice.toFixed(2)}</td>
                    <td class="${changeClass}">
                      ${priceDifference >= 0 ? '+' : ''}${priceDifference.toFixed(2)} 
                      (${percentChange.toFixed(2)}%)
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // Get product price history
  const getProductPriceHistory = (productId: string) => {
    return productRates
      .filter(rate => rate.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Rate Update</h1>
          <p className="text-muted-foreground">Update product prices in bulk</p>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">All Products</TabsTrigger>
          <TabsTrigger value="customer">Customer Specific</TabsTrigger>
          <TabsTrigger value="history">Price History</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Product Rates</CardTitle>
              <CardDescription>
                Select products and apply a percentage change or set a fixed amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={updatePercentage}
                    onChange={(e) => setUpdatePercentage(parseFloat(e.target.value) || 0)}
                    placeholder={isFixedAmount ? "Enter fixed amount" : "Enter percentage"}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fixed-amount"
                    className="h-4 w-4"
                    checked={isFixedAmount}
                    onChange={() => setIsFixedAmount(!isFixedAmount)}
                  />
                  <label htmlFor="fixed-amount">Fixed Amount</label>
                </div>
                <Button onClick={handlePriceUpdate} disabled={selectedProducts.length === 0}>
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {isFixedAmount ? 'Set Fixed Price' : 'Apply Percentage Change'}
                </Button>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      className="h-4 w-4 mr-2"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all">Select All</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-60"
                    />
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
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
                          const isSelected = selectedProducts.some(p => p.id === product.id);
                          const history = getProductPriceHistory(product.id);
                          const lastUpdated = history.length > 0
                            ? format(new Date(history[0].date), 'dd/MM/yyyy')
                            : 'Never';
                          
                          return (
                            <TableRow key={product.id} className={isSelected ? "bg-muted/50" : ""}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleProductSelection(product)}
                                  className="h-4 w-4"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>₹{product.price.toFixed(2)}</TableCell>
                              <TableCell>{lastUpdated}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProductId(product.id);
                                    setIsRateHistoryDialogOpen(true);
                                  }}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  View History
                                </Button>
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
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer-Specific Rates</CardTitle>
              <CardDescription>
                Set special pricing for specific customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Select Customer</label>
                    <Select
                      value={selectedCustomerId || ""}
                      onValueChange={(value) => setSelectedCustomerId(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Select Product</label>
                    <Select
                      value={selectedProductId || ""}
                      onValueChange={(value) => setSelectedProductId(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {selectedCustomerId && selectedProductId && (
                  <div className="mt-4 p-4 border rounded-lg">
                    {(() => {
                      const product = products.find(p => p.id === selectedProductId);
                      const customer = customers.find(c => c.id === selectedCustomerId);
                      const customerRate = productRates.find(
                        rate => rate.productId === selectedProductId && rate.customerId === selectedCustomerId
                      );
                      
                      if (!product || !customer) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium">Special Pricing</h3>
                            <div className="flex justify-between mt-2">
                              <span className="text-muted-foreground">Standard Price:</span>
                              <span>₹{product.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Customer Price:</span>
                              <span>
                                {customerRate 
                                  ? `₹${customerRate.rate.toFixed(2)}` 
                                  : "No special price set"}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Set Special Price for {customer.name}
                            </label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder="Enter special price"
                                defaultValue={customerRate?.rate || product.price}
                                id="special-price"
                              />
                              <Button onClick={() => {
                                const specialPrice = parseFloat(
                                  (document.getElementById('special-price') as HTMLInputElement).value
                                );
                                
                                if (isNaN(specialPrice) || specialPrice <= 0) {
                                  toast.error("Please enter a valid price");
                                  return;
                                }
                                
                                if (customerRate) {
                                  updateProductRate(customerRate.id, {
                                    rate: specialPrice,
                                    previousRate: customerRate.rate,
                                    date: new Date().toISOString()
                                  });
                                } else {
                                  addProductRate({
                                    productId: selectedProductId,
                                    customerId: selectedCustomerId,
                                    rate: specialPrice,
                                    previousRate: product.price,
                                    date: new Date().toISOString(),
                                    effectiveDate: new Date().toISOString()
                                  });
                                }
                                
                                toast.success(`Special price set for ${customer.name}`);
                              }}>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                View history of price changes for all products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Old Price</TableHead>
                      <TableHead>New Price</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productRates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No price history found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productRates
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 50) // Show only last 50 entries
                        .map((rate, index) => {
                          const product = products.find(p => p.id === rate.productId);
                          const customer = rate.customerId 
                            ? customers.find(c => c.id === rate.customerId) 
                            : null;
                          
                          const priceDifference = rate.rate - (rate.previousRate || 0);
                          const percentChange = rate.previousRate 
                            ? (priceDifference / rate.previousRate) * 100 
                            : 0;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                {format(new Date(rate.date), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell className="font-medium">
                                {product ? product.name : "Unknown"}
                                {customer && (
                                  <Badge variant="outline" className="ml-2">
                                    {customer.name}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                ₹{rate.previousRate?.toFixed(2) || "N/A"}
                              </TableCell>
                              <TableCell>
                                ₹{rate.rate.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {rate.previousRate && (
                                  <Badge className={priceDifference >= 0 ? "bg-green-500" : "bg-red-500"}>
                                    {priceDifference >= 0 ? '+' : ''}
                                    {priceDifference.toFixed(2)} ({percentChange.toFixed(2)}%)
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {rate.notes || (
                                  customer 
                                    ? `Special price for ${customer.name}` 
                                    : "Price update"
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => {
                  // Export all price history
                  const headers = ["Date", "Product", "Old Price", "New Price", "Change", "Notes"];
                  
                  const rows = productRates
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(rate => {
                      const product = products.find(p => p.id === rate.productId);
                      const customer = rate.customerId 
                        ? customers.find(c => c.id === rate.customerId) 
                        : null;
                      
                      const productName = product 
                        ? (customer ? `${product.name} (${customer.name})` : product.name) 
                        : "Unknown";
                      
                      const priceDifference = rate.rate - (rate.previousRate || 0);
                      const percentChange = rate.previousRate 
                        ? (priceDifference / rate.previousRate) * 100 
                        : 0;
                      
                      return [
                        format(new Date(rate.date), 'dd/MM/yyyy'),
                        productName,
                        rate.previousRate?.toFixed(2) || "N/A",
                        rate.rate.toFixed(2),
                        `${priceDifference >= 0 ? '+' : ''}${priceDifference.toFixed(2)} (${percentChange.toFixed(2)}%)`,
                        rate.notes || (customer ? `Special price for ${customer.name}` : "Price update")
                      ];
                    });
                  
                  exportToPdf(headers, rows, {
                    title: 'Price History',
                    subtitle: `Generated on ${format(new Date(), 'dd/MM/yyyy')}`,
                    filename: `price-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`
                  });
                  
                  toast.success("PDF exported successfully");
                }}>
                  <Download className="mr-2 h-4 w-4" />
                  Export History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rate History Dialog */}
      <Dialog open={isRateHistoryDialogOpen} onOpenChange={setIsRateHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Price History</DialogTitle>
            <DialogDescription>
              {(() => {
                if (!selectedProductId) return "Product price history";
                const product = products.find(p => p.id === selectedProductId);
                return `Price history for ${product ? product.name : "unknown product"}`;
              })()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProductId && (
            <div className="py-4">
              <div className="rounded-md border max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Old Price</TableHead>
                      <TableHead>New Price</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const history = getProductPriceHistory(selectedProductId);
                      
                      if (history.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No price history found.
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      return history.map((rate, index) => {
                        const priceDifference = rate.rate - (rate.previousRate || 0);
                        const percentChange = rate.previousRate 
                          ? (priceDifference / rate.previousRate) * 100 
                          : 0;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {format(new Date(rate.date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              ₹{rate.previousRate?.toFixed(2) || "N/A"}
                            </TableCell>
                            <TableCell>
                              ₹{rate.rate.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {rate.previousRate && (
                                <Badge className={priceDifference >= 0 ? "bg-green-500" : "bg-red-500"}>
                                  {priceDifference >= 0 ? '+' : ''}
                                  {priceDifference.toFixed(2)} ({percentChange.toFixed(2)}%)
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRateHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Price Update Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Price Update</DialogTitle>
            <DialogDescription>
              Please review the price changes before confirming
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="rounded-md border max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Old Price</TableHead>
                    <TableHead>New Price</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changedProducts.map((change, index) => {
                    const product = products.find(p => p.id === change.id);
                    const priceDifference = change.newPrice - change.oldPrice;
                    const percentChange = (priceDifference / change.oldPrice) * 100;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {product ? product.name : "Unknown"}
                        </TableCell>
                        <TableCell>
                          ₹{change.oldPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          ₹{change.newPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={priceDifference >= 0 ? "bg-green-500" : "bg-red-500"}>
                            {priceDifference >= 0 ? '+' : ''}
                            {priceDifference.toFixed(2)} ({percentChange.toFixed(2)}%)
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div>
                <Badge variant="outline" className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                  This action will update prices for {changedProducts.length} products
                </Badge>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleExportPdf()}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => handlePrint()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={applyPriceUpdates} className="bg-gradient-primary hover:opacity-90">
              <Check className="mr-2 h-4 w-4" />
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
