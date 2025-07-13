import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, Printer, Calculator, MapPin, 
  Calendar, Users, Package, IndianRupee, Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
import { downloadDeliverySheetPDF, printDeliverySheet, exportToExcel } from '@/utils/deliverySheetUtils';
import { LoadSheetCreator } from './LoadSheetCreator';
import type { CheckedState } from '@radix-ui/react-checkbox';

interface DeliverySheetData {
  customer: string;
  area: string;
  GGH: number;
  GGH450: number;
  GTSF: number;
  GSD1KG: number;
  GPC: number;
  FL: number; // F&L
  QTY: number;
  AMOUNT: number;
  crates: number;
}

export default function DeliverySheetGenerator() {
  const { customers, orders, products } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [includeEmptyRows, setIncludeEmptyRows] = useState(true);
  const [sortBy, setSortBy] = useState<'customer' | 'area' | 'amount'>('area');

  // Get unique areas from customers
  const areas = useMemo(() => {
    const areaSet = new Set(customers.map(c => c.area).filter(Boolean));
    return Array.from(areaSet);
  }, [customers]);

  // Generate delivery sheet data
  const deliveryData = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const relevantOrders = orders.filter(order => 
      order.date === dateStr && 
      order.status !== 'cancelled' &&
      (selectedAreas.length === 0 || selectedAreas.includes(customers.find(c => c.id === order.customerId)?.area || ''))
    );

    const dataMap = new Map<string, DeliverySheetData>();

    // Initialize with all customers in selected areas
    const relevantCustomers = customers.filter(customer => 
      selectedAreas.length === 0 || selectedAreas.includes(customer.area || '')
    );

    relevantCustomers.forEach(customer => {
      dataMap.set(customer.id, {
        customer: customer.name,
        area: customer.area || 'No Area',
        GGH: 0,
        GGH450: 0,
        GTSF: 0,
        GSD1KG: 0,
        GPC: 0,
        FL: 0,
        QTY: 0,
        AMOUNT: 0,
        crates: 0
      });
    });

    // Fill in order data
    relevantOrders.forEach(order => {
      const customerData = dataMap.get(order.customerId);
      if (!customerData) return;

      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        const quantity = item.quantity;
        const amount = quantity * item.unitPrice;

        // Map products to columns based on product code/name
        const productCode = product.code?.toUpperCase() || product.name.toUpperCase();
        
        if (productCode.includes('GGH') && !productCode.includes('450')) {
          customerData.GGH += quantity;
        } else if (productCode.includes('GGH450') || productCode.includes('GGH 450')) {
          customerData.GGH450 += quantity;
        } else if (productCode.includes('GTSF')) {
          customerData.GTSF += quantity;
        } else if (productCode.includes('GSD1KG') || productCode.includes('GSD 1KG')) {
          customerData.GSD1KG += quantity;
        } else if (productCode.includes('GPC')) {
          customerData.GPC += quantity;
        } else if (productCode.includes('F&L') || productCode.includes('FL')) {
          customerData.FL += quantity;
        }

        customerData.QTY += quantity;
        customerData.AMOUNT += amount;
      });
    });

    let result = Array.from(dataMap.values());

    // Filter out empty rows if not included
    if (!includeEmptyRows) {
      result = result.filter(row => row.QTY > 0);
    }

    // Sort data
    result.sort((a, b) => {
      switch (sortBy) {
        case 'customer':
          return a.customer.localeCompare(b.customer);
        case 'area':
          return a.area.localeCompare(b.area) || a.customer.localeCompare(b.customer);
        case 'amount':
          return b.AMOUNT - a.AMOUNT;
        default:
          return 0;
      }
    });

    return result;
  }, [selectedDate, selectedAreas, customers, orders, products, includeEmptyRows, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    return deliveryData.reduce((acc, row) => ({
      GGH: acc.GGH + row.GGH,
      GGH450: acc.GGH450 + row.GGH450,
      GTSF: acc.GTSF + row.GTSF,
      GSD1KG: acc.GSD1KG + row.GSD1KG,
      GPC: acc.GPC + row.GPC,
      FL: acc.FL + row.FL,
      QTY: acc.QTY + row.QTY,
      AMOUNT: acc.AMOUNT + row.AMOUNT,
      crates: acc.crates + row.crates
    }), {
      GGH: 0, GGH450: 0, GTSF: 0, GSD1KG: 0, GPC: 0, FL: 0, QTY: 0, AMOUNT: 0, crates: 0
    });
  }, [deliveryData]);

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleIncludeEmptyRowsChange = (checked: CheckedState) => {
    setIncludeEmptyRows(checked === true);
  };

  const generatePDF = () => {
    try {
      const pdfData = {
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedAreas.length > 0 ? selectedAreas.join(', ') : 'All Areas',
        items: deliveryData.map(row => ({
          customerName: row.customer,
          GGH: row.GGH,
          GGH450: row.GGH450,
          GTSF: row.GTSF,
          GSD1KG: row.GSD1KG,
          GPC: row.GPC,
          FL: row.FL,
          totalQty: row.QTY,
          amount: row.AMOUNT
        })),
        totals
      };
      
      downloadDeliverySheetPDF(pdfData);
      toast.success('PDF generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const exportExcel = () => {
    try {
      const excelData = {
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedAreas.length > 0 ? selectedAreas.join(', ') : 'All Areas',
        items: deliveryData.map(row => ({
          customerName: row.customer,
          GGH: row.GGH,
          GGH450: row.GGH450,
          GTSF: row.GTSF,
          GSD1KG: row.GSD1KG,
          GPC: row.GPC,
          FL: row.FL,
          totalQty: row.QTY,
          amount: row.AMOUNT
        })),
        totals
      };
      
      exportToExcel(excelData);
      toast.success('Excel file exported successfully!');
    } catch (error) {
      toast.error('Failed to export to Excel');
    }
  };

  const printSheet = () => {
    try {
      const printData = {
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedAreas.length > 0 ? selectedAreas.join(', ') : 'All Areas',
        items: deliveryData.map(row => ({
          customerName: row.customer,
          GGH: row.GGH,
          GGH450: row.GGH450,
          GTSF: row.GTSF,
          GSD1KG: row.GSD1KG,
          GPC: row.GPC,
          FL: row.FL,
          totalQty: row.QTY,
          amount: row.AMOUNT
        })),
        totals
      };
      
      printDeliverySheet(printData);
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to print');
    }
  };

  return (
    <div className="space-y-6 p-6 neo-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-aurora neo-glow-text">
            Delivery Sheet Generator
          </h1>
          <p className="text-muted-foreground">
            Generate delivery sheets by date and area with auto-calculated totals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printSheet} className="neo-glass">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={exportExcel} className="neo-glass">
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={generatePDF} className="neo-button-primary">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sheet Configuration
          </CardTitle>
          <CardDescription>Configure delivery sheet parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Delivery Date</Label>
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                className="w-full neo-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="neo-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="customer">Customer Name</SelectItem>
                  <SelectItem value="amount">Amount (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="empty-rows" 
                  checked={includeEmptyRows}
                  onCheckedChange={handleIncludeEmptyRowsChange}
                />
                <Label htmlFor="empty-rows">Include empty rows</Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Select Areas (leave empty for all)</Label>
            <div className="flex flex-wrap gap-2">
              {areas.map(area => (
                <Badge
                  key={area}
                  variant={selectedAreas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleAreaToggle(area)}
                >
                  <MapPin className="mr-1 h-3 w-3" />
                  {area}
                </Badge>
              ))}
            </div>
            {selectedAreas.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedAreas.join(', ')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Load Sheet Creator */}
      <LoadSheetCreator 
        deliverySheetData={deliveryData}
        selectedDate={selectedDate}
        selectedArea={selectedAreas.length > 0 ? selectedAreas.join(', ') : undefined}
        selectedVehicle={selectedVehicle}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="neo-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{deliveryData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-success" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Qty</p>
                <p className="text-2xl font-bold">{totals.QTY}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8 text-warning" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{totals.AMOUNT.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-info" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Avg per Customer</p>
                <p className="text-2xl font-bold">
                  ₹{deliveryData.length > 0 ? (totals.AMOUNT / deliveryData.length).toFixed(0) : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Sheet Table */}
      <Card className="neo-card print:shadow-none">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-center">
            Delivery Sheet - {format(selectedDate, 'dd/MM/yyyy')}
          </CardTitle>
          {selectedAreas.length > 0 && (
            <CardDescription className="text-center">
              Areas: {selectedAreas.join(', ')}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Customer</th>
                  <th className="border border-border p-2 text-center">Area</th>
                  <th className="border border-border p-2 text-center">GGH</th>
                  <th className="border border-border p-2 text-center">GGH450</th>
                  <th className="border border-border p-2 text-center">GTSF</th>
                  <th className="border border-border p-2 text-center">GSD1KG</th>
                  <th className="border border-border p-2 text-center">GPC</th>
                  <th className="border border-border p-2 text-center">F&L</th>
                  <th className="border border-border p-2 text-center">QTY</th>
                  <th className="border border-border p-2 text-center">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {deliveryData.map((row, index) => (
                  <tr key={index} className={row.QTY === 0 ? 'text-muted-foreground' : ''}>
                    <td className="border border-border p-2">{row.customer}</td>
                    <td className="border border-border p-2 text-center">{row.area}</td>
                    <td className="border border-border p-2 text-center">{row.GGH || '-'}</td>
                    <td className="border border-border p-2 text-center">{row.GGH450 || '-'}</td>
                    <td className="border border-border p-2 text-center">{row.GTSF || '-'}</td>
                    <td className="border border-border p-2 text-center">{row.GSD1KG || '-'}</td>
                    <td className="border border-border p-2 text-center">{row.GPC || '-'}</td>
                    <td className="border border-border p-2 text-center">{row.FL || '-'}</td>
                    <td className="border border-border p-2 text-center font-semibold">{row.QTY || '-'}</td>
                    <td className="border border-border p-2 text-center font-semibold">
                      {row.AMOUNT > 0 ? `₹${row.AMOUNT.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-primary/10 font-bold">
                  <td className="border border-border p-2">TOTAL</td>
                  <td className="border border-border p-2"></td>
                  <td className="border border-border p-2 text-center">{totals.GGH}</td>
                  <td className="border border-border p-2 text-center">{totals.GGH450}</td>
                  <td className="border border-border p-2 text-center">{totals.GTSF}</td>
                  <td className="border border-border p-2 text-center">{totals.GSD1KG}</td>
                  <td className="border border-border p-2 text-center">{totals.GPC}</td>
                  <td className="border border-border p-2 text-center">{totals.FL}</td>
                  <td className="border border-border p-2 text-center">{totals.QTY}</td>
                  <td className="border border-border p-2 text-center">₹{totals.AMOUNT.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
