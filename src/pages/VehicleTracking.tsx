
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Vehicle } from '@/types';

export default function VehicleTracking() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    type: '',
    driverName: '',
    isActive: true,
    capacity: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked,
    });
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      registrationNumber: '',
      type: '',
      driverName: '',
      isActive: true,
      capacity: 0
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setIsEditMode(true);
    setEditVehicleId(vehicle.id);
    setFormData({
      name: vehicle.name,
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      driverName: vehicle.driverName || '',
      isActive: vehicle.isActive,
      capacity: vehicle.capacity || 0
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id);
      toast.success('Vehicle deleted successfully');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.registrationNumber || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditMode && editVehicleId) {
      updateVehicle(editVehicleId, {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        type: formData.type,
        driverName: formData.driverName,
        isActive: formData.isActive,
        capacity: formData.capacity
      });
      toast.success('Vehicle updated successfully');
    } else {
      addVehicle({
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        type: formData.type,
        driverName: formData.driverName,
        isActive: formData.isActive,
        capacity: formData.capacity
      });
      toast.success('Vehicle added successfully');
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Tracking</h1>
          <p className="text-muted-foreground">Manage your delivery vehicles</p>
        </div>
        <Button onClick={handleAddClick}>Add Vehicle</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell>{vehicle.registrationNumber}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.driverName || 'Not assigned'}</TableCell>
                      <TableCell>{vehicle.capacity || 'N/A'}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {vehicle.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(vehicle)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(vehicle.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No vehicles found. Add a new vehicle to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Delivery Van 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder="e.g. MH01AB1234"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <Input
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g. Van, Truck, Scooter"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name</Label>
              <Input
                id="driverName"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity.toString()}
                onChange={handleInputChange}
                placeholder="Capacity in kg or crates"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button type="submit">{isEditMode ? 'Update' : 'Add'} Vehicle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
