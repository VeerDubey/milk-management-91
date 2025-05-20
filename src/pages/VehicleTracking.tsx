import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Truck, FileText, Save, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const VehicleTracking = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData();

  // Vehicle form state
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleRegNumber, setVehicleRegNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleDriver, setVehicleDriver] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState(0);

  // Vehicle CRUD operations
  const handleAddVehicle = () => {
    if (!vehicleName || !vehicleRegNumber) {
      toast.error("Vehicle name and registration number are required");
      return;
    }

    addVehicle({
      name: vehicleName,
      registrationNumber: vehicleRegNumber, // Changed from regNumber
      type: vehicleType,
      driverName: vehicleDriver, // Changed from driver
      isActive: true,
      capacity: vehicleCapacity
    });

    // Reset form
    setVehicleName("");
    setVehicleRegNumber("");
    setVehicleType("");
    setVehicleDriver("");
    setVehicleCapacity(0);
    toast.success("Vehicle added successfully");
    setIsAddingVehicle(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleName(vehicle.name);
    setVehicleRegNumber(vehicle.registrationNumber); // Changed from regNumber
    setVehicleType(vehicle.type);
    setVehicleDriver(vehicle.driverName || ""); // Changed from driver
    setVehicleCapacity(vehicle.capacity);
    setIsAddingVehicle(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle? This cannot be undone.")) {
      deleteVehicle(vehicleId);
      toast.success("Vehicle deleted successfully");
    }
  };

  const resetVehicleForm = () => {
    setIsAddingVehicle(false);
    setEditingVehicle(null);
    setVehicleName("");
    setVehicleRegNumber("");
    setVehicleType("");
    setVehicleDriver("");
    setVehicleCapacity(0);
  };

  const handleUpdateVehicle = () => {
    if (!editingVehicle) return;
    
    updateVehicle(editingVehicle.id, {
      name: vehicleName,
      registrationNumber: vehicleRegNumber, // Changed from regNumber
      type: vehicleType,
      driverName: vehicleDriver, // Changed from driver
      capacity: vehicleCapacity
    });
    
    // Reset form
    setVehicleName("");
    setVehicleRegNumber("");
    setVehicleType("");
    setVehicleDriver("");
    setVehicleCapacity(0);
    
    toast.success("Vehicle updated successfully");
    setIsAddingVehicle(false);
    setEditingVehicle(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Tracking
          </h1>
          <p className="text-muted-foreground">
            Manage vehicles and their tracking information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddingVehicle(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Management</CardTitle>
            <Button variant="outline" onClick={() => setIsAddingVehicle(true)}>
              <Truck className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Add Vehicle Dialog */}
            <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVehicle
                      ? "Update vehicle details below"
                      : "Add vehicle details to create a new vehicle."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleName">Vehicle Name</Label>
                    <Input
                      id="vehicleName"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleRegNumber">Reg Number</Label>
                    <Input
                      id="vehicleRegNumber"
                      value={vehicleRegNumber}
                      onChange={(e) => setVehicleRegNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Input
                      id="vehicleType"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleDriver">Driver</Label>
                    <Input
                      id="vehicleDriver"
                      value={vehicleDriver}
                      onChange={(e) => setVehicleDriver(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary" onClick={resetVehicleForm}>
                      Cancel
                    </Button>
                  </DialogClose>
                  {editingVehicle ? (
                    <Button onClick={handleUpdateVehicle}>Update Vehicle</Button>
                  ) : (
                    <Button onClick={handleAddVehicle}>Add Vehicle</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Vehicles List */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Vehicles</h3>
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-medium">{vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.registrationNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditVehicle(vehicle)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleTracking;
