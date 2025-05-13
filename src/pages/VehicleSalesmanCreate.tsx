
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToPdf } from "@/utils/pdfUtils";
import { exportToExcel } from "@/utils/excelUtils";
import { 
  Car,
  User,
  Plus,
  Edit,
  Trash2, 
  FileText,
  Download,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { Vehicle, Salesman } from "@/types";

export default function VehicleSalesmanCreate() {
  const { vehicles, salesmen, addVehicle, updateVehicle, deleteVehicle, addSalesman, updateSalesman, deleteSalesman } = useData();
  
  // State for vehicle form
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleNotes, setVehicleNotes] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // State for salesman form
  const [salesmanName, setSalesmanName] = useState("");
  const [salesmanPhone, setSalesmanPhone] = useState("");
  const [salesmanAddress, setSalesmanAddress] = useState("");
  const [salesmanVehicle, setSalesmanVehicle] = useState("");
  const [editingSalesman, setEditingSalesman] = useState<Salesman | null>(null);
  
  // Reset form functions
  const resetVehicleForm = () => {
    setVehicleNumber("");
    setVehicleModel("");
    setVehicleCapacity("");
    setVehicleNotes("");
    setEditingVehicle(null);
  };
  
  const resetSalesmanForm = () => {
    setSalesmanName("");
    setSalesmanPhone("");
    setSalesmanAddress("");
    setSalesmanVehicle("");
    setEditingSalesman(null);
  };
  
  // Handle vehicle operations
  const handleAddUpdateVehicle = () => {
    if (!vehicleNumber) {
      toast.error("Vehicle number is required");
      return;
    }
    
    const vehicleData = {
      number: vehicleNumber,
      model: vehicleModel,
      capacity: vehicleCapacity ? parseFloat(vehicleCapacity) : undefined,
      notes: vehicleNotes,
    };
    
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleData);
      toast.success("Vehicle updated successfully");
    } else {
      addVehicle(vehicleData);
      toast.success("Vehicle added successfully");
    }
    
    resetVehicleForm();
  };
  
  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleNumber(vehicle.number);
    setVehicleModel(vehicle.model || "");
    setVehicleCapacity(vehicle.capacity ? vehicle.capacity.toString() : "");
    setVehicleNotes(vehicle.notes || "");
  };
  
  const handleDeleteVehicle = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle(id);
      toast.success("Vehicle deleted successfully");
    }
  };
  
  // Handle salesman operations
  const handleAddUpdateSalesman = () => {
    if (!salesmanName) {
      toast.error("Salesman name is required");
      return;
    }
    
    const salesmanData = {
      name: salesmanName,
      phone: salesmanPhone,
      address: salesmanAddress,
      vehicleId: salesmanVehicle || undefined,
    };
    
    if (editingSalesman) {
      updateSalesman(editingSalesman.id, salesmanData);
      toast.success("Salesman updated successfully");
    } else {
      addSalesman(salesmanData);
      toast.success("Salesman added successfully");
    }
    
    resetSalesmanForm();
  };
  
  const handleEditSalesman = (salesman: Salesman) => {
    setEditingSalesman(salesman);
    setSalesmanName(salesman.name);
    setSalesmanPhone(salesman.phone || "");
    setSalesmanAddress(salesman.address || "");
    setSalesmanVehicle(salesman.vehicleId || "");
  };
  
  const handleDeleteSalesman = (id: string) => {
    if (window.confirm("Are you sure you want to delete this salesman?")) {
      deleteSalesman(id);
      toast.success("Salesman deleted successfully");
    }
  };
  
  // Export functions
  const exportVehiclesToPdf = () => {
    const columns = ["Number", "Model", "Capacity", "Notes"];
    const data = vehicles.map(vehicle => [
      vehicle.number,
      vehicle.model || "-",
      vehicle.capacity || "-",
      vehicle.notes || "-"
    ]);
    
    exportToPdf(
      columns,
      data,
      {
        title: "Vehicles List",
        subtitle: "All registered vehicles",
        dateInfo: new Date().toLocaleDateString(),
        filename: "vehicles-list.pdf"
      }
    );
    
    toast.success("Vehicles list exported to PDF");
  };
  
  const exportVehiclesToExcel = () => {
    const columns = ["Number", "Model", "Capacity", "Notes"];
    const data = vehicles.map(vehicle => [
      vehicle.number,
      vehicle.model || "-",
      vehicle.capacity || "-",
      vehicle.notes || "-"
    ]);
    
    exportToExcel(columns, data, "vehicles-list.xlsx");
    toast.success("Vehicles list exported to Excel");
  };
  
  const exportSalesmenToPdf = () => {
    const columns = ["Name", "Phone", "Address", "Vehicle"];
    const data = salesmen.map(salesman => {
      const vehicle = vehicles.find(v => v.id === salesman.vehicleId);
      return [
        salesman.name,
        salesman.phone || "-",
        salesman.address || "-",
        vehicle ? vehicle.number : "-"
      ];
    });
    
    exportToPdf(
      columns,
      data,
      {
        title: "Salesmen List",
        subtitle: "All registered salesmen",
        dateInfo: new Date().toLocaleDateString(),
        filename: "salesmen-list.pdf"
      }
    );
    
    toast.success("Salesmen list exported to PDF");
  };
  
  const exportSalesmenToExcel = () => {
    const columns = ["Name", "Phone", "Address", "Vehicle"];
    const data = salesmen.map(salesman => {
      const vehicle = vehicles.find(v => v.id === salesman.vehicleId);
      return [
        salesman.name,
        salesman.phone || "-",
        salesman.address || "-",
        vehicle ? vehicle.number : "-"
      ];
    });
    
    exportToExcel(columns, data, "salesmen-list.xlsx");
    toast.success("Salesmen list exported to Excel");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles & Salesmen</h1>
          <p className="text-muted-foreground">Manage vehicles and salesmen details</p>
        </div>
      </div>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="vehicles" className="flex items-center">
            <Car className="mr-2 h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="salesmen" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Salesmen
          </TabsTrigger>
        </TabsList>
        
        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vehicle Form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                    <Input 
                      id="vehicleNumber" 
                      value={vehicleNumber} 
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="Enter vehicle number"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleModel">Model</Label>
                    <Input 
                      id="vehicleModel" 
                      value={vehicleModel} 
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Enter vehicle model"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleCapacity">Capacity (liters)</Label>
                    <Input 
                      id="vehicleCapacity" 
                      type="number"
                      value={vehicleCapacity} 
                      onChange={(e) => setVehicleCapacity(e.target.value)}
                      placeholder="Enter capacity in liters"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleNotes">Notes</Label>
                    <Textarea 
                      id="vehicleNotes" 
                      value={vehicleNotes} 
                      onChange={(e) => setVehicleNotes(e.target.value)}
                      placeholder="Additional notes"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddUpdateVehicle} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                    </Button>
                    {editingVehicle && (
                      <Button type="button" variant="outline" onClick={resetVehicleForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Vehicles List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vehicles List</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportVehiclesToExcel}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportVehiclesToPdf}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.length > 0 ? (
                        vehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">{vehicle.number}</TableCell>
                            <TableCell>{vehicle.model || "-"}</TableCell>
                            <TableCell>{vehicle.capacity ? `${vehicle.capacity} L` : "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
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
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No vehicles added yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Salesmen Tab */}
        <TabsContent value="salesmen" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Salesman Form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingSalesman ? "Edit Salesman" : "Add New Salesman"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="salesmanName">Name *</Label>
                    <Input 
                      id="salesmanName" 
                      value={salesmanName} 
                      onChange={(e) => setSalesmanName(e.target.value)}
                      placeholder="Enter salesman name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="salesmanPhone">Phone</Label>
                    <Input 
                      id="salesmanPhone" 
                      value={salesmanPhone} 
                      onChange={(e) => setSalesmanPhone(e.target.value)}
                      placeholder="Enter contact number"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="salesmanAddress">Address</Label>
                    <Textarea 
                      id="salesmanAddress" 
                      value={salesmanAddress} 
                      onChange={(e) => setSalesmanAddress(e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="salesmanVehicle">Assigned Vehicle</Label>
                    <Select 
                      value={salesmanVehicle} 
                      onValueChange={setSalesmanVehicle}
                    >
                      <SelectTrigger id="salesmanVehicle">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {vehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.number} - {vehicle.model || "No model"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddUpdateSalesman} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      {editingSalesman ? "Update Salesman" : "Add Salesman"}
                    </Button>
                    {editingSalesman && (
                      <Button type="button" variant="outline" onClick={resetSalesmanForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Salesmen List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Salesmen List</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportSalesmenToExcel}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportSalesmenToPdf}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesmen.length > 0 ? (
                        salesmen.map((salesman) => {
                          const vehicle = vehicles.find(v => v.id === salesman.vehicleId);
                          
                          return (
                            <TableRow key={salesman.id}>
                              <TableCell className="font-medium">{salesman.name}</TableCell>
                              <TableCell>{salesman.phone || "-"}</TableCell>
                              <TableCell>{vehicle ? vehicle.number : "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditSalesman(salesman)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleDeleteSalesman(salesman.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No salesmen added yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
