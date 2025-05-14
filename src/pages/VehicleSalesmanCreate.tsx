import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Car, Truck, Users } from 'lucide-react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';

const VehicleSalesmanCreate = () => {
  const { vehicles, addVehicle, salesmen, addSalesman } = useData();
  
  // Vehicle state
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleType, setVehicleType] = useState("truck");
  const [vehicleRegNumber, setVehicleRegNumber] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState<number>(0);
  const [vehicleIsActive, setVehicleIsActive] = useState(true);
  const [vehicleNotes, setVehicleNotes] = useState("");
  
  // Salesman state
  const [salesmanName, setSalesmanName] = useState("");
  const [salesmanPhone, setSalesmanPhone] = useState("");
  const [salesmanAddress, setSalesmanAddress] = useState("");
  const [salesmanVehicleId, setSalesmanVehicleId] = useState("");
  const [salesmanIsActive, setSalesmanIsActive] = useState(true);
  
  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!vehicleName || !vehicleNumber || !vehicleRegNumber) {
        toast.error("Please fill all required fields");
        return;
      }
      
      const parsedCapacity = Number(vehicleCapacity);
      if (isNaN(parsedCapacity) || parsedCapacity < 0) {
        toast.error("Please enter a valid capacity");
        return;
      }
      
      const newVehicle = {
        name: vehicleName,
        number: vehicleNumber,
        model: vehicleModel,
        type: vehicleType,
        regNumber: vehicleRegNumber,
        capacity: parsedCapacity,
        isActive: vehicleIsActive,
        notes: vehicleNotes
      };
      
      addVehicle(newVehicle);
      
      // Reset form
      setVehicleName("");
      setVehicleNumber("");
      setVehicleModel("");
      setVehicleType("truck");
      setVehicleRegNumber("");
      setVehicleCapacity(0);
      setVehicleIsActive(true);
      setVehicleNotes("");
      
      toast.success("Vehicle added successfully");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    }
  };
  
  const handleCreateSalesman = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!salesmanName || !salesmanPhone) {
        toast.error("Please fill all required fields");
        return;
      }
      
      const newSalesman = {
        name: salesmanName,
        phone: salesmanPhone,
        address: salesmanAddress,
        vehicleId: salesmanVehicleId,
        isActive: salesmanIsActive
      };
      
      addSalesman(newSalesman);
      
      // Reset form
      setSalesmanName("");
      setSalesmanPhone("");
      setSalesmanAddress("");
      setSalesmanVehicleId("");
      setSalesmanIsActive(true);
      
      toast.success("Salesman added successfully");
    } catch (error) {
      console.error("Error adding salesman:", error);
      toast.error("Failed to add salesman");
    }
  };
  
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicles & Salesmen</h1>
        <p className="text-muted-foreground">
          Manage your delivery vehicles and salesmen
        </p>
      </div>
      
      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="salesmen">Salesmen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Add New Vehicle
              </CardTitle>
              <CardDescription>
                Register a new delivery vehicle to the system
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateVehicle}>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-name">Vehicle Name</Label>
                    <Input 
                      id="vehicle-name" 
                      placeholder="Enter vehicle name" 
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-number">Vehicle Number</Label>
                    <Input 
                      id="vehicle-number" 
                      placeholder="Enter vehicle number" 
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-reg-number">Registration Number</Label>
                    <Input 
                      id="vehicle-reg-number" 
                      placeholder="E.g. MH02AB1234" 
                      value={vehicleRegNumber}
                      onChange={(e) => setVehicleRegNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-model">Model</Label>
                    <Input 
                      id="vehicle-model" 
                      placeholder="Enter model" 
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-type">Vehicle Type</Label>
                    <Select 
                      value={vehicleType} 
                      onValueChange={setVehicleType}
                    >
                      <SelectTrigger id="vehicle-type">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-capacity">Capacity (Liters)</Label>
                    <Input 
                      id="vehicle-capacity" 
                      type="number" 
                      min="0"
                      placeholder="Enter capacity" 
                      value={vehicleCapacity}
                      onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vehicle-active" className="cursor-pointer">Vehicle Active</Label>
                    <Switch 
                      id="vehicle-active" 
                      checked={vehicleIsActive}
                      onCheckedChange={setVehicleIsActive}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inactive vehicles won't appear in assignment lists
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicle-notes">Notes</Label>
                  <Textarea 
                    id="vehicle-notes" 
                    placeholder="Enter any additional notes about this vehicle"
                    value={vehicleNotes}
                    onChange={(e) => setVehicleNotes(e.target.value)} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button type="submit">Add Vehicle</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="salesmen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add New Salesman
              </CardTitle>
              <CardDescription>
                Register a new salesman or delivery person
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateSalesman}>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salesman-name">Name</Label>
                    <Input 
                      id="salesman-name" 
                      placeholder="Enter full name" 
                      value={salesmanName}
                      onChange={(e) => setSalesmanName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salesman-phone">Phone</Label>
                    <Input 
                      id="salesman-phone" 
                      placeholder="Enter phone number" 
                      value={salesmanPhone}
                      onChange={(e) => setSalesmanPhone(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salesman-address">Address</Label>
                  <Textarea 
                    id="salesman-address" 
                    placeholder="Enter address"
                    value={salesmanAddress}
                    onChange={(e) => setSalesmanAddress(e.target.value)}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salesman-vehicle">Assigned Vehicle</Label>
                    <Select 
                      value={salesmanVehicleId} 
                      onValueChange={setSalesmanVehicleId}
                    >
                      <SelectTrigger id="salesman-vehicle">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} ({vehicle.regNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mt-8">
                      <Label htmlFor="salesman-active" className="cursor-pointer">Active</Label>
                      <Switch 
                        id="salesman-active" 
                        checked={salesmanIsActive}
                        onCheckedChange={setSalesmanIsActive}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button type="submit">Add Salesman</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleSalesmanCreate;
