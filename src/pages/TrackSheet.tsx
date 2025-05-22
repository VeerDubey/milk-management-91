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
  
  // Track sheet rows state
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
        total: 0,
        amount: 0,
        products: productNames
      }));
  });
  
  // Update totals when quantities change
  const calculateRowTotals = (updatedRows: TrackSheetRow[]): TrackSheetRow[] => {
    return updatedRows.map(row => {
      const total = Object.values(row.quantities).reduce((sum, qty) => {
        // Convert to number before addition
        const numValue = qty !== '' ? Number(qty) : 0;
        return sum + numValue;
      }, 0);
      
      // You might want to calculate amounts based on product prices later
      return {
        ...row,
        total,
        amount: total // Simplified, in reality you'd multiply by price
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
      total: 0,
      amount: 0,
      products: productNames
    };
    
    setRows(prev => [...prev, newRow]);
  };
  
  // Remove row
  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };
  
  // Save track sheet
  const saveTrackSheet = () => {
    if (!trackSheetDate) {
      toast.error("Please select a date");
      return;
    }
    
    const trackSheetData = {
      name: trackSheetName,
      date: format(trackSheetDate, 'yyyy-MM-dd'),
      vehicleId: selectedVehicle,
      salesmanId: selectedSalesman,
      routeName,
      rows,
      notes
    };
    
    const result = addTrackSheet(trackSheetData);
    
    if (result) {
      toast.success("Track sheet saved successfully");
      navigate('/track-sheet-history');
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
          <Button onClick={saveTrackSheet}>
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Customer</th>
                  {productNames.map(name => (
                    <th key={name} className="text-center p-2">{name}</th>
                  ))}
                  <th className="text-center p-2">Total</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    <td className="p-2">{row.name}</td>
                    {productNames.map(name => (
                      <td key={name} className="p-2">
                        <Input 
                          type="text"
                          value={row.quantities[name]}
                          onChange={(e) => handleQuantityChange(rowIndex, name, e.target.value)}
                          className="w-16 text-center"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">{row.total}</td>
                    <td className="p-2 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeRow(rowIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={productNames.length + 3} className="text-center p-4">
                      No customers added. Click 'Add Row' to add customers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
