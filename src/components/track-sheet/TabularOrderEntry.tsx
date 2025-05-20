
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrackSheetRow } from '@/types';
import { ChevronRight, ChevronLeft, FilePlus, Plus, Trash2 } from 'lucide-react';

interface TabularOrderEntryProps {
  customers: { id: string; name: string }[];
  products: { id: string; name: string; price: number }[];
  rows: TrackSheetRow[];
  onRowsChange: (rows: TrackSheetRow[]) => void;
  customerProductRates?: any[];
}

export function TabularOrderEntry({
  customers,
  products,
  rows,
  onRowsChange,
  customerProductRates = []
}: TabularOrderEntryProps) {
  const [visibleProducts, setVisibleProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 5; // Number of products to show per page
  const productNames = products.filter(p => p.isActive !== false).map(p => p.name);
  
  useEffect(() => {
    // Initialize with first set of products
    setVisibleProducts(getVisibleProducts());
  }, [products]);
  
  // Get the products for the current page
  const getVisibleProducts = () => {
    const start = currentPage * productsPerPage;
    return productNames.slice(start, start + productsPerPage);
  };
  
  // Handle page navigation
  const nextPage = () => {
    if ((currentPage + 1) * productsPerPage < productNames.length) {
      setCurrentPage(currentPage + 1);
      setVisibleProducts(getVisibleProducts());
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setVisibleProducts(getVisibleProducts());
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (rowIndex: number, productName: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].quantities[productName] = value;
    
    // Calculate the row total
    let total = 0;
    Object.entries(updatedRows[rowIndex].quantities).forEach(([prodName, qty]) => {
      const numQty = Number(qty) || 0;
      total += numQty;
    });
    updatedRows[rowIndex].total = total;
    
    // Calculate the amount based on product prices or customer-specific rates
    let amount = 0;
    Object.entries(updatedRows[rowIndex].quantities).forEach(([prodName, qty]) => {
      const numQty = Number(qty) || 0;
      const product = products.find(p => p.name === prodName);
      
      // Check for customer-specific rate
      const customerId = updatedRows[rowIndex].customerId;
      let price = product?.price || 0;
      
      if (customerId && customerProductRates?.length) {
        const customerRate = customerProductRates.find(
          rate => rate.customerId === customerId && rate.productId === product?.id
        );
        if (customerRate) {
          price = customerRate.rate;
        }
      }
      
      amount += numQty * price;
    });
    updatedRows[rowIndex].amount = amount;
    
    onRowsChange(updatedRows);
  };

  // Handle adding a new customer row
  const addCustomerRow = () => {
    const newRow: TrackSheetRow = {
      name: '',
      customerId: '',
      quantities: productNames.reduce((acc, productName) => {
        acc[productName] = '';
        return acc;
      }, {} as Record<string, string | number>),
      total: 0,
      amount: 0,
      products: productNames
    };
    
    onRowsChange([...rows, newRow]);
  };
  
  // Handle updating row customer
  const updateRowCustomer = (index: number, customerName: string) => {
    const updatedRows = [...rows];
    const customer = customers.find(c => c.name === customerName);
    
    if (customer) {
      updatedRows[index].name = customerName;
      updatedRows[index].customerId = customer.id;
      onRowsChange(updatedRows);
    }
  };
  
  // Handle removing a row
  const removeRow = (index: number) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    onRowsChange(updatedRows);
  };
  
  // Calculate column totals
  const calculateColumnTotals = () => {
    const totals: Record<string, number> = {};
    
    visibleProducts.forEach(productName => {
      totals[productName] = rows.reduce((sum, row) => {
        const qty = row.quantities[productName];
        const numQty = Number(qty) || 0;
        return sum + numQty;
      }, 0);
    });
    
    return totals;
  };
  
  const columnTotals = calculateColumnTotals();
  const totalQuantity = rows.reduce((sum, row) => sum + row.total, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Order Entry</CardTitle>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage + 1} of {Math.ceil(productNames.length / productsPerPage)}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextPage} 
            disabled={(currentPage + 1) * productsPerPage >= productNames.length}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button onClick={addCustomerRow} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Customer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Customer</TableHead>
                {visibleProducts.map(product => (
                  <TableHead key={product} className="text-center min-w-[100px]">
                    {product}
                  </TableHead>
                ))}
                <TableHead className="text-center">Total Qty</TableHead>
                <TableHead className="text-center">Amount (₹)</TableHead>
                <TableHead className="text-center w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>
                    {row.name ? (
                      row.name
                    ) : (
                      <Select onValueChange={(value) => updateRowCustomer(rowIndex, value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers
                            .filter(c => c.isActive !== false)
                            .map(customer => (
                              <SelectItem key={customer.id} value={customer.name}>
                                {customer.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  {visibleProducts.map(product => (
                    <TableCell key={product} className="p-0">
                      <Input
                        type="number"
                        min="0"
                        className="text-center border-0 h-10"
                        value={row.quantities[product] || ''}
                        onChange={(e) => handleQuantityChange(rowIndex, product, e.target.value)}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-medium">{row.total}</TableCell>
                  <TableCell className="text-center font-medium">₹{row.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(rowIndex)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">Total</TableCell>
                {visibleProducts.map(product => (
                  <TableCell key={product} className="text-center font-bold">
                    {columnTotals[product]}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">{totalQuantity}</TableCell>
                <TableCell className="text-center font-bold">₹{totalAmount.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
