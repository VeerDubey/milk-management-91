import React, { useState, useRef, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, FileSpreadsheet, Calendar, MapPin, Truck, Edit, Save, Plus, CreditCard, Users, Package, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadDeliverySheetPDF, printDeliverySheet, exportToExcel } from '@/utils/deliverySheetUtils';

interface DeliveryItem {
  id: string;
  customerId: string;
  customerName: string;
  area: string;
  productQuantities: { [productId: string]: number };
  totalQty: number;
  amount: number;
  totalPaid?: number;
  balanceDue?: number;
  paymentReceived?: number;
}

export default function DeliverySheet() {
  const { customers, vehicles, orders, products, getProductRateForCustomer } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isEditMode, setIsEditMode] = useState(true);
  const [showPayments, setShowPayments] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Get unique areas from customers
  const areas = useMemo(() => {
    const areaSet = new Set(customers.map(c => c.area).filter(Boolean));
    return Array.from(areaSet);
  }, [customers]);

  // Filter customers by selected areas
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      selectedAreas.length === 0 || selectedAreas.includes(customer.area || '')
    );
  }, [customers, selectedAreas]);

  // Generate delivery items from existing orders or create empty ones
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>(() => {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const relevantOrders = orders.filter(order => 
      order.date === dateStr && order.status !== 'cancelled'
    );

    const itemsMap = new Map<string, DeliveryItem>();

    // Initialize with all customers
    filteredCustomers.forEach(customer => {
      itemsMap.set(customer.id, {
        id: customer.id,
        customerId: customer.id,
        customerName: customer.name,
        area: customer.area || 'No Area',
        productQuantities: {},
        totalQty: 0,
        amount: 0,
        totalPaid: 0,
        balanceDue: 0,
        paymentReceived: 0
      });
    });

    // Fill in order data
    relevantOrders.forEach(order => {
      const item = itemsMap.get(order.customerId);
      if (!item) return;

      order.items.forEach(orderItem => {
        item.productQuantities[orderItem.productId] = orderItem.quantity;
        item.totalQty += orderItem.quantity;
        item.amount += orderItem.quantity * orderItem.unitPrice;
      });
    });

    return Array.from(itemsMap.values());
  });

  // Update delivery items when customers or areas change
  const filteredDeliveryItems = useMemo(() => {
    return deliveryItems.filter(item => 
      selectedAreas.length === 0 || selectedAreas.includes(item.area)
    );
  }, [deliveryItems, selectedAreas]);

  // Update quantity for a specific customer and product
  const updateQuantity = (customerId: string, productId: string, quantity: number) => {
    setDeliveryItems(prev => prev.map(item => {
      if (item.customerId === customerId) {
        const newProductQuantities = { ...item.productQuantities };
        if (quantity > 0) {
          newProductQuantities[productId] = quantity;
        } else {
          delete newProductQuantities[productId];
        }

        // Recalculate totals
        const totalQty = Object.values(newProductQuantities).reduce((sum, qty) => sum + qty, 0);
        const amount = Object.entries(newProductQuantities).reduce((sum, [pId, qty]) => {
          const rate = getProductRateForCustomer(customerId, pId) || 
                      products.find(p => p.id === pId)?.price || 0;
          return sum + (qty * rate);
        }, 0);

        return {
          ...item,
          productQuantities: newProductQuantities,
          totalQty,
          amount,
          balanceDue: amount - (item.totalPaid || 0) - (item.paymentReceived || 0)
        };
      }
      return item;
    }));
  };

  // Calculate totals
  const totals = useMemo(() => {
    const productTotals: { [productId: string]: number } = {};
    let totalQty = 0;
    let totalAmount = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let totalPaymentReceived = 0;

    filteredDeliveryItems.forEach(item => {
      Object.entries(item.productQuantities).forEach(([productId, quantity]) => {
        productTotals[productId] = (productTotals[productId] || 0) + quantity;
      });
      totalQty += item.totalQty;
      totalAmount += item.amount;
      totalPaid += item.totalPaid || 0;
      totalBalance += item.balanceDue || 0;
      totalPaymentReceived += item.paymentReceived || 0;
    });

    return {
      productTotals,
      totalQty,
      totalAmount,
      totalPaid,
      totalBalance,
      totalPaymentReceived
    };
  }, [filteredDeliveryItems]);

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const updatePayment = (customerId: string, payment: number) => {
    setDeliveryItems(prev => prev.map(item => {
      if (item.customerId === customerId) {
        const newPaymentReceived = payment;
        const newBalanceDue = item.amount - (item.totalPaid || 0) - newPaymentReceived;
        return {
          ...item,
          paymentReceived: newPaymentReceived,
          balanceDue: newBalanceDue
        };
      }
      return item;
    }));
  };

  const handlePrint = () => {
    try {
      const printData = {
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedAreas.length > 0 ? selectedAreas.join(', ') : 'All Areas',
        items: filteredDeliveryItems.map(item => ({
          customerName: item.customerName,
          area: item.area,
          ...Object.fromEntries(
            products.map(product => [
              product.code || product.name.replace(/\s+/g, ''),
              item.productQuantities[product.id] || 0
            ])
          ),
          totalQty: item.totalQty,
          amount: item.amount
        })),
        totals: {
          ...Object.fromEntries(
            products.map(product => [
              product.code || product.name.replace(/\s+/g, ''),
              totals.productTotals[product.id] || 0
            ])
          ),
          totalQty: totals.totalQty,
          amount: totals.totalAmount
        }
      };
      
      printDeliverySheet(printData);
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to print delivery sheet');
    }
  };

  const handleDownloadPDF = () => {
    try {
      const pdfData = {
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedAreas.length > 0 ? selectedAreas.join(', ') : 'All Areas',
        items: filteredDeliveryItems.map(item => ({
          customerName: item.customerName,
          area: item.area,
          ...Object.fromEntries(
            products.map(product => [
              product.code || product.name.replace(/\s+/g, ''),
              item.productQuantities[product.id] || 0
            ])
          ),
          totalQty: item.totalQty,
          amount: item.amount
        })),
        totals: {
          ...Object.fromEntries(
            products.map(product => [
              product.code || product.name.replace(/\s+/g, ''),
              totals.productTotals[product.id] || 0
            ])
          ),
          totalQty: totals.totalQty,
          amount: totals.totalAmount
        }
      };
      
      downloadDeliverySheetPDF(pdfData);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      const excelData = {
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedAreas.length > 0 ? selectedAreas.join(', ') : 'All Areas',
        items: filteredDeliveryItems.map(item => ({
          customerName: item.customerName,
          area: item.area,
          ...Object.fromEntries(
            products.map(product => [
              product.code || product.name.replace(/\s+/g, ''),
              item.productQuantities[product.id] || 0
            ])
          ),
          totalQty: item.totalQty,
          amount: item.amount
        })),
        totals: {
          ...Object.fromEntries(
            products.map(product => [
              product.code || product.name.replace(/\s+/g, ''),
              totals.productTotals[product.id] || 0
            ])
          ),
          totalQty: totals.totalQty,
          amount: totals.totalAmount
        }
      };
      
      exportToExcel(excelData);
      toast.success('Excel file exported successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient-aurora">
              VIKAS MILK CENTRE
            </h1>
            <p className="text-lg text-muted-foreground">
              Delivery Sheet Management - Since 1975
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              onClick={() => setIsEditMode(!isEditMode)} 
              variant="outline"
            >
              {isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {isEditMode ? 'Save' : 'Edit'}
            </Button>
            <Button 
              onClick={() => setShowPayments(!showPayments)} 
              variant="outline"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {showPayments ? 'Hide' : 'Show'} Payments
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} className="bg-primary">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Delivery Parameters
            </CardTitle>
            <CardDescription>
              Configure delivery sheet parameters and filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {vehicle.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {format(selectedDate, 'dd/MM/yyyy')}
                  </span>
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
                  Selected Areas: {selectedAreas.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">{filteredDeliveryItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-success" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Total Qty</p>
                  <p className="text-2xl font-bold">{totals.totalQty}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 text-warning">₹</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">₹{totals.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 text-info">₹</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Avg per Customer</p>
                  <p className="text-2xl font-bold">
                    ₹{filteredDeliveryItems.length > 0 ? (totals.totalAmount / filteredDeliveryItems.length).toFixed(0) : '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Sheet Table */}
        <div ref={printRef}>
          <Card className="print:shadow-none">
            <CardHeader className="print:pb-2 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img 
                  src="/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png" 
                  alt="Vikas Milk Centre" 
                  className="h-16 w-16"
                />
                <div>
                  <CardTitle className="text-2xl">VIKAS MILK CENTRE</CardTitle>
                  <p className="text-muted-foreground">SINCE 1975</p>
                </div>
              </div>
              <CardDescription className="text-center">
                Delivery Sheet - {format(selectedDate, 'dd/MM/yyyy')} 
                {selectedAreas.length > 0 && ` - Areas: ${selectedAreas.join(', ')}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-center">S.NO</th>
                      <th className="border border-border p-2 text-left">CUSTOMER NAME</th>
                      <th className="border border-border p-2 text-center">AREA</th>
                      {products.map(product => (
                        <th key={product.id} className="border border-border p-2 text-center min-w-[60px]">
                          {product.code || product.name.substring(0, 6)}
                        </th>
                      ))}
                      <th className="border border-border p-2 text-center">QTY</th>
                      <th className="border border-border p-2 text-center">AMOUNT</th>
                      {showPayments && <th className="border border-border p-2 text-center">PAID</th>}
                      {showPayments && <th className="border border-border p-2 text-center">BALANCE</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveryItems.map((item, index) => (
                      <tr key={item.id} className={item.totalQty === 0 ? 'text-muted-foreground' : ''}>
                        <td className="border border-border p-2 text-center font-medium">{index + 1}</td>
                        <td className="border border-border p-2 font-medium">{item.customerName}</td>
                        <td className="border border-border p-2 text-center">{item.area}</td>
                        {products.map(product => (
                          <td key={product.id} className="border border-border p-2 text-center">
                            {isEditMode ? (
                              <Input
                                type="number"
                                min="0"
                                value={item.productQuantities[product.id] || ''}
                                onChange={(e) => updateQuantity(item.customerId, product.id, parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center text-xs p-1"
                                placeholder="0"
                              />
                            ) : (
                              item.productQuantities[product.id] || '-'
                            )}
                          </td>
                        ))}
                        <td className="border border-border p-2 text-center font-semibold">{item.totalQty || '-'}</td>
                        <td className="border border-border p-2 text-center font-semibold">
                          {item.amount > 0 ? `₹${item.amount.toFixed(2)}` : '-'}
                        </td>
                        {showPayments && (
                          <td className="border border-border p-2 text-center">
                            <Input
                              type="number"
                              min="0"
                              value={item.paymentReceived || ''}
                              onChange={(e) => updatePayment(item.customerId, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-center text-xs p-1"
                              placeholder="0"
                            />
                          </td>
                        )}
                        {showPayments && (
                          <td className="border border-border p-2 text-center font-semibold text-orange-500">
                            ₹{(item.balanceDue || 0).toFixed(2)}
                          </td>
                        )}
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className="bg-primary/10 font-bold">
                      <td className="border border-border p-2 text-center"></td>
                      <td className="border border-border p-2">TOTAL</td>
                      <td className="border border-border p-2"></td>
                      {products.map(product => (
                        <td key={product.id} className="border border-border p-2 text-center">
                          {totals.productTotals[product.id] || 0}
                        </td>
                      ))}
                      <td className="border border-border p-2 text-center">{totals.totalQty}</td>
                      <td className="border border-border p-2 text-center">₹{totals.totalAmount.toFixed(2)}</td>
                      {showPayments && <td className="border border-border p-2 text-center">₹{totals.totalPaymentReceived.toFixed(2)}</td>}
                      {showPayments && <td className="border border-border p-2 text-center">₹{totals.totalBalance.toFixed(2)}</td>}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Section */}
              <div className="mt-12 flex justify-between items-end print:block">
                <div className="text-center">
                  <div className="border-b-2 border-border w-48 mb-2"></div>
                  <p className="text-sm text-muted-foreground">Driver's Signature</p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-border w-48 mb-2"></div>
                  <p className="text-sm text-muted-foreground">Supervisor's Signature</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}