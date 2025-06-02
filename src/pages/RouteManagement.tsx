
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Route, Truck, Clock, Plus, Edit, Save, Download, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/data/DataContext';

interface DeliveryRoute {
  id: string;
  name: string;
  area: string;
  stops: RouteStop[];
  estimatedDuration: number;
  distance: number;
  vehicleId: string;
  driverId: string;
  status: 'active' | 'inactive' | 'completed';
  optimizationScore: number;
}

interface RouteStop {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  sequence: number;
  estimatedTime: number;
  deliveryWindow?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function RouteManagement() {
  const { customers, vehicles, salesmen } = useData();
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<DeliveryRoute | null>(null);

  const [newRoute, setNewRoute] = useState({
    name: '',
    area: '',
    vehicleId: '',
    driverId: '',
    selectedCustomers: [] as string[]
  });

  const areas = Array.from(new Set(customers.map(c => c.area).filter(Boolean)));

  const createRoute = () => {
    if (!newRoute.name || !newRoute.area || newRoute.selectedCustomers.length === 0) {
      toast.error('Please fill all required fields and select customers');
      return;
    }

    const routeStops: RouteStop[] = newRoute.selectedCustomers.map((customerId, index) => {
      const customer = customers.find(c => c.id === customerId);
      return {
        id: `stop-${Date.now()}-${index}`,
        customerId,
        customerName: customer?.name || 'Unknown',
        address: customer?.address || 'Unknown Address',
        sequence: index + 1,
        estimatedTime: 15, // Default 15 minutes per stop
        priority: 'medium'
      };
    });

    const route: DeliveryRoute = {
      id: `route-${Date.now()}`,
      name: newRoute.name,
      area: newRoute.area,
      stops: routeStops,
      estimatedDuration: routeStops.length * 15 + 30, // 15 min per stop + 30 min travel
      distance: routeStops.length * 2.5, // Estimate 2.5 km per stop
      vehicleId: newRoute.vehicleId,
      driverId: newRoute.driverId,
      status: 'active',
      optimizationScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
    };

    setRoutes(prev => [...prev, route]);
    setShowCreateForm(false);
    setNewRoute({
      name: '',
      area: '',
      vehicleId: '',
      driverId: '',
      selectedCustomers: []
    });
    toast.success('Route created successfully');
  };

  const optimizeRoute = (routeId: string) => {
    setRoutes(prev => prev.map(route => {
      if (route.id === routeId) {
        // Simulate route optimization by shuffling stops and improving score
        const optimizedStops = [...route.stops].sort((a, b) => 
          a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
        );
        
        return {
          ...route,
          stops: optimizedStops.map((stop, index) => ({ ...stop, sequence: index + 1 })),
          optimizationScore: Math.min(100, route.optimizationScore + 10),
          estimatedDuration: Math.floor(route.estimatedDuration * 0.85) // 15% improvement
        };
      }
      return route;
    }));
    toast.success('Route optimized successfully');
  };

  const duplicateRoute = (route: DeliveryRoute) => {
    const duplicated: DeliveryRoute = {
      ...route,
      id: `route-${Date.now()}`,
      name: `${route.name} (Copy)`,
      status: 'inactive'
    };
    setRoutes(prev => [...prev, duplicated]);
    toast.success('Route duplicated');
  };

  const toggleCustomerSelection = (customerId: string) => {
    setNewRoute(prev => ({
      ...prev,
      selectedCustomers: prev.selectedCustomers.includes(customerId)
        ? prev.selectedCustomers.filter(id => id !== customerId)
        : [...prev.selectedCustomers, customerId]
    }));
  };

  const getStatusColor = (status: DeliveryRoute['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOptimizationColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportRoute = (route: DeliveryRoute) => {
    const routeData = {
      route: route,
      customers: route.stops.map(stop => 
        customers.find(c => c.id === stop.customerId)
      ).filter(Boolean)
    };
    
    // In a real app, this would export to PDF/Excel
    console.log('Exporting route:', routeData);
    toast.success('Route exported successfully');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Route Management
          </h1>
          <p className="text-muted-foreground">
            Optimize delivery routes for maximum efficiency
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="aurora-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Route
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <Card className="lg:col-span-2 aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Route className="h-5 w-5" />
              Delivery Routes
            </CardTitle>
            <CardDescription>
              Manage and optimize your delivery routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {routes.length === 0 ? (
              <div className="text-center py-12">
                <Route className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No routes created</h3>
                <p className="text-muted-foreground">
                  Create your first delivery route to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Stops</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Optimization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {route.area}
                        </div>
                      </TableCell>
                      <TableCell>{route.stops.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {route.estimatedDuration}m
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getOptimizationColor(route.optimizationScore)}>
                          {route.optimizationScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(route.status)}>
                          {route.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRoute(route)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => optimizeRoute(route.id)}
                          >
                            <Navigation className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportRoute(route)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Route Details */}
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <MapPin className="h-5 w-5" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRoute ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedRoute.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRoute.area}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Stops:</span>
                    <span className="text-sm font-medium">{selectedRoute.stops.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duration:</span>
                    <span className="text-sm font-medium">{selectedRoute.estimatedDuration}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Distance:</span>
                    <span className="text-sm font-medium">{selectedRoute.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Optimization:</span>
                    <span className={`text-sm font-medium ${getOptimizationColor(selectedRoute.optimizationScore)}`}>
                      {selectedRoute.optimizationScore}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Route Stops</h4>
                  <div className="space-y-1">
                    {selectedRoute.stops
                      .sort((a, b) => a.sequence - b.sequence)
                      .map((stop) => (
                        <div key={stop.id} className="text-sm p-2 bg-muted rounded">
                          <div className="flex justify-between">
                            <span>{stop.sequence}. {stop.customerName}</span>
                            <span className="text-muted-foreground">{stop.estimatedTime}m</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => optimizeRoute(selectedRoute.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Optimize Route
                  </Button>
                  <Button
                    onClick={() => duplicateRoute(selectedRoute)}
                    className="w-full"
                    variant="outline"
                  >
                    Duplicate Route
                  </Button>
                  <Button
                    onClick={() => exportRoute(selectedRoute)}
                    className="w-full aurora-button"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Route
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Select a route to view details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Route Form */}
      {showCreateForm && (
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle>Create New Route</CardTitle>
            <CardDescription>Design an optimized delivery route</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Route Name</Label>
                <Input
                  value={newRoute.name}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter route name"
                />
              </div>

              <div className="space-y-2">
                <Label>Area</Label>
                <select
                  value={newRoute.area}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select area</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Vehicle</Label>
                <select
                  value={newRoute.vehicleId}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Customers ({newRoute.selectedCustomers.length} selected)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {customers
                  .filter(customer => !newRoute.area || customer.area === newRoute.area)
                  .map(customer => (
                    <div key={customer.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newRoute.selectedCustomers.includes(customer.id)}
                        onChange={() => toggleCustomerSelection(customer.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{customer.name} - {customer.area}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createRoute} className="aurora-button">
                Create Route
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
