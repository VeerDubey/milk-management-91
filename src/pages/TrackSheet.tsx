
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrackSheetAnalytics } from '@/components/track-sheet/TrackSheetAnalytics';
import { TrackSheet as TrackSheetType, TrackSheetRow } from '@/types';
import { SaveTemplateDialog } from '@/components/track-sheet/SaveTemplateDialog';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export default function TrackSheet() {
  const { products, vehicles, salesmen, customers, addTrackSheet } = useData();
  const [activeTab, setActiveTab] = useState<'sheet' | 'analytics'>('sheet');
  const [trackSheetDate, setTrackSheetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedSalesman, setSelectedSalesman] = useState<string>('');
  const [routeName, setRouteName] = useState<string>('');
  const [rows, setRows] = useState<TrackSheetRow[]>([]);
  const [activeCustomers, setActiveCustomers] = useState<string[]>([]);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);

  const activeProductNames = products.filter(p => p.isActive).map(p => p.name);
  
  // Initialize rows with active customers
  useEffect(() => {
    const activeCustomersList = customers.filter(c => c.isActive).map(c => c.name);
    setActiveCustomers(activeCustomersList);
    
    if (activeCustomersList.length > 0 && rows.length === 0) {
      const initialRows = activeCustomersList.map(name => ({
        name,
        customerName: name,
        customerId: customers.find(c => c.name === name)?.id || '',
        quantities: activeProductNames.reduce((acc, productName) => {
          acc[productName] = '';
          return acc;
        }, {} as Record<string, string | number>),
        total: 0,
        amount: 0,
        products: activeProductNames
      }));
      setRows(initialRows);
    }
  }, [customers, products]);

  const handleQuantityChange = (customerName: string, productName: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    setRows(prevRows => 
      prevRows.map(row => {
        if (row.name === customerName) {
          const updatedQuantities = { 
            ...row.quantities,
            [productName]: value 
          };
          
          // Calculate total quantity for this row
          const total = Object.values(updatedQuantities).reduce((sum, val) => {
            const qty = val === '' ? 0 : typeof val === 'string' ? parseInt(val, 10) : val;
            return sum + (isNaN(qty) ? 0 : qty);
          }, 0);
          
          // For now, set amount equal to quantity - in a real app this would involve pricing
          const amount = total; // Placeholder - real app would calculate based on prices
          
          return {
            ...row,
            quantities: updatedQuantities,
            total,
            amount
          };
        }
        return row;
      })
    );
  };

  const addEmptyRow = () => {
    const newRow: TrackSheetRow = {
      name: '',
      customerName: '',
      customerId: '',
      quantities: activeProductNames.reduce((acc, productName) => {
        acc[productName] = '';
        return acc;
      }, {} as Record<string, string | number>),
      total: 0,
      amount: 0,
      products: activeProductNames
    };
    setRows([...rows, newRow]);
  };

  const updateRowCustomer = (index: number, customerName: string) => {
    setRows(prevRows => 
      prevRows.map((row, i) => {
        if (i === index) {
          const customer = customers.find(c => c.name === customerName);
          return {
            ...row,
            name: customerName,
            customerName: customerName,
            customerId: customer?.id || ''
          };
        }
        return row;
      })
    );
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSaveTrackSheet = () => {
    if (!trackSheetDate) {
      toast.error("Please select a date");
      return;
    }
    
    const trackSheet: Omit<TrackSheetType, 'id'> = {
      date: trackSheetDate,
      vehicleId: selectedVehicle || undefined,
      salesmanId: selectedSalesman || undefined,
      routeName: routeName || undefined,
      name: `Track Sheet - ${trackSheetDate}`,
      rows: rows.filter(r => r.name),
      createdAt: new Date().toISOString()
    };
    
    addTrackSheet(trackSheet);
    toast.success("Track sheet saved successfully");
    
    // Reset form
    setTrackSheetDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedVehicle('');
    setSelectedSalesman('');
    setRouteName('');
  };
  
  const handleGeneratePdf = () => {
    // This would be implemented in a real app
    toast.info("PDF generation feature would be implemented here");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Sheet</h1>
          <p className="text-muted-foreground">Create and manage daily delivery track sheets</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'sheet' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('sheet')}
          >
            Sheet
          </Button>
          <Button 
            variant={activeTab === 'analytics' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </Button>
        </div>
      </div>
      
      {activeTab === 'sheet' ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Track Sheet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={trackSheetDate} 
                    onChange={(e) => setTrackSheetDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.registrationNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesman">Salesman</Label>
                  <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Salesman" />
                    </SelectTrigger>
                    <SelectContent>
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
                    placeholder="Morning Route" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products Distribution</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setIsSaveTemplateOpen(true)} variant="outline">Save as Template</Button>
                <Button onClick={handleGeneratePdf} variant="outline">Generate PDF</Button>
                <Button onClick={addEmptyRow}>Add Custom Entry</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Customer</th>
                      {activeProductNames.map(product => (
                        <th key={product} className="px-4 py-2 text-center">{product}</th>
                      ))}
                      <th className="px-4 py-2 text-center">Total</th>
                      <th className="px-4 py-2 text-center">Amount</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          {row.name ? (
                            row.name
                          ) : (
                            <Select onValueChange={(value) => updateRowCustomer(index, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeCustomers.map(customer => (
                                  <SelectItem key={customer} value={customer}>
                                    {customer}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        {activeProductNames.map(product => (
                          <td key={product} className="px-4 py-2">
                            <Input
                              type="number"
                              className="text-center"
                              value={row.quantities[product] || ''}
                              onChange={(e) => handleQuantityChange(row.name, product, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center">{row.total}</td>
                        <td className="px-4 py-2 text-center">₹{row.amount}</td>
                        <td className="px-4 py-2 text-center">
                          <Button variant="ghost" size="sm" onClick={() => removeRow(index)}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="px-4 py-2 font-bold">Total</td>
                      {activeProductNames.map(product => {
                        const productTotal = rows.reduce((sum, row) => {
                          const qty = row.quantities[product];
                          return sum + (qty === '' ? 0 : typeof qty === 'string' ? parseInt(qty, 10) : qty || 0);
                        }, 0);
                        return (
                          <td key={product} className="px-4 py-2 text-center font-bold">{productTotal}</td>
                        );
                      })}
                      <td className="px-4 py-2 text-center font-bold">
                        {rows.reduce((sum, row) => sum + row.total, 0)}
                      </td>
                      <td className="px-4 py-2 text-center font-bold">
                        ₹{rows.reduce((sum, row) => sum + row.amount, 0)}
                      </td>
                      <td className="px-4 py-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveTrackSheet}>Save Track Sheet</Button>
              </div>
            </CardContent>
          </Card>
          
          <SaveTemplateDialog 
            open={isSaveTemplateOpen} 
            onOpenChange={setIsSaveTemplateOpen}
            rows={rows}
          />
        </div>
      ) : (
        <TrackSheetAnalytics rows={rows} products={activeProductNames} />
      )}
    </div>
  );
}
