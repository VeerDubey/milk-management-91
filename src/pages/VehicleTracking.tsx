
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Vehicle, Salesman } from '@/types'; // Import needed types

export default function VehicleTracking() {
  const { vehicles, salesmen, addVehicle, updateVehicle, deleteVehicle } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    type: '',
    driverName: '',
    isActive: true,
    capacity: 0
  });
  
  const handleAddVehicle = () => {
    if (!formData.name || !formData.registrationNumber) {
      toast.error('Name and registration number are required');
      return;
    }
    
    // Add vehicle with the correct properties according to the Vehicle interface
    addVehicle({
      name: formData.name,
      registrationNumber: formData.registrationNumber,
      type: formData.type,
      driverName: formData.driverName || undefined,
      isActive: formData.isActive,
      capacity: formData.capacity || undefined,
      description: '' // Add a default empty description
    });
    
    // Reset form
    setFormData({
      name: '',
      registrationNumber: '',
      type: '',
      driverName: '',
      isActive: true,
      capacity: 0
    });
    
    setIsAddDialogOpen(false);
    toast.success('Vehicle added successfully');
  };
  
  const handleEditVehicle = () => {
    if (!selectedVehicle) return;
    
    // Update vehicle with the correct properties
    updateVehicle(selectedVehicle, {
      name: formData.name,
      registrationNumber: formData.registrationNumber,
      type: formData.type,
      driverName: formData.driverName,
      isActive: formData.isActive,
      capacity: formData.capacity
    });
    
    setIsEditDialogOpen(false);
    toast.success('Vehicle updated successfully');
  };
  
  const handleDeleteVehicle = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id);
      toast.success('Vehicle deleted successfully');
    }
  };
  
  const openEditDialog = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    
    setSelectedVehicle(id);
    setFormData({
      name: vehicle.name,
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      driverName: vehicle.driverName || '',
      isActive: vehicle.isActive,
      capacity: vehicle.capacity || 0
    });
    
    setIsEditDialogOpen(true);
  };
  
  const getAssignedDriver = (vehicleId: string) => {
    // Find a salesman that has this vehicle ID
    const assignedSalesman = salesmen.find(s => s.vehicleId === vehicleId);
    return assignedSalesman?.name || 'Unassigned';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Tracking</h1>
          <p className="text-muted-foreground">Manage your vehicles and track their details</p>
        </div>
        <div>
          <Button onClick={() => {
            setFormData({
              name: '',
              registrationNumber: '',
              type: '',
              driverName: '',
              isActive: true,
              capacity: 0
            });
            setIsAddDialogOpen(true);
          }}>
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle List</CardTitle>
          <CardDescription>All vehicles in the fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Registration Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.registrationNumber}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>{vehicle.driverName || getAssignedDriver(vehicle.id)}</TableCell>
                    <TableCell>{vehicle.capacity || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        vehicle.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(vehicle.id)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No vehicles found. Add a vehicle to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Vehicle Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input 
                id="registrationNumber" 
                value={formData.registrationNumber} 
                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} 
                placeholder="MH02AB1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <Input 
                id="type" 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})} 
                placeholder="Van, Truck, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name</Label>
              <Input 
                id="driverName" 
                value={formData.driverName} 
                onChange={(e) => setFormData({...formData, driverName: e.target.value})} 
                placeholder="Driver Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <Input 
                id="capacity" 
                type="number" 
                value={formData.capacity} 
                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})} 
                placeholder="Capacity in liters/kg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="active">Active</Label>
              <Switch 
                id="active" 
                checked={formData.isActive} 
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddVehicle}>Add Vehicle</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Vehicle Name</Label>
              <Input 
                id="edit-name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Vehicle Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-registrationNumber">Registration Number</Label>
              <Input 
                id="edit-registrationNumber" 
                value={formData.registrationNumber} 
                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} 
                placeholder="MH02AB1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Vehicle Type</Label>
              <Input 
                id="edit-type" 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})} 
                placeholder="Van, Truck, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-driverName">Driver Name</Label>
              <Input 
                id="edit-driverName" 
                value={formData.driverName} 
                onChange={(e) => setFormData({...formData, driverName: e.target.value})} 
                placeholder="Driver Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity (Optional)</Label>
              <Input 
                id="edit-capacity" 
                type="number" 
                value={formData.capacity} 
                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})} 
                placeholder="Capacity in liters/kg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-active">Active</Label>
              <Switch 
                id="edit-active" 
                checked={formData.isActive} 
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleEditVehicle}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
