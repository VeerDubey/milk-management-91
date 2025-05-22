
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Truck, User } from 'lucide-react';

export default function VehicleSalesmanCreate() {
  const navigate = useNavigate();
  const { addVehicle, addSalesman } = useData();
  
  // Vehicle form state
  const [vehicleName, setVehicleName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [driverName, setDriverName] = useState('');
  const [isVehicleActive, setIsVehicleActive] = useState(true);
  
  // Salesman form state
  const [salesmanName, setSalesmanName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSalesmanActive, setIsSalesmanActive] = useState(true);
  
  // Handle vehicle form submission
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleName || !regNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newVehicle = {
      name: vehicleName,
      registrationNumber: regNumber,
      type: vehicleType,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      driver: driverName,
      isActive: isVehicleActive,
      createdAt: new Date().toISOString()
    };
    
    addVehicle(newVehicle);
    toast.success("Vehicle added successfully");
    
    // Reset form
    setVehicleName('');
    setRegNumber('');
    setVehicleType('');
    setCapacity('');
    setDriverName('');
    setIsVehicleActive(true);
  };
  
  // Handle salesman form submission
  const handleSalesmanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!salesmanName) {
      toast.error("Please enter salesman name");
      return;
    }
    
    const newSalesman = {
      name: salesmanName,
      contactNumber,
      email,
      isActive: isSalesmanActive,
      createdAt: new Date().toISOString()
    };
    
    addSalesman(newSalesman);
    toast.success("Salesman added successfully");
    
    // Reset form
    setSalesmanName('');
    setContactNumber('');
    setEmail('');
    setIsSalesmanActive(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Vehicle/Salesman</h1>
          <p className="text-muted-foreground">Add new delivery personnel and vehicles</p>
        </div>
        
        <Button variant="outline" onClick={() => navigate('/vehicle-tracking')}>
          Back to Vehicle Tracking
        </Button>
      </div>
      
      <Tabs defaultValue="vehicle" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicle" className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> 
            Add Vehicle
          </TabsTrigger>
          <TabsTrigger value="salesman" className="flex items-center gap-2">
            <User className="h-4 w-4" /> 
            Add Salesman
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicle">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-name">Vehicle Name *</Label>
                    <Input
                      id="vehicle-name"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-number">Registration Number *</Label>
                    <Input
                      id="reg-number"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-type">Vehicle Type</Label>
                    <Input
                      id="vehicle-type"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="driver-name">Driver Name</Label>
                  <Input
                    id="driver-name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vehicle-active"
                    checked={isVehicleActive}
                    onCheckedChange={setIsVehicleActive}
                  />
                  <Label htmlFor="vehicle-active">Active</Label>
                </div>
                
                <Button type="submit" className="w-full">
                  Add Vehicle
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="salesman">
          <Card>
            <CardHeader>
              <CardTitle>Salesman Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSalesmanSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salesman-name">Salesman Name *</Label>
                  <Input
                    id="salesman-name"
                    value={salesmanName}
                    onChange={(e) => setSalesmanName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-number">Contact Number</Label>
                    <Input
                      id="contact-number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="salesman-active"
                    checked={isSalesmanActive}
                    onCheckedChange={setIsSalesmanActive}
                  />
                  <Label htmlFor="salesman-active">Active</Label>
                </div>
                
                <Button type="submit" className="w-full">
                  Add Salesman
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
