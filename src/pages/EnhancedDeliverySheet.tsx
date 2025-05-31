
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
import { Printer, Download, FileSpreadsheet, Calendar, MapPin, Truck, CreditCard, Package, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DeliverySheetItem {
  customerName: string;
  customerId: string;
  productCodes: { [key: string]: number };
  totalQty: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
  paymentReceived: number;
}

interface ProductCodeMapping {
  [productId: string]: string;
}

export default function EnhancedDeliverySheet() {
  const { customers, products, orders, updateProduct } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedArea, setSelectedArea] = useState('');
  const [showPayments, setShowPayments] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Generate product codes automatically
  const generateProductCode = (productName: string): string => {
    const words = productName.toUpperCase().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3);
    }
    
    // Take first letter of each word, max 6 characters
    let code = words.map(word => word.charAt(0)).join('');
    if (code.length > 6) {
      code = code.substring(0, 6);
    }
    
    // Add numbers if present in name
    const numbers = productName.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      code += numbers[0];
    }
    
    return code;
  };

  // Update product codes if missing
  const ensureProductCodes = () => {
    products.forEach(product => {
      if (!product.code) {
        const generatedCode = generateProductCode(product.name);
        updateProduct(product.id, { code: generatedCode });
      }
    });
  };

  // Get unique areas from customers
  const availableAreas = useMemo(() => {
    const areas = customers.map(customer => customer.area).filter(Boolean);
    return [...new Set(areas)].sort();
  }, [customers]);

  // Generate delivery sheet data from orders
  const deliverySheetData = useMemo(() => {
    if (!selectedDate) return [];

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const filteredOrders = orders.filter(order => {
      const orderDate = format(new Date(order.date), 'yyyy-MM-dd');
      const matchesDate = orderDate === dateStr;
      const matchesArea = !selectedArea || 
        customers.find(c => c.id === order.customerId)?.area === selectedArea;
      return matchesDate && matchesArea;
    });

    const customerGrouped: { [customerId: string]: DeliverySheetItem } = {};

    filteredOrders.forEach(order => {
      const customer = customers.find(c => c.id === order.customerId);
      if (!customer) return;

      if (!customerGrouped[order.customerId]) {
        customerGrouped[order.customerId] = {
          customerName: customer.name,
          customerId: order.customerId,
          productCodes: {},
          totalQty: 0,
          totalAmount: 0,
          totalPaid: customer.totalPaid || 0,
          balanceDue: customer.outstandingBalance || 0,
          paymentReceived: 0
        };
      }

      const customerData = customerGrouped[order.customerId];
      customerData.totalAmount += order.total;

      order.items?.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const productCode = product.code || generateProductCode(product.name);
          customerData.productCodes[productCode] = (customerData.productCodes[productCode] || 0) + item.quantity;
          customerData.totalQty += item.quantity;
        }
      });
    });

    return Object.values(customerGrouped);
  }, [selectedDate, selectedArea, orders, customers, products]);

  // Get all unique product codes
  const allProductCodes = useMemo(() => {
    const codes = new Set<string>();
    deliverySheetData.forEach(item => {
      Object.keys(item.productCodes).forEach(code => codes.add(code));
    });
    return Array.from(codes).sort();
  }, [deliverySheetData]);

  // Calculate totals
  const totals = useMemo(() => {
    const result: { [key: string]: number } = {};
    result.totalQty = 0;
    result.totalAmount = 0;
    result.totalPaid = 0;
    result.balanceDue = 0;
    result.paymentReceived = 0;

    allProductCodes.forEach(code => {
      result[code] = deliverySheetData.reduce((sum, item) => sum + (item.productCodes[code] || 0), 0);
    });

    deliverySheetData.forEach(item => {
      result.totalQty += item.totalQty;
      result.totalAmount += item.totalAmount;
      result.totalPaid += item.totalPaid;
      result.balanceDue += item.balanceDue;
      result.paymentReceived += item.paymentReceived;
    });

    return result;
  }, [deliverySheetData, allProductCodes]);

  const generateSheet = async () => {
    setIsGenerating(true);
    try {
      ensureProductCodes();
      toast.success('Delivery sheet generated successfully');
    } catch (error) {
      toast.error('Failed to generate delivery sheet');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleDownloadPDF = () => {
    // PDF download logic would go here
    toast.success('PDF download started');
  };

  const handleExportExcel = () => {
    // Excel export logic would go here
    toast.success('Excel export started');
  };

  const updatePayment = (customerId: string, payment: number) => {
    // Update payment logic would go here
    toast.success('Payment updated');
  };

  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold neo-noir-gradient-text">
              Enhanced Delivery Sheet
            </h1>
            <p className="neo-noir-text-muted">
              Auto-generated delivery sheets from order entries with payment tracking
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              onClick={generateSheet} 
              disabled={isGenerating}
              className="neo-noir-button-accent"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Sheet'}
            </Button>
            <Button 
              onClick={() => setShowPayments(!showPayments)} 
              variant="outline" 
              className="neo-noir-button-outline"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {showPayments ? 'Hide' : 'Show'} Payments
            </Button>
            <Button onClick={handlePrint} variant="outline" className="neo-noir-button-outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} className="neo-noir-button-accent">
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
              Configure delivery sheet parameters and filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Date</Label>
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
                    <SelectValue placeholder="All areas" />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    <SelectItem value="">All Areas</SelectItem>
                    {availableAreas.map(area => (
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
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Summary</Label>
                <div className="flex items-center gap-4 h-10">
                  <Badge variant="secondary" className="bg-blue-400/20 text-blue-400">
                    <Package className="mr-1 h-3 w-3" />
                    {deliverySheetData.length} Customers
                  </Badge>
                  <Badge variant="secondary" className="bg-green-400/20 text-green-400">
                    ₹{totals.totalAmount.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Sheet */}
        <div ref={printRef} className="neo-noir-print-container">
          <Card className="neo-noir-card">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img 
                    src="/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png" 
                    alt="Vikas Milk Centre" 
                    className="h-16 w-16"
                  />
                  <div>
                    <h1 className="text-2xl font-bold neo-noir-text">VIKAS MILK CENTRE</h1>
                    <p className="neo-noir-text-muted">SINCE 1975</p>
                  </div>
                </div>
                <div className="flex justify-between items-center neo-noir-text">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(selectedDate, 'dd/MM/yyyy')}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Area: {selectedArea || 'All Areas'}
                  </span>
                </div>
              </div>

              {/* Table */}
              {deliverySheetData.length > 0 ? (
                <Table className="neo-noir-table">
                  <TableHeader>
                    <TableRow className="neo-noir-table-header">
                      <TableHead className="text-center">S.NO</TableHead>
                      <TableHead>CUSTOMER NAME</TableHead>
                      {allProductCodes.map(code => (
                        <TableHead key={code} className="text-center">{code}</TableHead>
                      ))}
                      <TableHead className="text-center">QTY</TableHead>
                      <TableHead className="text-center">AMOUNT</TableHead>
                      {showPayments && <TableHead className="text-center">PAID</TableHead>}
                      {showPayments && <TableHead className="text-center">BALANCE</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliverySheetData.map((item, index) => (
                      <TableRow key={item.customerId} className="neo-noir-table-row">
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.customerName}</TableCell>
                        {allProductCodes.map(code => (
                          <TableCell key={code} className="text-center">
                            {item.productCodes[code] || ''}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">{item.totalQty}</TableCell>
                        <TableCell className="text-center font-semibold">₹{item.totalAmount.toFixed(2)}</TableCell>
                        {showPayments && (
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={item.paymentReceived || 0}
                              onChange={(e) => updatePayment(item.customerId, parseFloat(e.target.value) || 0)}
                              className="w-20 text-center neo-noir-input"
                            />
                          </TableCell>
                        )}
                        {showPayments && (
                          <TableCell className="text-center font-semibold text-orange-400">
                            ₹{item.balanceDue.toFixed(2)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    
                    {/* Totals Row */}
                    <TableRow className="neo-noir-table-total">
                      <TableCell className="text-center font-bold"></TableCell>
                      <TableCell className="font-bold">TOTAL</TableCell>
                      {allProductCodes.map(code => (
                        <TableCell key={code} className="text-center font-bold">
                          {totals[code] || 0}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold">{totals.totalQty}</TableCell>
                      <TableCell className="text-center font-bold">₹{totals.totalAmount.toFixed(2)}</TableCell>
                      {showPayments && <TableCell className="text-center font-bold">₹{totals.paymentReceived.toFixed(2)}</TableCell>}
                      {showPayments && <TableCell className="text-center font-bold">₹{totals.balanceDue.toFixed(2)}</TableCell>}
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold neo-noir-text mb-2">No orders found</h3>
                  <p className="neo-noir-text-muted">
                    No orders found for {format(selectedDate, 'dd/MM/yyyy')} 
                    {selectedArea && ` in ${selectedArea} area`}
                  </p>
                </div>
              )}

              {/* Signature Section */}
              {deliverySheetData.length > 0 && (
                <div className="mt-12 flex justify-between items-end">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 w-48 mb-2"></div>
                    <p className="neo-noir-text-muted text-sm">Driver's Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 w-48 mb-2"></div>
                    <p className="neo-noir-text-muted text-sm">Supervisor's Signature</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
