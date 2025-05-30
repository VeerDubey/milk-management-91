
import React, { useState, useRef } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Download, FileSpreadsheet, Calendar, MapPin, Truck, FileText, Plus, Trash2 } from 'lucide-react';
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
}

export default function TrackDeliverySheet() {
  const { customers, vehicles } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedArea, setSelectedArea] = useState('EICHER');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Enhanced delivery data with more realistic entries
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([
    { customerName: 'SHAMIM DAIRY', GGH: 5, GGH450: 3, GTSF: 2, GSD1KG: 4, GPC: 1, FL: 6, totalQty: 21, amount: 1250.00 },
    { customerName: 'INDIA DAIRY', GGH: 8, GGH450: 2, GTSF: 5, GSD1KG: 3, GPC: 2, FL: 4, totalQty: 24, amount: 1450.00 },
    { customerName: 'FRESH MILK CENTER', GGH: 6, GGH450: 4, GTSF: 3, GSD1KG: 2, GPC: 3, FL: 5, totalQty: 23, amount: 1380.00 },
    { customerName: 'ROYAL DAIRY', GGH: 4, GGH450: 6, GTSF: 4, GSD1KG: 5, GPC: 2, FL: 3, totalQty: 24, amount: 1420.00 },
    { customerName: 'GOLDEN MILK HOUSE', GGH: 7, GGH450: 3, GTSF: 6, GSD1KG: 4, GPC: 1, FL: 2, totalQty: 23, amount: 1380.00 },
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
  };

  const addNewRow = () => {
    const newItem: DeliveryItem = {
      customerName: '',
      GGH: 0,
      GGH450: 0,
      GTSF: 0,
      GSD1KG: 0,
      GPC: 0,
      FL: 0,
      totalQty: 0,
      amount: 0,
    };
    setDeliveryItems([...deliveryItems, newItem]);
  };

  const removeRow = (index: number) => {
    const newItems = deliveryItems.filter((_, i) => i !== index);
    setDeliveryItems(newItems);
  };

  const updateItem = (index: number, field: keyof DeliveryItem, value: string | number) => {
    const newItems = [...deliveryItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate totals for the row
    if (field !== 'customerName' && field !== 'totalQty' && field !== 'amount') {
      const item = newItems[index];
      item.totalQty = item.GGH + item.GGH450 + item.GTSF + item.GSD1KG + item.GPC + item.FL;
      item.amount = item.totalQty * 60; // Assuming ₹60 per unit
    }
    
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
              Track & Delivery Sheet
            </h1>
            <p className="neo-noir-text-muted">
              Manage delivery tracking and generate printable delivery sheets
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsEditMode(!isEditMode)} 
              variant="outline" 
              className="neo-noir-button-outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isEditMode ? 'View Mode' : 'Edit Mode'}
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
              Configure the delivery sheet parameters
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

              {isEditMode && (
                <div className="space-y-2">
                  <Label className="neo-noir-text">Actions</Label>
                  <Button onClick={addNewRow} className="w-full neo-noir-button-accent">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Row
                  </Button>
                </div>
              )}
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
                    {isEditMode && <TableHead className="text-center">ACTIONS</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryItems.map((item, index) => (
                    <TableRow key={index} className="neo-noir-table-row">
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <Input
                            value={item.customerName}
                            onChange={(e) => updateItem(index, 'customerName', e.target.value)}
                            className="neo-noir-input"
                          />
                        ) : (
                          <span className="font-medium">{item.customerName}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={item.GGH}
                            onChange={(e) => updateItem(index, 'GGH', parseInt(e.target.value) || 0)}
                            className="neo-noir-input w-16"
                          />
                        ) : (
                          item.GGH || ''
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={item.GGH450}
                            onChange={(e) => updateItem(index, 'GGH450', parseInt(e.target.value) || 0)}
                            className="neo-noir-input w-16"
                          />
                        ) : (
                          item.GGH450 || ''
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={item.GTSF}
                            onChange={(e) => updateItem(index, 'GTSF', parseInt(e.target.value) || 0)}
                            className="neo-noir-input w-16"
                          />
                        ) : (
                          item.GTSF || ''
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={item.GSD1KG}
                            onChange={(e) => updateItem(index, 'GSD1KG', parseInt(e.target.value) || 0)}
                            className="neo-noir-input w-16"
                          />
                        ) : (
                          item.GSD1KG || ''
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={item.GPC}
                            onChange={(e) => updateItem(index, 'GPC', parseInt(e.target.value) || 0)}
                            className="neo-noir-input w-16"
                          />
                        ) : (
                          item.GPC || ''
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={item.FL}
                            onChange={(e) => updateItem(index, 'FL', parseInt(e.target.value) || 0)}
                            className="neo-noir-input w-16"
                          />
                        ) : (
                          item.FL || ''
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold">{item.totalQty}</TableCell>
                      <TableCell className="text-center font-semibold">₹{item.amount.toFixed(2)}</TableCell>
                      {isEditMode && (
                        <TableCell className="text-center">
                          <Button
                            onClick={() => removeRow(index)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                    {isEditMode && <TableCell></TableCell>}
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
