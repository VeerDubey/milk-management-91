
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { Save, UserPlus } from 'lucide-react';

export default function VehicleSalesmanCreate() {
  const navigate = useNavigate();
  const { addSalesman, vehicles } = useData();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    vehicleId: '',
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prevState => ({
      ...prevState,
      isActive: checked,
    }));
  };

  const handleSubmitSalesman = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required");
      return;
    }
    
    addSalesman({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      isActive: formData.isActive,
      vehicleId: formData.vehicleId || undefined
    });
    
    toast.success("Salesman created successfully");
    navigate('/vehicle-salesman');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Salesman</h1>
          <p className="text-muted-foreground">Add a new salesman to the system</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Salesman Information</CardTitle>
          <CardDescription>Enter the details for the new salesman</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Salesman Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehicle</Label>
            <select
              id="vehicleId"
              name="vehicleId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.vehicleId}
              onChange={handleChange}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={handleSwitchChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmitSalesman}>
            <Save className="mr-2 h-4 w-4" />
            Add Salesman
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
