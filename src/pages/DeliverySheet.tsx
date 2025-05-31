
import React, { useState, useRef } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Download, FileSpreadsheet, Calendar, MapPin, Truck, Edit, Save, Plus, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadDeliverySheetPDF, printDeliverySheet, exportToExcel } from '@/utils/deliverySheetUtils';

interface DeliveryItem {
  customerName: string;
  GGH: number;
  GGH450: number;
  GTSF: number;
  GSD1KG: number;
  GPC: number;
  FL: number;
  totalQty: number;
  amount: number;
  totalPaid?: number;
  balanceDue?: number;
  paymentReceived?: number;
}

export default function DeliverySheet() {
  const { customers, vehicles, orders } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedArea, setSelectedArea] = useState('EICHER');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Enhanced delivery data with payment tracking
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([
    { 
      customerName: 'SHAMIM DAIRY', 
      GGH: 12, GGH450: 0, GTSF: 0, GSD1KG: 40, GPC: 0, FL: 0, 
      totalQty: 52, amount: 2784.00, totalPaid: 2000.00, balanceDue: 784.00, paymentReceived: 500.00 
    },
    { 
      customerName: 'INDIA DAIRY', 
      GGH: 8, GGH450: 15, GTSF: 25, GSD1KG: 12, GPC: 5, FL: 8, 
      totalQty: 73, amount: 3912.00, totalPaid: 3000.00, balanceDue: 912.00, paymentReceived: 800.00 
    },
    { 
      customerName: 'FRESH MILK CENTER', 
      GGH: 15, GGH450: 20, GTSF: 30, GSD1KG: 8, GPC: 3, FL: 6, 
      totalQty: 82, amount: 4396.00, totalPaid: 4000.00, balanceDue: 396.00, paymentReceived: 396.00 
    },
    { 
      customerName: 'ROYAL DAIRY', 
      GGH: 10, GGH450: 25, GTSF: 15, GSD1KG: 0, GPC: 2, FL: 5, 
      totalQty: 57, amount: 3057.00, totalPaid: 2500.00, balanceDue: 557.00, paymentReceived: 300.00 
    },
    { 
      customerName: 'GOLDEN MILK HOUSE', 
      GGH: 15, GGH450: 24, GTSF: 25, GSD1KG: 0, GPC: 2, FL: 5, 
      totalQty: 71, amount: 3807.00, totalPaid: 3500.00, balanceDue: 307.00, paymentReceived: 307.00 
    },
  ]);

  // Calculate totals
  const totals = {
    GGH: deliveryItems.reduce((sum, item) => sum + item.GGH, 0),
    GGH450: deliveryItems.reduce((sum, item) => sum + item.GGH450, 0),
    GTSF: deliveryItems.reduce((sum, item) => sum + item.GTSF, 0),
    GSD1KG: deliveryItems.reduce((sum, item) => sum + item.GSD1KG, 0),
    GPC: deliveryItems.reduce((sum, item) => sum + item.GPC, 0),
    FL: deliveryItems.reduce((sum, item) => sum + item.FL, 0),
    totalQty: deliveryItems.reduce((sum, item) => sum + item.totalQty, 0),
    amount: deliveryItems.reduce((sum, item) => sum + item.amount, 0),
    totalPaid: deliveryItems.reduce((sum, item) => sum + (item.totalPaid || 0), 0),
    balanceDue: deliveryItems.reduce((sum, item) => sum + (item.balanceDue || 0), 0),
    paymentReceived: deliveryItems.reduce((sum, item) => sum + (item.paymentReceived || 0), 0),
  };

  const updatePayment = (index: number, payment: number) => {
    const newItems = [...deliveryItems];
    newItems[index] = { 
      ...newItems[index], 
      paymentReceived: payment,
      balanceDue: newItems[index].amount - (newItems[index].totalPaid || 0) - payment
    };
    setDeliveryItems(newItems);
  };

  const handlePrint = () => {
    try {
      printDeliverySheet({
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedArea,
        items: deliveryItems,
        totals
      });
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to print delivery sheet');
    }
  };

  const handleDownloadPDF = () => {
    try {
      downloadDeliverySheetPDF({
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedArea,
        items: deliveryItems,
        totals
      });
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel({
        date: format(selectedDate, 'dd/MM/yyyy'),
        area: selectedArea,
        items: deliveryItems,
        totals
      });
      toast.success('Excel file exported successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold neo-noir-gradient-text">
              Delivery Sheet Management
            </h1>
            <p className="neo-noir-text-muted">
              Generate and manage delivery sheets with payment tracking
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Input
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  placeholder="Enter area"
                  className="neo-noir-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Vehicle</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
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
                    Area: {selectedArea}
                  </span>
                </div>
              </div>

              {/* Table */}
              <Table className="neo-noir-table">
                <TableHeader>
                  <TableRow className="neo-noir-table-header">
                    <TableHead className="text-center">S.NO</TableHead>
                    <TableHead>CUSTOMER NAME</TableHead>
                    <TableHead className="text-center">GGH</TableHead>
                    <TableHead className="text-center">GGH450</TableHead>
                    <TableHead className="text-center">GTSF</TableHead>
                    <TableHead className="text-center">GSD1KG</TableHead>
                    <TableHead className="text-center">GPC</TableHead>
                    <TableHead className="text-center">F&L</TableHead>
                    <TableHead className="text-center">QTY</TableHead>
                    <TableHead className="text-center">AMOUNT</TableHead>
                    {showPayments && <TableHead className="text-center">PAID</TableHead>}
                    {showPayments && <TableHead className="text-center">BALANCE</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryItems.map((item, index) => (
                    <TableRow key={index} className="neo-noir-table-row">
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.customerName}</TableCell>
                      <TableCell className="text-center">{item.GGH || ''}</TableCell>
                      <TableCell className="text-center">{item.GGH450 || ''}</TableCell>
                      <TableCell className="text-center">{item.GTSF || ''}</TableCell>
                      <TableCell className="text-center">{item.GSD1KG || ''}</TableCell>
                      <TableCell className="text-center">{item.GPC || ''}</TableCell>
                      <TableCell className="text-center">{item.FL || ''}</TableCell>
                      <TableCell className="text-center font-semibold">{item.totalQty}</TableCell>
                      <TableCell className="text-center font-semibold">₹{item.amount.toFixed(2)}</TableCell>
                      {showPayments && (
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={item.paymentReceived || 0}
                            onChange={(e) => updatePayment(index, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center neo-noir-input"
                          />
                        </TableCell>
                      )}
                      {showPayments && (
                        <TableCell className="text-center font-semibold text-orange-400">
                          ₹{(item.balanceDue || 0).toFixed(2)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  
                  {/* Totals Row */}
                  <TableRow className="neo-noir-table-total">
                    <TableCell className="text-center font-bold"></TableCell>
                    <TableCell className="font-bold">TOTAL</TableCell>
                    <TableCell className="text-center font-bold">{totals.GGH}</TableCell>
                    <TableCell className="text-center font-bold">{totals.GGH450}</TableCell>
                    <TableCell className="text-center font-bold">{totals.GTSF}</TableCell>
                    <TableCell className="text-center font-bold">{totals.GSD1KG}</TableCell>
                    <TableCell className="text-center font-bold">{totals.GPC}</TableCell>
                    <TableCell className="text-center font-bold">{totals.FL}</TableCell>
                    <TableCell className="text-center font-bold">{totals.totalQty}</TableCell>
                    <TableCell className="text-center font-bold">₹{totals.amount.toFixed(2)}</TableCell>
                    {showPayments && <TableCell className="text-center font-bold">₹{totals.paymentReceived.toFixed(2)}</TableCell>}
                    {showPayments && <TableCell className="text-center font-bold">₹{totals.balanceDue.toFixed(2)}</TableCell>}
                  </TableRow>
                </TableBody>
              </Table>

              {/* Signature Section */}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
