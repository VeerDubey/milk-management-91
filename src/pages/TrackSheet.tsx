import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { FileText, Save, Plus, X, Printer } from 'lucide-react';
import { generateTrackSheetPdf, savePdf, getBlankRow } from '@/utils/trackSheetUtils';
import { TrackSheetRow } from '@/types';

export default function TrackSheet() {
  const navigate = useNavigate();
  const { 
    products, 
    customers, 
    vehicles, 
    salesmen,
    addTrackSheet
  } = useData();
  
  const [trackSheetName, setTrackSheetName] = useState('Track Sheet');
  const [trackSheetDate, setTrackSheetDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [routeName, setRouteName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Get active products for the track sheet
  const activeProducts = products.filter(product => product.isActive);
  // Just use names for simplicity
  const productNames = activeProducts.map(p => p.name);
  
  // Track sheet rows state with fixed typing
  const [rows, setRows] = useState<TrackSheetRow[]>(() => {
    // Initialize with empty rows for each customer
    return customers
      .filter(c => c.isActive)
      .map(customer => ({
        customerId: customer.id,
        name: customer.name,
        quantities: productNames.reduce((acc, name) => {
          acc[name] = '';
          return acc;
        }, {} as Record<string, string | number>),
        total: 0, // Explicitly setting as number
        amount: 0, // Explicitly setting as number
        products: productNames
      }));
  });
  
  // Update totals when quantities change with fixed typing
  const calculateRowTotals = (updatedRows: TrackSheetRow[]): TrackSheetRow[] => {
    return updatedRows.map(row => {
      const total = Object.values(row.quantities).reduce((sum, qty) => {
        // Fix for TS2365: Properly cast both operands to numbers before addition
        const numValue = typeof qty === 'string' ? (qty !== '' ? Number(qty) : 0) : Number(qty);
        const numSum = Number(sum); // Ensure sum is also a number
        return numSum + numValue;
      }, 0);
      
      // Explicitly returning all properties with proper types
      return {
        ...row,
        total: Number(total), // Ensure total is a number
        amount: Number(total) // Simplified, in reality you'd multiply by price
      };
    });
  };
  
  // Handle quantity change
  const handleQuantityChange = (rowIndex: number, productName: string, value: string) => {
    const newValue = value === '' ? '' : Number(value);
    
    setRows(prev => {
      const newRows = [...prev];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        quantities: {
          ...newRows[rowIndex].quantities,
          [productName]: newValue
        }
      };
      
      return calculateRowTotals(newRows);
    });
  };
  
  // Add blank row
  const addRow = () => {
    // Create a new blank row with the correct type
    const newRow: TrackSheetRow = {
      customerId: '',
      name: '',
      quantities: productNames.reduce((acc, name) => {
        acc[name] = '';
        return acc;
      }, {} as Record<string, string | number>),
      total: 0, // Explicitly as number
      amount: 0, // Explicitly as number
      products: productNames
    };
    
    setRows(prev => [...prev, newRow]);
  };
  
  // Remove row
  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveTrackSheet = () => {
    try {
      const trackSheetData = {
        name: trackSheetName,
        date: format(trackSheetDate, 'yyyy-MM-dd'),
        vehicleId: selectedVehicle,
        salesmanId: selectedSalesman,
        routeName: routeName,
        rows: rows.map(row => ({
          customerId: row.customerId,
          name: row.name,
          quantities: row.quantities,
          total: row.total,
          amount: row.amount
        })),
        notes: '',
        status: 'draft' as const,
        summary: {
          totalItems: rows.reduce((sum, row) => sum + row.total, 0),
          totalAmount: rows.reduce((sum, row) => sum + row.amount, 0),
          productTotals: {}
        }
      };
      
      addTrackSheet(trackSheetData);
      toast.success('Track sheet saved successfully!');
      setTrackSheetName('');
      setRows([]);
    } catch (error) {
      console.error('Error saving track sheet:', error);
      toast.error('Failed to save track sheet');
    }
  };
  
  // Print track sheet
  const printTrackSheet = () => {
    // Filter out empty rows
    const filteredRows = rows.filter(row => 
      Object.values(row.quantities).some(qty => qty !== '')
    );
    
    if (filteredRows.length === 0) {
      toast.error("No data to print");
      return;
    }
    
    const trackSheetData = {
      name: trackSheetName,
      date: format(trackSheetDate, 'yyyy-MM-dd'),
      vehicleId: selectedVehicle,
      salesmanId: selectedSalesman,
      routeName,
      rows: filteredRows,
      notes,
      // Add display names for UI
      vehicleName: vehicles.find(v => v.id === selectedVehicle)?.name,
      salesmanName: salesmen.find(s => s.id === selectedSalesman)?.name
    };
    
    const doc = generateTrackSheetPdf(trackSheetData, productNames, customers);
    doc.autoPrint();
    savePdf(doc, `tracksheet-${format(trackSheetDate, 'yyyy-MM-dd')}.pdf`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Sheet</h1>
          <p className="text-muted-foreground">Create and manage track sheets for delivery routes</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveTrackSheet}>
            <Save className="mr-2 h-4 w-4" />
            Save Track Sheet
          </Button>
          <Button variant="outline" onClick={printTrackSheet}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Track Sheet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={trackSheetName} 
                onChange={(e) => setTrackSheetName(e.target.value)} 
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
                <SelectTrigger>
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
                <SelectTrigger>
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
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Quantities</CardTitle>
          <Button size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Fixed Customer Column Container */}
            <div className="flex">
              {/* Locked Customer Column */}
              <div className="bg-background border-r border-border shadow-lg z-10" style={{ minWidth: '200px' }}>
                <div className="border-b bg-muted/50">
                  <div className="p-3 font-medium text-left">Customer</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {rows.map((row, rowIndex) => (
                    <div key={`customer-${rowIndex}`} className="border-b border-border p-3 bg-background">
                      <span className="font-medium text-primary">{row.name}</span>
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground">
                      No customers
                    </div>
                  )}
                </div>
              </div>
              
              {/* Scrollable Products and Data Area */}
              <div className="flex-1 overflow-x-auto">
                <div className="min-w-max">
                  {/* Header for scrollable area */}
                  <div className="border-b bg-muted/50 flex">
                    {productNames.map(name => (
                      <div key={name} className="p-3 text-center font-medium border-r border-border" style={{ minWidth: '120px' }}>
                        {name}
                      </div>
                    ))}
                    <div className="p-3 text-center font-medium border-r border-border" style={{ minWidth: '80px' }}>
                      Total
                    </div>
                    <div className="p-3 text-center font-medium" style={{ minWidth: '100px' }}>
                      Actions
                    </div>
                  </div>
                  
                  {/* Data rows for scrollable area */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {rows.map((row, rowIndex) => (
                      <div key={`data-${rowIndex}`} className="border-b border-border flex">
                        {productNames.map(name => (
                          <div key={name} className="p-2 border-r border-border" style={{ minWidth: '120px' }}>
                            <Input 
                              type="text"
                              value={row.quantities[name]}
                              onChange={(e) => handleQuantityChange(rowIndex, name, e.target.value)}
                              className="w-full text-center h-8"
                              placeholder="0"
                            />
                          </div>
                        ))}
                        <div className="p-3 text-center border-r border-border font-semibold text-primary" style={{ minWidth: '80px' }}>
                          {row.total}
                        </div>
                        <div className="p-2 text-center" style={{ minWidth: '100px' }}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeRow(rowIndex)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {rows.length === 0 && (
                      <div className="flex">
                        <div className="p-8 text-center text-muted-foreground" style={{ minWidth: `${productNames.length * 120 + 180}px` }}>
                          No customers added. Click 'Add Row' to add customers.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Horizontal Scroll Indicator */}
            {productNames.length > 4 && (
              <div className="mt-2 text-xs text-muted-foreground text-center">
                ← Scroll horizontally to view all products →
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
