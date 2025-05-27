import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { Save, Printer, Calculator, Plus, Minus, Download, ArrowRight, Copy, FileSpreadsheet, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  generateEnhancedTrackSheetPdf, 
  downloadEnhancedPdf, 
  exportEnhancedTrackSheetToCSV,
  downloadEnhancedCSV,
  printTrackSheet
} from '@/utils/enhancedTrackSheetUtils';

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
  
  // Create track sheet data
  const createTrackSheetData = () => {
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
    }).filter(row => row.total > 0);
    
    return {
      name: trackSheetName,
      date: format(trackSheetDate, 'yyyy-MM-dd'),
      vehicleId: selectedVehicle,
      salesmanId: selectedSalesman,
      routeName,
      rows,
      notes,
      vehicleName: vehicles.find(v => v.id === selectedVehicle)?.name,
      salesmanName: salesmen.find(s => s.id === selectedSalesman)?.name
    };
  };
  
  // Save as track sheet
  const saveAsTrackSheet = () => {
    if (!trackSheetDate) {
      toast.error("Please select a date");
      return;
    }
    
    const trackSheetData = createTrackSheetData();
    
    if (trackSheetData.rows.length === 0) {
      toast.error("No orders to save");
      return;
    }
    
    const result = addTrackSheet(trackSheetData);
    
    if (result) {
      toast.success("Track sheet saved successfully");
      navigate('/track-sheet-history');
    }
  };
  
  // Enhanced download as PDF with landscape support
  const downloadPDF = async () => {
    const trackSheetData = createTrackSheetData();
    
    if (trackSheetData.rows.length === 0) {
      toast.error("No data to download");
      return;
    }
    
    try {
      const productNames = activeProducts.map(p => p.name);
      const doc = generateEnhancedTrackSheetPdf(trackSheetData, productNames, [], {
        landscape: true,
        fontSize: 10,
        includeHeader: true,
        includeFooter: true
      });
      
      const filename = `tracksheet-${format(trackSheetDate, 'yyyy-MM-dd')}.pdf`;
      const success = await downloadEnhancedPdf(doc, filename);
      
      if (success) {
        toast.success("PDF downloaded successfully");
      } else {
        toast.error("Failed to download PDF");
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error("Error generating PDF");
    }
  };
  
  // Enhanced download as CSV
  const downloadCSV = async () => {
    const trackSheetData = createTrackSheetData();
    
    if (trackSheetData.rows.length === 0) {
      toast.error("No data to download");
      return;
    }
    
    try {
      const productNames = activeProducts.map(p => p.name);
      const csvContent = exportEnhancedTrackSheetToCSV(trackSheetData, productNames);
      const filename = `tracksheet-${format(trackSheetDate, 'yyyy-MM-dd')}.csv`;
      
      const success = await downloadEnhancedCSV(csvContent, filename);
      
      if (success) {
        toast.success("CSV downloaded successfully");
      } else {
        toast.error("Failed to download CSV");
      }
    } catch (error) {
      console.error('CSV download error:', error);
      toast.error("Error generating CSV");
    }
  };

  // Enhanced print function
  const handlePrint = () => {
    const trackSheetData = createTrackSheetData();
    
    if (trackSheetData.rows.length === 0) {
      toast.error("No data to print");
      return;
    }
    
    try {
      const productNames = activeProducts.map(p => p.name);
      const success = printTrackSheet(trackSheetData, productNames);
      
      if (success) {
        toast.success("Print dialog opened");
      } else {
        toast.error("Failed to print");
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error("Error printing track sheet");
    }
  };

  // Preview function
  const previewTrackSheet = () => {
    const trackSheetData = createTrackSheetData();
    
    if (trackSheetData.rows.length === 0) {
      toast.error("No data to preview");
      return;
    }
    
    try {
      const productNames = activeProducts.map(p => p.name);
      const doc = generateEnhancedTrackSheetPdf(trackSheetData, productNames, [], {
        landscape: true,
        fontSize: 10,
        includeHeader: true,
        includeFooter: true
      });
      
      // Open in new tab for preview
      window.open(doc.output('bloburl'), '_blank');
      toast.success("Preview opened in new tab");
    } catch (error) {
      console.error('Preview error:', error);
      toast.error("Error generating preview");
    }
  };

  // Carry forward to next day
  const carryForwardToNextDay = () => {
    const nextDay = addDays(trackSheetDate, 1);
    setTrackSheetDate(nextDay);
    setTrackSheetName(`Track Sheet - ${format(nextDay, 'dd/MM/yyyy')}`);
    toast.success("Track sheet carried forward to next day");
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Advanced Track Sheet
          </h1>
          <p className="text-muted-foreground">Excel-style order entry system with enhanced features</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={previewTrackSheet} variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handlePrint} variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={downloadPDF} className="bg-primary hover:bg-primary/90 button-glow">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={downloadCSV} variant="outline" className="border-success text-success hover:bg-success/10">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <Button onClick={saveAsTrackSheet} className="bg-gradient-button button-glow">
            <Save className="mr-2 h-4 w-4" />
            Save Track Sheet
          </Button>
        </div>
      </div>
      
      {/* Header Details - Enhanced */}
      <Card className="border-primary/20 shadow-card hover:shadow-hover transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="text-primary flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Track Sheet Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={trackSheetName} 
                onChange={(e) => setTrackSheetName(e.target.value)}
                className="border-primary/20 focus:border-primary"
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
                <SelectTrigger className="border-primary/20">
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
                <SelectTrigger className="border-primary/20">
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
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="border-primary/20 focus:border-primary"
              placeholder="Add any notes..."
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Order Matrix - Enhanced */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="text-primary flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Order Entry Matrix
            <Badge variant="secondary" className="ml-auto">
              Total: ₹{grandTotal.toFixed(2)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Enhanced Header Row */}
              <thead>
                <tr className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <th className="border border-primary/20 p-3 text-left font-semibold text-primary sticky left-0 bg-primary/10 z-10">
                    Product
                  </th>
                  <th className="border border-primary/20 p-3 text-center font-semibold text-primary min-w-[80px]">
                    Price (₹)
                  </th>
                  {activeCustomers.map(customer => (
                    <th key={customer.id} className="border border-primary/20 p-3 text-center font-semibold text-primary min-w-[120px]">
                      {customer.name}
                    </th>
                  ))}
                  <th className="border border-primary/20 p-3 text-center font-semibold text-primary min-w-[100px]">
                    Total Qty
                  </th>
                  <th className="border border-primary/20 p-3 text-center font-semibold text-primary min-w-[120px]">
                    Total Amount
                  </th>
                </tr>
              </thead>
              
              {/* Enhanced Product Rows */}
              <tbody>
                {activeProducts.map((product, productIndex) => {
                  const productTotal = productTotals[productIndex];
                  
                  return (
                    <tr key={product.id} className="hover:bg-primary/5 transition-colors">
                      <td className="border border-primary/20 p-3 font-medium sticky left-0 bg-background z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                          {product.name}
                        </div>
                      </td>
                      <td className="border border-primary/20 p-3 text-center font-mono">
                        ₹{product.price.toFixed(2)}
                      </td>
                      {activeCustomers.map(customer => {
                        const quantity = getQuantity(product.id, customer.id);
                        
                        return (
                          <td key={customer.id} className="border border-primary/20 p-1">
                            <Input
                              type="number"
                              min="0"
                              value={quantity || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                updateQuantity(product.id, customer.id, value);
                              }}
                              className="w-full text-center border-none bg-transparent focus:bg-primary/10 transition-colors"
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      <td className="border border-primary/20 p-3 text-center bg-primary/5">
                        <Badge variant="secondary" className="bg-primary/20 text-primary font-mono">
                          {productTotal.totalQuantity}
                        </Badge>
                      </td>
                      <td className="border border-primary/20 p-3 text-center bg-primary/5">
                        <Badge variant="secondary" className="bg-accent/20 text-accent font-mono">
                          ₹{productTotal.totalAmount.toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Enhanced Customer Totals Row */}
                <tr className="bg-gradient-to-r from-primary/20 to-accent/20 font-semibold">
                  <td className="border border-primary/20 p-3 text-primary sticky left-0 bg-primary/20 z-10">
                    CUSTOMER TOTALS
                  </td>
                  <td className="border border-primary/20 p-3"></td>
                  {activeCustomers.map((customer, customerIndex) => {
                    const customerTotal = customerTotals[customerIndex];
                    
                    return (
                      <td key={customer.id} className="border border-primary/20 p-3 text-center">
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-primary text-white font-mono">
                            {customerTotal.totalQuantity} qty
                          </Badge>
                          <Badge className="bg-accent text-white font-mono">
                            ₹{customerTotal.totalAmount.toFixed(2)}
                          </Badge>
                        </div>
                      </td>
                    );
                  })}
                  <td className="border border-primary/20 p-3 text-center">
                    <Badge className="bg-primary text-white font-mono text-lg">
                      {productTotals.reduce((sum, pt) => sum + pt.totalQuantity, 0)}
                    </Badge>
                  </td>
                  <td className="border border-primary/20 p-3 text-center">
                    <Badge className="bg-accent text-white font-mono text-lg">
                      ₹{grandTotal.toFixed(2)}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={carryForwardToNextDay} variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
              <ArrowRight className="mr-2 h-4 w-4" />
              Carry Forward to Next Day
            </Button>
            <Button onClick={saveAsOrders} variant="outline" className="border-accent text-accent hover:bg-accent/10">
              <Plus className="mr-2 h-4 w-4" />
              Convert to Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
