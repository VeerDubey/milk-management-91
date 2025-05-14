import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Truck, MapPin, User, Plus, Check, X } from "lucide-react";

const VehicleTracking = () => {
  const { 
    vehicles, 
    salesmen,
    orders, 
    customers,
    addVehicle, 
    updateVehicle, 
    deleteVehicle,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    updateOrder
  } = useData();
  const { toast } = useToast();
  
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    regNumber: '',
    type: 'truck',
    driver: '',
    isActive: true
  });
  
  const [newSalesman, setNewSalesman] = useState({
    name: '',
    phone: '',
    address: '',
    isActive: true
  });

  const handleAddVehicle = () => {
    if (!newVehicle.name || !newVehicle.regNumber) {
      toast({
        title: "Validation Error",
        description: "Vehicle name and registration number are required",
        variant: "destructive",
      });
      return;
    }
    
    addVehicle({
      ...newVehicle,
      number: newVehicle.regNumber, // Add the required number property
    });
    setNewVehicle({
      name: '',
      regNumber: '',
      type: 'truck',
      driver: '',
      isActive: true
    });
    
    toast({
      title: "Vehicle Added",
      description: `${newVehicle.name} has been added to the fleet`,
    });
  };

  const handleAddSalesman = () => {
    if (!newSalesman.name || !newSalesman.phone) {
      toast({
        title: "Validation Error",
        description: "Salesman name and phone number are required",
        variant: "destructive",
      });
      return;
    }
    
    addSalesman(newSalesman);
    setNewSalesman({
      name: '',
      phone: '',
      address: '',
      isActive: true
    });
    
    toast({
      title: "Salesman Added",
      description: `${newSalesman.name} has been added to the team`,
    });
  };
  
  const toggleVehicleStatus = (id: string, currentStatus: boolean) => {
    updateVehicle(id, { isActive: !currentStatus });
    toast({
      title: `Vehicle ${!currentStatus ? 'Activated' : 'Deactivated'}`,
      description: "Vehicle status has been updated",
    });
  };
  
  const toggleSalesmanStatus = (id: string, currentStatus: boolean) => {
    updateSalesman(id, { isActive: !currentStatus });
    toast({
      title: `Salesman ${!currentStatus ? 'Activated' : 'Deactivated'}`,
      description: "Salesman status has been updated",
    });
  };
  
  const assignOrderToVehicle = (orderId: string, vehicleId: string) => {
    updateOrder(orderId, { vehicleId });
    toast({
      title: "Order Assigned",
      description: "Order has been assigned to the selected vehicle",
    });
  };
  
  const assignOrderToSalesman = (orderId: string, salesmanId: string) => {
    updateOrder(orderId, { salesmanId });
    toast({
      title: "Order Assigned",
      description: "Order has been assigned to the selected salesman",
    });
  };

  // Get active orders that need assignment
  const pendingOrders = orders.filter(order => 
    !order.vehicleId || !order.salesmanId
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fleet Management & Order Assignment</h1>
        <p className="text-muted-foreground">Manage vehicles, salesmen, and assign orders</p>
      </div>
      
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="salesmen">Salesmen</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        
        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Add New Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input 
                  placeholder="Vehicle Name" 
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                />
                <Input 
                  placeholder="Registration Number" 
                  value={newVehicle.regNumber}
                  onChange={(e) => setNewVehicle({...newVehicle, regNumber: e.target.value})}
                />
                <Input 
                  placeholder="Vehicle Type" 
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                />
                <Input 
                  placeholder="Driver Name (Optional)" 
                  value={newVehicle.driver || ''}
                  onChange={(e) => setNewVehicle({...newVehicle, driver: e.target.value})}
                />
              </div>
              <Button onClick={handleAddVehicle}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>{vehicle.name}</TableCell>
                      <TableCell>{vehicle.regNumber}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.driver || 'Unassigned'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${vehicle.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {vehicle.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleVehicleStatus(vehicle.id, vehicle.isActive)}
                        >
                          {vehicle.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {vehicles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No vehicles available. Add your first vehicle.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Salesmen Tab */}
        <TabsContent value="salesmen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Add New Salesman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input 
                  placeholder="Salesman Name" 
                  value={newSalesman.name}
                  onChange={(e) => setNewSalesman({...newSalesman, name: e.target.value})}
                />
                <Input 
                  placeholder="Phone Number" 
                  value={newSalesman.phone}
                  onChange={(e) => setNewSalesman({...newSalesman, phone: e.target.value})}
                />
                <Input 
                  placeholder="Address (Optional)" 
                  value={newSalesman.address || ''}
                  onChange={(e) => setNewSalesman({...newSalesman, address: e.target.value})}
                  className="md:col-span-2"
                />
              </div>
              <Button onClick={handleAddSalesman}>
                <Plus className="mr-2 h-4 w-4" />
                Add Salesman
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales Team</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesmen.map((salesman) => (
                    <TableRow key={salesman.id}>
                      <TableCell>{salesman.name}</TableCell>
                      <TableCell>{salesman.phone}</TableCell>
                      <TableCell>{salesman.address || 'Not provided'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${salesman.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {salesman.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleSalesmanStatus(salesman.id, salesman.isActive)}
                        >
                          {salesman.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {salesmen.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No salesmen available. Add your first salesman.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Order Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Assign Vehicle</TableHead>
                      <TableHead>Assign Salesman</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => {
                      const customer = customers.find(c => 
                        order.items.some(item => item.customerId === c.id)
                      );
                      
                      return (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{customer?.name || 'Unknown'}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <select 
                              className="border rounded p-1 w-full"
                              value={order.vehicleId || 'unassigned'}
                              onChange={(e) => assignOrderToVehicle(order.id, e.target.value === 'unassigned' ? '' : e.target.value)}
                            >
                              <option value="unassigned">Select Vehicle</option>
                              {vehicles.filter(v => v.isActive).map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                  {vehicle.name} ({vehicle.regNumber})
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <select 
                              className="border rounded p-1 w-full"
                              value={order.salesmanId || 'unassigned'}
                              onChange={(e) => assignOrderToSalesman(order.id, e.target.value === 'unassigned' ? '' : e.target.value)}
                            >
                              <option value="unassigned">Select Salesman</option>
                              {salesmen.filter(s => s.isActive).map(salesman => (
                                <option key={salesman.id} value={salesman.id}>
                                  {salesman.name}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8">No pending orders requiring assignment.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleTracking;
