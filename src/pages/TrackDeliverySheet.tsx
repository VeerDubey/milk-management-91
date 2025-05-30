
import React, { useState, useRef } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Download, FileSpreadsheet, Calendar, MapPin, Truck, Plus, Save, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateDeliverySheetPDF, exportToExcel } from '@/utils/deliverySheetUtils';

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
  const { customers, vehicles, orders } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedArea, setSelectedArea] = useState('EICHER');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Mock delivery data based on orders
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([
    { customerName: 'SHAMIM DAIRY', GGH: 5, GGH450: 3, GTSF: 2, GSD1KG: 4, GPC: 1, FL: 6, totalQty: 21, amount: 1250.00 },
    { customerName: 'INDIA DAIRY', GGH: 8, GGH450: 2, GTSF: 5, GSD1KG: 3, GPC: 2, FL: 4, totalQty: 24, amount: 1450.00 },
    { customerName: 'FRESH MILK CENTER', GGH: 6, GGH450: 4, GTSF: 3, GSD1KG: 2, GPC: 3, FL: 5, totalQty: 23, amount: 1380.00 },
    { customerName: 'ROYAL DAIRY', GGH: 4, GGH450: 6, GTSF: 4, GSD1KG: 5, GPC: 2, FL: 3, totalQty: 24, amount: 1420.00 },
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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Track/Delivery Sheet</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                th { background-color: #f0f0f0; font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
                .signature-line { border-bottom: 2px solid #000; width: 200px; margin-bottom: 5px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        toast.success('Print dialog opened');
      }
    }
  };

  const handleDownloadPDF = () => {
    try {
      generateDeliverySheetPDF({
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

  const handleSaveSheet = () => {
    if (!sheetName.trim()) {
      toast.error('Please enter a sheet name');
      return;
    }
    
    // Save to localStorage or your data context
    const sheetData = {
      id: `sheet-${Date.now()}`,
      name: sheetName,
      date: format(selectedDate, 'dd/MM/yyyy'),
      area: selectedArea,
      vehicle: selectedVehicle,
      items: deliveryItems,
      totals,
      createdAt: new Date().toISOString()
    };
    
    const savedSheets = JSON.parse(localStorage.getItem('trackSheets') || '[]');
    savedSheets.push(sheetData);
    localStorage.setItem('trackSheets', JSON.stringify(savedSheets));
    
    toast.success('Track/Delivery sheet saved successfully');
    setSheetName('');
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
      amount: 0
    };
    setDeliveryItems([...deliveryItems, newItem]);
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
              Create, manage and print track/delivery sheets for milk distribution
            </p>
          </div>
          
          <div className="flex items-center gap-2">
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
            <CardTitle className="neo-noir-text">Sheet Configuration</CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Configure the track/delivery sheet parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="neo-noir-text">Sheet Name</Label>
                <Input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Enter sheet name"
                  className="neo-noir-input"
                />
              </div>
              
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
              
              <div className="space-y-2">
                <Label className="neo-noir-text">Actions</Label>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSheet} className="neo-noir-button-accent">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={addNewRow} variant="outline" className="neo-noir-button-outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Track/Delivery Sheet */}
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
