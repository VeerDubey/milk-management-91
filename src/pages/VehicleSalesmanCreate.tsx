
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SalesmanCreateData, VehicleCreateData } from '@/contexts/data/useVehicleSalesmanState';

import { 
  Truck, 
  User,
  Phone, 
  Calendar, 
  Mail,
  MapPin, 
  ClipboardCheck,
  Clock
} from 'lucide-react';

export default function VehicleSalesmanCreate() {
  const navigate = useNavigate();
  const { addVehicle, addSalesman } = useData();
  const [activeTab, setActiveTab] = useState('vehicle');
  
  // Vehicle form
  const {
    register: registerVehicle,
    handleSubmit: handleVehicleSubmit,
    formState: { errors: vehicleErrors },
    reset: resetVehicle,
    setValue: setVehicleValue,
    watch: watchVehicle
  } = useForm<VehicleCreateData>({
    defaultValues: {
      registrationNumber: '',
      model: '',
      type: '',
      capacity: 0,
      status: 'Available'
    }
  });
  
  // Salesman form
  const {
    register: registerSalesman,
    handleSubmit: handleSalesmanSubmit,
    formState: { errors: salesmanErrors },
    reset: resetSalesman,
    setValue: setSalesmanValue,
    watch: watchSalesman
  } = useForm<SalesmanCreateData>({
    defaultValues: {
      name: '',
      contactNumber: '',
      joiningDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Active'
    }
  });
  
  // Handle vehicle form submission
  const onVehicleSubmit = handleVehicleSubmit(async (data) => {
    try {
      await addVehicle(data);
      toast.success(`Vehicle ${data.registrationNumber} added successfully`);
      resetVehicle();
      
      // Option to add another or go to list
      const wantToAddAnother = window.confirm('Vehicle added successfully. Do you want to add another vehicle?');
      if (!wantToAddAnother) {
        navigate('/vehicle-tracking');
      }
      
    } catch (error) {
      toast.error('Failed to add vehicle');
      console.error(error);
    }
  });
  
  // Handle salesman form submission
  const onSalesmanSubmit = handleSalesmanSubmit(async (data) => {
    try {
      await addSalesman(data);
      toast.success(`Salesman ${data.name} added successfully`);
      resetSalesman();
      
      // Option to add another or go to list
      const wantToAddAnother = window.confirm('Salesman added successfully. Do you want to add another salesman?');
      if (!wantToAddAnother) {
        navigate('/vehicle-tracking');
      }
      
    } catch (error) {
      toast.error('Failed to add salesman');
      console.error(error);
    }
  });
  
  // Handle date change for salesman joining date
  const handleJoiningDateChange = (date: Date | undefined) => {
    if (date) {
      setSalesmanValue('joiningDate', format(date, 'yyyy-MM-dd'));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Resources</h1>
          <p className="text-muted-foreground">
            Add new vehicles and salesmen to your system
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vehicle" className="flex items-center">
            <Truck className="mr-2 h-4 w-4" />
            Add Vehicle
          </TabsTrigger>
          <TabsTrigger value="salesman" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Add Salesman
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicle" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Vehicle</CardTitle>
              <CardDescription>
                Enter the details of the vehicle to add to the system
              </CardDescription>
            </CardHeader>
            <form onSubmit={onVehicleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number*</Label>
                    <Input 
                      id="registrationNumber"
                      placeholder="KA01AB1234"
                      {...registerVehicle('registrationNumber', { required: true })}
                    />
                    {vehicleErrors.registrationNumber && <p className="text-sm text-red-500">Registration number is required</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model*</Label>
                    <Input 
                      id="model"
                      placeholder="Tata Ace"
                      {...registerVehicle('model', { required: true })}
                    />
                    {vehicleErrors.model && <p className="text-sm text-red-500">Model is required</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type*</Label>
                    <Select 
                      onValueChange={(value) => setVehicleValue('type', value)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mini Van">Mini Van</SelectItem>
                        <SelectItem value="Pickup Truck">Pickup Truck</SelectItem>
                        <SelectItem value="Delivery Van">Delivery Van</SelectItem>
                        <SelectItem value="Refrigerated Truck">Refrigerated Truck</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {vehicleErrors.type && <p className="text-sm text-red-500">Type is required</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Liters)*</Label>
                    <Input 
                      id="capacity"
                      type="number"
                      placeholder="500"
                      {...registerVehicle('capacity', { 
                        required: true, 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Capacity must be positive' } 
                      })}
                    />
                    {vehicleErrors.capacity && (
                      <p className="text-sm text-red-500">
                        {vehicleErrors.capacity.type === 'required' ? 'Capacity is required' : vehicleErrors.capacity.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input 
                      id="driverName"
                      placeholder="John Doe"
                      {...registerVehicle('driverName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverContactNumber">Driver Contact Number</Label>
                    <Input 
                      id="driverContactNumber"
                      placeholder="+91 98765 43210"
                      {...registerVehicle('driverContactNumber')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status*</Label>
                  <Select 
                    onValueChange={(value) => setVehicleValue('status', value as 'Available' | 'In Use' | 'Under Maintenance')}
                    defaultValue="Available"
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="In Use">In Use</SelectItem>
                      <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Additional information about the vehicle"
                    className="min-h-[100px]"
                    {...registerVehicle('notes')}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => navigate('/vehicle-tracking')}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Truck className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="salesman" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Salesman</CardTitle>
              <CardDescription>
                Enter the details of the salesman to add to the system
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSalesmanSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name*</Label>
                    <Input 
                      id="name"
                      placeholder="John Doe"
                      {...registerSalesman('name', { required: true })}
                    />
                    {salesmanErrors.name && <p className="text-sm text-red-500">Name is required</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number*</Label>
                    <Input 
                      id="contactNumber"
                      placeholder="+91 98765 43210"
                      {...registerSalesman('contactNumber', { required: true })}
                    />
                    {salesmanErrors.contactNumber && <p className="text-sm text-red-500">Contact number is required</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      {...registerSalesman('email')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date*</Label>
                    <div className="flex">
                      <DatePicker 
                        date={watchSalesman('joiningDate') ? new Date(watchSalesman('joiningDate')) : undefined} 
                        onSelect={handleJoiningDateChange} 
                      />
                    </div>
                    {salesmanErrors.joiningDate && <p className="text-sm text-red-500">Joining date is required</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status*</Label>
                    <Select 
                      onValueChange={(value) => setSalesmanValue('status', value as 'Active' | 'Inactive' | 'On Leave')}
                      defaultValue="Active"
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Monthly Target (₹)</Label>
                    <Input 
                      id="targetAmount"
                      type="number"
                      placeholder="50000"
                      {...registerSalesman('targetAmount', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Target must be positive' } 
                      })}
                    />
                    {salesmanErrors.targetAmount && (
                      <p className="text-sm text-red-500">{salesmanErrors.targetAmount.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <Input 
                      id="commission"
                      type="number"
                      placeholder="5"
                      {...registerSalesman('commission', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Commission must be positive' },
                        max: { value: 100, message: 'Commission cannot exceed 100%' }
                      })}
                    />
                    {salesmanErrors.commission && (
                      <p className="text-sm text-red-500">{salesmanErrors.commission.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address"
                      placeholder="123 Main St, City"
                      {...registerSalesman('address')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Additional information about the salesman"
                    className="min-h-[100px]"
                    {...registerSalesman('notes')}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => navigate('/vehicle-tracking')}>
                  Cancel
                </Button>
                <Button type="submit">
                  <User className="mr-2 h-4 w-4" />
                  Add Salesman
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
