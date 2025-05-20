
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Customer, Vehicle, Salesman } from '@/types';
import { ChevronRight, ChevronLeft, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleAssignmentProps {
  vehicles: Vehicle[];
  salesmen: Salesman[];
  customers: Customer[];
  onGenerateTrackSheet: (vehicleId: string, salesmanId: string, customers: Customer[]) => void;
}

export function VehicleAssignment({ vehicles, salesmen, customers, onGenerateTrackSheet }: VehicleAssignmentProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedSalesman, setSelectedSalesman] = useState<string>('');
  const [vehicleCustomers, setVehicleCustomers] = useState<Record<string, string[]>>({});
  const [deliveryTimes, setDeliveryTimes] = useState<Record<string, string>>({});
  const [deliveryNotes, setDeliveryNotes] = useState<Record<string, string>>({});
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>(customers.filter(c => c.isActive));

  // Update available customers when vehicle selection changes
  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    
    // If there are already customers assigned to this vehicle, remove them from available list
    const assigned = vehicleCustomers[vehicleId] || [];
    const available = customers.filter(c => c.isActive && !assigned.includes(c.id));
    setAvailableCustomers(available);
    
    // Auto-select a salesman if associated with this vehicle
    const associatedSalesman = salesmen.find(s => s.vehicleId === vehicleId);
    if (associatedSalesman) {
      setSelectedSalesman(associatedSalesman.id);
    } else {
      setSelectedSalesman('');
    }
  };
  
  // Add a customer to the selected vehicle
  const addCustomerToVehicle = (customerId: string) => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle first");
      return;
    }
    
    setVehicleCustomers(prev => {
      const vehicleAssignments = prev[selectedVehicle] || [];
      if (vehicleAssignments.includes(customerId)) {
        return prev;
      }
      return {
        ...prev,
        [selectedVehicle]: [...vehicleAssignments, customerId]
      };
    });
    
    // Update available customers
    setAvailableCustomers(prev => prev.filter(c => c.id !== customerId));
  };
  
  // Remove a customer from the selected vehicle
  const removeCustomerFromVehicle = (customerId: string) => {
    if (!selectedVehicle) return;
    
    setVehicleCustomers(prev => {
      const vehicleAssignments = prev[selectedVehicle] || [];
      return {
        ...prev,
        [selectedVehicle]: vehicleAssignments.filter(id => id !== customerId)
      };
    });
    
    // Update available customers
    const customer = customers.find(c => c.id === customerId);
    if (customer && customer.isActive) {
      setAvailableCustomers(prev => [...prev, customer]);
    }
  };
  
  // Update delivery time for a customer
  const updateDeliveryTime = (customerId: string, time: string) => {
    setDeliveryTimes(prev => ({
      ...prev,
      [customerId]: time
    }));
  };
  
  // Update delivery notes for a customer
  const updateDeliveryNotes = (customerId: string, notes: string) => {
    setDeliveryNotes(prev => ({
      ...prev,
      [customerId]: notes
    }));
  };
  
  // Generate track sheet for selected vehicle
  const generateTrackSheet = () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return;
    }
    
    const assignedCustomerIds = vehicleCustomers[selectedVehicle] || [];
    if (assignedCustomerIds.length === 0) {
      toast.error("No customers assigned to this vehicle");
      return;
    }
    
    const assignedCustomers = customers.filter(c => assignedCustomerIds.includes(c.id))
      .map(c => ({
        ...c,
        deliveryTime: deliveryTimes[c.id] || '',
        deliveryNotes: deliveryNotes[c.id] || ''
      }));
    
    onGenerateTrackSheet(selectedVehicle, selectedSalesman, assignedCustomers);
    toast.success("Track sheet generated successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle & Customer Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle">Select Vehicle</Label>
            <Select value={selectedVehicle} onValueChange={handleVehicleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.filter(v => v.isActive).map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.registrationNumber}
                    {vehicle.capacity ? ` (Capacity: ${vehicle.capacity})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salesman">Select Salesman</Label>
            <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
              <SelectTrigger>
                <SelectValue placeholder="Select Salesman" />
              </SelectTrigger>
              <SelectContent>
                {salesmen.filter(s => s.isActive).map(salesman => (
                  <SelectItem key={salesman.id} value={salesman.id}>
                    {salesman.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Available Customers</h3>
            <div className="border rounded-md max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No available customers
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableCustomers.map(customer => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.area || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => addCustomerToVehicle(customer.id)}
                            disabled={!selectedVehicle}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Assigned Customers</h3>
            <div className="border rounded-md max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Delivery Time</span>
                      </div>
                    </TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedVehicle || (vehicleCustomers[selectedVehicle]?.length || 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        {!selectedVehicle 
                          ? 'Select a vehicle to see assigned customers' 
                          : 'No customers assigned to this vehicle'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (vehicleCustomers[selectedVehicle] || []).map((customerId, index) => {
                      const customer = customers.find(c => c.id === customerId);
                      if (!customer) return null;
                      
                      return (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeCustomerFromVehicle(customer.id)}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={deliveryTimes[customer.id] || ''}
                              onChange={(e) => updateDeliveryTime(customer.id, e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Delivery notes"
                              value={deliveryNotes[customer.id] || ''}
                              onChange={(e) => updateDeliveryNotes(customer.id, e.target.value)}
                              className="w-full"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            onClick={generateTrackSheet}
            disabled={!selectedVehicle || (vehicleCustomers[selectedVehicle]?.length || 0) === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Track Sheet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
