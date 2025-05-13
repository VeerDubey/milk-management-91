
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';

export default function SupplierRates() {
  const { suppliers, products, updateSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRateChange = (supplierId: string, productId: string, newRate: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    const numericRate = parseFloat(newRate);
    if (isNaN(numericRate)) return;
    
    const updatedSupplier = {
      ...supplier,
      rates: {
        ...supplier.rates,
        [productId]: numericRate
      }
    };
    
    updateSupplier(updatedSupplier);
    toast({
      title: "Rate Updated",
      description: "Supplier rate has been updated successfully.",
    });
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const data = filteredSuppliers.map(supplier => {
      const row: Record<string, any> = {
        'Supplier ID': supplier.id,
        'Supplier Name': supplier.name
      };
      
      products.forEach(product => {
        row[product.name] = supplier.rates?.[product.id] || 0;
      });
      
      return row;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Supplier Rates');
    XLSX.writeFile(workbook, 'supplier-rates.xlsx');
    
    toast({
      title: "Export Successful",
      description: "Supplier rates have been exported to Excel.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Supplier Rates</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Rate Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Supplier Name</TableHead>
                  {products.map(product => (
                    <TableHead key={product.id} className="whitespace-nowrap">{product.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    {products.map(product => (
                      <TableCell key={product.id}>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-20"
                          value={supplier.rates?.[product.id] || ''}
                          onChange={(e) => handleRateChange(supplier.id, product.id, e.target.value)}
                          onBlur={(e) => {
                            // Ensure valid number on blur
                            const value = e.target.value;
                            if (value && isNaN(parseFloat(value))) {
                              e.target.value = '0';
                              handleRateChange(supplier.id, product.id, '0');
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
