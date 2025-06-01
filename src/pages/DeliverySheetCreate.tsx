import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Download, FileSpreadsheet, Save, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { OrderItem } from '@/types';

interface DeliverySheetRow {
  customerId: string;
  customerName: string;
  productQuantities: { [productId: string]: number };
  totalQty: number;
  totalAmount: number;
}

export default function DeliverySheetCreate() {
  const { customers, products, addOrder } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedArea, setSelectedArea] = useState('');
  const [deliveryRows, setDeliveryRows] = useState<DeliverySheetRow[]>([]);

  // Get unique areas from customers
  const areas = useMemo(() => {
    const areaSet = new Set(customers.map(c => c.area).filter(Boolean));
    return Array.from(areaSet);
  }, [customers]);

  // Filter customers by selected area
  const filteredCustomers = useMemo(() => {
    if (!selectedArea) return customers;
    return customers.filter(customer => customer.area === selectedArea);
  }, [customers, selectedArea]);

  // Initialize delivery rows when area changes
  React.useEffect(() => {
    if (selectedArea) {
      const rows = filteredCustomers.map(customer => ({
        customerId: customer.id,
        customerName: customer.name,
        productQuantities: {},
        totalQty: 0,
        totalAmount: 0
      }));
      setDeliveryRows(rows);
    }
  }, [filteredCustomers, selectedArea]);

  const updateQuantity = (customerIndex: number, productId: string, quantity: number) => {
    const newRows = [...deliveryRows];
    newRows[customerIndex].productQuantities[productId] = quantity;
    
    // Recalculate totals
    const totalQty = Object.values(newRows[customerIndex].productQuantities).reduce((sum, qty) => sum + qty, 0);
    const totalAmount = Object.entries(newRows[customerIndex].productQuantities).reduce((sum, [prodId, qty]) => {
      const product = products.find(p => p.id === prodId);
      return sum + (qty * (product?.price || 0));
    }, 0);
    
    newRows[customerIndex].totalQty = totalQty;
    newRows[customerIndex].totalAmount = totalAmount;
    
    setDeliveryRows(newRows);
  };

  // Calculate column totals
  const columnTotals = useMemo(() => {
    const totals: { [productId: string]: number } = {};
    let totalQty = 0;
    let totalAmount = 0;

    deliveryRows.forEach(row => {
      Object.entries(row.productQuantities).forEach(([productId, qty]) => {
        totals[productId] = (totals[productId] || 0) + qty;
      });
      totalQty += row.totalQty;
      totalAmount += row.totalAmount;
    });

    return { productTotals: totals, totalQty, totalAmount };
  }, [deliveryRows]);

  const saveDeliverySheet = () => {
    if (!selectedDate || !selectedArea) {
      toast.error('Please select date and area');
      return;
    }

    if (deliveryRows.length === 0) {
      toast.error('No customers selected');
      return;
    }

    // Create orders for each customer with items
    let createdOrders = 0;
    
    deliveryRows.forEach(row => {
      if (row.totalQty > 0) {
        const orderItems: OrderItem[] = Object.entries(row.productQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            return {
              id: `item-${Date.now()}-${Math.random()}`,
              productId,
              productName: product?.name || '',
              quantity,
              unitPrice: product?.price || 0,
              unit: product?.unit || ''
            };
          });

        if (orderItems.length > 0) {
          addOrder({
            customerId: row.customerId,
            customerName: row.customerName,
            date: format(selectedDate, 'yyyy-MM-dd'),
            items: orderItems,
            status: 'pending',
            paymentStatus: 'pending',
            total: row.totalAmount,
            notes: `Delivery Sheet - ${selectedArea} Area`
          });
          createdOrders++;
        }
      }
    });

    toast.success(`Delivery sheet saved! Created ${createdOrders} orders.`);
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleExportPDF = () => {
    toast.success('PDF export feature coming soon');
  };

  const handleExportExcel = () => {
    toast.success('Excel export feature coming soon');
  };

  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold neo-noir-gradient-text">
              Create Delivery Sheet
            </h1>
            <p className="neo-noir-text-muted">
              Create delivery sheets by selecting date, area, and entering product quantities
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={saveDeliverySheet} className="neo-noir-button-accent">
              <Save className="mr-2 h-4 w-4" />
              Save Orders
            </Button>
            <Button onClick={handlePrint} variant="outline" className="neo-noir-button-outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleExportPDF} variant="outline" className="neo-noir-button-outline">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="neo-noir-button-outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text">Delivery Parameters</CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Select date and area to create delivery sheet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Delivery Date</Label>
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  className="w-full neo-noir-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Delivery Area</Label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue placeholder="Select delivery area" />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {area}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Sheet Table */}
        {selectedArea && (
          <Card className="neo-noir-card">
            <CardHeader>
              <CardTitle className="neo-noir-text">
                Delivery Sheet - {format(selectedDate, 'dd/MM/yyyy')} - {selectedArea}
              </CardTitle>
              <CardDescription className="neo-noir-text-muted">
                Enter quantities for each customer and product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="neo-noir-table">
                  <TableHeader>
                    <TableRow className="neo-noir-table-header">
                      <TableHead className="min-w-[200px]">Customer</TableHead>
                      {products.map(product => (
                        <TableHead key={product.id} className="text-center min-w-[80px]">
                          {product.code || product.name.substring(0, 6)}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">QTY</TableHead>
                      <TableHead className="text-center">AMOUNT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryRows.map((row, customerIndex) => (
                      <TableRow key={row.customerId} className="neo-noir-table-row">
                        <TableCell className="font-medium">{row.customerName}</TableCell>
                        {products.map(product => (
                          <TableCell key={product.id} className="text-center">
                            <Input
                              type="number"
                              min="0"
                              value={row.productQuantities[product.id] || ''}
                              onChange={(e) => updateQuantity(customerIndex, product.id, parseInt(e.target.value) || 0)}
                              className="w-16 text-center neo-noir-input"
                              placeholder="0"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">{row.totalQty}</TableCell>
                        <TableCell className="text-center font-semibold">₹{row.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals Row */}
                    <TableRow className="neo-noir-table-total">
                      <TableCell className="font-bold">TOTAL</TableCell>
                      {products.map(product => (
                        <TableCell key={product.id} className="text-center font-bold">
                          {columnTotals.productTotals[product.id] || 0}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold">{columnTotals.totalQty}</TableCell>
                      <TableCell className="text-center font-bold">₹{columnTotals.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedArea && (
          <Card className="neo-noir-card">
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold neo-noir-text mb-2">Select Area to Continue</h3>
              <p className="neo-noir-text-muted">
                Please select a delivery area to create the delivery sheet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
