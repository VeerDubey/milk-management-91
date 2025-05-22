
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, formatDistance } from 'date-fns';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

import { VehicleCreateData } from '@/contexts/data/useVehicleSalesmanState';

import { 
  Truck, 
  MapPin, 
  Calendar, 
  Search, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TimerReset,
  User,
  Phone,
  Clipboard,
  FileText
} from 'lucide-react';

type Trip = {
  id: string;
  date: string;
  destination: string;
  startTime: string;
  endTime?: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
  distance?: number;
  purpose: string;
  driver?: string;
  notes?: string;
  orders?: string[];
};

export default function VehicleTracking() {
  const { vehicles, addVehicle, updateVehicle, addVehicleTrip } = useData();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [addTripOpen, setAddTripOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleCreateData>({
    defaultValues: {
      registrationNumber: '',
      model: '',
      type: '',
      capacity: 0,
      status: 'Available',
    }
  });
  
  const { 
    register: registerTrip, 
    handleSubmit: handleTripSubmit, 
    reset: resetTrip,
    formState: { errors: tripErrors } 
  } = useForm({
    defaultValues: {
      destination: '',
      startTime: format(new Date(), 'HH:mm'),
      purpose: '',
      driver: '',
      notes: ''
    }
  });
  
  // Get selected vehicle details
  const selectedVehicleDetails = useMemo(() => {
    if (!selectedVehicle) return null;
    return vehicles.find(v => v.id === selectedVehicle);
  }, [vehicles, selectedVehicle]);
  
  // Filter vehicles based on search term
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => 
      vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);
  
  // Handle add vehicle form submission
  const onAddVehicle = handleSubmit(async (data) => {
    try {
      const newVehicle = await addVehicle(data);
      toast.success(`Vehicle ${data.registrationNumber} added successfully`);
      setAddVehicleOpen(false);
      reset();
      
      // Auto-select the new vehicle
      setSelectedVehicle(newVehicle.id);
    } catch (error) {
      toast.error('Failed to add vehicle');
      console.error('Add vehicle error:', error);
    }
  });
  
  // Handle add trip form submission
  const onAddTrip = handleTripSubmit(async (data) => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle first');
      return;
    }
    
    try {
      const tripData: Trip = {
        id: `trip-${Date.now()}`,
        date: format(new Date(), 'yyyy-MM-dd'),
        destination: data.destination,
        startTime: data.startTime,
        status: 'In Progress',
        purpose: data.purpose,
        driver: data.driver,
        notes: data.notes
      };
      
      // Add trip to vehicle
      const success = addVehicleTrip(selectedVehicle, tripData);
      
      if (success) {
        // Update vehicle status to "In Use"
        await updateVehicle(selectedVehicle, { status: 'In Use' });
        
        toast.success('Trip started successfully');
        setAddTripOpen(false);
        resetTrip();
      } else {
        toast.error('Failed to start trip');
      }
    } catch (error) {
      toast.error('Failed to start trip');
      console.error('Add trip error:', error);
    }
  });
  
  // Handle completing a trip
  const handleCompleteTrip = async (tripId: string) => {
    if (!selectedVehicle || !selectedVehicleDetails) return;
    
    try {
      const trips = selectedVehicleDetails.trips || [];
      const updatedTrips = trips.map(trip => {
        if (trip.id === tripId) {
          return {
            ...trip,
            status: 'Completed',
            endTime: format(new Date(), 'HH:mm')
          };
        }
        return trip;
      });
      
      // Check if there are any active trips left
      const hasActiveTrips = updatedTrips.some(trip => trip.status === 'In Progress');
      
      // Update vehicle with completed trip and update status if needed
      await updateVehicle(selectedVehicle, {
        trips: updatedTrips,
        status: hasActiveTrips ? 'In Use' : 'Available'
      });
      
      toast.success('Trip completed successfully');
    } catch (error) {
      toast.error('Failed to complete trip');
      console.error('Complete trip error:', error);
    }
  };
  
  // Handle cancelling a trip
  const handleCancelTrip = async (tripId: string) => {
    if (!selectedVehicle || !selectedVehicleDetails) return;
    
    try {
      const trips = selectedVehicleDetails.trips || [];
      const updatedTrips = trips.map(trip => {
        if (trip.id === tripId) {
          return {
            ...trip,
            status: 'Cancelled',
            endTime: format(new Date(), 'HH:mm')
          };
        }
        return trip;
      });
      
      // Check if there are any active trips left
      const hasActiveTrips = updatedTrips.some(trip => trip.status === 'In Progress');
      
      // Update vehicle with cancelled trip and update status if needed
      await updateVehicle(selectedVehicle, {
        trips: updatedTrips,
        status: hasActiveTrips ? 'In Use' : 'Available'
      });
      
      toast.success('Trip cancelled');
    } catch (error) {
      toast.error('Failed to cancel trip');
      console.error('Cancel trip error:', error);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Available</Badge>;
      case 'In Use':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Use</Badge>;
      case 'Under Maintenance':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Under Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get trip status badge
  const getTripStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Tracking</h1>
          <p className="text-muted-foreground">
            Manage and track your delivery vehicles
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Enter the details of the new vehicle.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={onAddVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number*</Label>
                    <Input 
                      id="registrationNumber"
                      placeholder="KA01AB1234"
                      {...register('registrationNumber', { required: true })}
                    />
                    {errors.registrationNumber && <p className="text-sm text-red-500">Required field</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model*</Label>
                    <Input 
                      id="model"
                      placeholder="Tata Ace"
                      {...register('model', { required: true })}
                    />
                    {errors.model && <p className="text-sm text-red-500">Required field</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type*</Label>
                    <Select onValueChange={(value) => register('type').onChange({ target: { name: 'type', value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Vehicle Types</SelectLabel>
                          <SelectItem value="Mini Van">Mini Van</SelectItem>
                          <SelectItem value="Pickup Truck">Pickup Truck</SelectItem>
                          <SelectItem value="Delivery Van">Delivery Van</SelectItem>
                          <SelectItem value="Refrigerated Truck">Refrigerated Truck</SelectItem>
                          <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500">Required field</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (L)*</Label>
                    <Input 
                      id="capacity"
                      type="number"
                      placeholder="500"
                      {...register('capacity', { required: true, min: 0, valueAsNumber: true })}
                    />
                    {errors.capacity && <p className="text-sm text-red-500">Required field</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input 
                      id="driverName"
                      placeholder="John Doe"
                      {...register('driverName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverContactNumber">Driver Contact</Label>
                    <Input 
                      id="driverContactNumber"
                      placeholder="+91 98765 43210"
                      {...register('driverContactNumber')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Additional information about the vehicle"
                    className="h-20"
                    {...register('notes')}
                  />
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setAddVehicleOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Vehicle</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {selectedVehicleDetails && (
            <Dialog open={addTripOpen} onOpenChange={setAddTripOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <MapPin className="mr-2 h-4 w-4" />
                  Start Trip
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Trip</DialogTitle>
                  <DialogDescription>
                    Vehicle: {selectedVehicleDetails.registrationNumber} - {selectedVehicleDetails.model}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={onAddTrip} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination*</Label>
                    <Input 
                      id="destination"
                      placeholder="Enter destination"
                      {...registerTrip('destination', { required: true })}
                    />
                    {tripErrors.destination && <p className="text-sm text-red-500">Required field</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time*</Label>
                      <Input 
                        id="startTime"
                        type="time"
                        {...registerTrip('startTime', { required: true })}
                      />
                      {tripErrors.startTime && <p className="text-sm text-red-500">Required field</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose*</Label>
                      <Select onValueChange={(value) => registerTrip('purpose').onChange({ target: { name: 'purpose', value } })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delivery">Delivery</SelectItem>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                          <SelectItem value="Collection">Collection</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {tripErrors.purpose && <p className="text-sm text-red-500">Required field</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver</Label>
                    <Input 
                      id="driver"
                      placeholder="Driver name"
                      defaultValue={selectedVehicleDetails.driverName || ''}
                      {...registerTrip('driver')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tripNotes">Notes</Label>
                    <Textarea 
                      id="tripNotes"
                      placeholder="Additional information about the trip"
                      className="h-20"
                      {...registerTrip('notes')}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setAddTripOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Start Trip</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vehicles">
            <Truck className="mr-2 h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="trips">
            <MapPin className="mr-2 h-4 w-4" />
            Trips
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>
                  Fleet Management
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>
                {vehicles.length} vehicles registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map(vehicle => (
                      <div 
                        key={vehicle.id}
                        className={`p-4 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                          vehicle.id === selectedVehicle ? 'bg-primary/10 border-primary/50' : ''
                        }`}
                        onClick={() => setSelectedVehicle(vehicle.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{vehicle.registrationNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.model} • {vehicle.type} • {vehicle.capacity}L
                            </p>
                          </div>
                          <div>
                            {getStatusBadge(vehicle.status)}
                          </div>
                        </div>
                        
                        {vehicle.driverName && (
                          <div className="mt-2 text-sm flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {vehicle.driverName}
                            {vehicle.driverContactNumber && (
                              <span className="ml-2">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {vehicle.driverContactNumber}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Show active trip if any */}
                        {vehicle.trips && vehicle.trips.some(trip => trip.status === 'In Progress') && (
                          <div className="mt-2 text-xs bg-blue-500/10 text-blue-700 p-1 px-2 rounded-md inline-flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Currently on trip
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No vehicles found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {selectedVehicleDetails && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedVehicleDetails.registrationNumber}</CardTitle>
                  {getStatusBadge(selectedVehicleDetails.status)}
                </div>
                <CardDescription>
                  {selectedVehicleDetails.model} • {selectedVehicleDetails.type} • {selectedVehicleDetails.capacity}L
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Driver</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedVehicleDetails.driverName || 'Not assigned'}</span>
                    </div>
                    {selectedVehicleDetails.driverContactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedVehicleDetails.driverContactNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Recent Activity</Label>
                    {selectedVehicleDetails.trips && selectedVehicleDetails.trips.length > 0 ? (
                      <div className="text-sm">
                        <p>
                          {selectedVehicleDetails.trips.some(trip => trip.status === 'In Progress') 
                            ? 'Currently on trip' 
                            : `Last trip: ${formatDistance(
                                parseISO(selectedVehicleDetails.trips[selectedVehicleDetails.trips.length - 1].date),
                                new Date(),
                                { addSuffix: true }
                              )}`
                          }
                        </p>
                        <p className="text-muted-foreground mt-1">
                          {selectedVehicleDetails.trips.length} total trips recorded
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No trips recorded
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedVehicleDetails.notes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <div className="text-sm bg-muted/50 p-3 rounded-md">
                      {selectedVehicleDetails.notes}
                    </div>
                  </div>
                )}
                
                {/* Show maintenance info */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Maintenance</Label>
                  {selectedVehicleDetails.lastMaintenanceDate ? (
                    <div className="text-sm">
                      <p>Last maintenance: {format(parseISO(selectedVehicleDetails.lastMaintenanceDate), 'PPP')}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No maintenance records
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  // Show dialog to update vehicle
                  toast('Vehicle update feature coming soon');
                }}>
                  Edit Details
                </Button>
                
                <div className="flex gap-2">
                  {selectedVehicleDetails.status === 'Available' && (
                    <Button onClick={() => setAddTripOpen(true)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Start Trip
                    </Button>
                  )}
                  
                  {selectedVehicleDetails.status === 'In Use' && (
                    <Button variant="secondary" onClick={() => {
                      // Complete all active trips
                      if (!selectedVehicleDetails.trips) return;
                      
                      const activeTrips = selectedVehicleDetails.trips.filter(trip => trip.status === 'In Progress');
                      if (activeTrips.length === 0) return;
                      
                      // Complete the first active trip
                      handleCompleteTrip(activeTrips[0].id);
                    }}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Trip
                    </Button>
                  )}
                  
                  {selectedVehicleDetails.status === 'Under Maintenance' && (
                    <Button variant="outline" onClick={() => {
                      // Mark maintenance as complete
                      updateVehicle(selectedVehicleDetails.id, {
                        status: 'Available',
                        lastMaintenanceDate: new Date().toISOString()
                      });
                      toast.success('Maintenance completed');
                    }}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Maintenance
                    </Button>
                  )}
                  
                  {selectedVehicleDetails.status !== 'Under Maintenance' && (
                    <Button variant="destructive" onClick={() => {
                      // Mark vehicle as under maintenance
                      updateVehicle(selectedVehicleDetails.id, {
                        status: 'Under Maintenance'
                      });
                      toast.success('Vehicle marked for maintenance');
                    }}>
                      <TimerReset className="mr-2 h-4 w-4" />
                      Mark for Maintenance
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip History</CardTitle>
              <CardDescription>
                View all trips across your fleet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.flatMap(vehicle => 
                    (vehicle.trips || []).map(trip => ({
                      ...trip,
                      vehicle
                    }))
                  ).sort((a, b) => 
                    // Sort by date (newest first) and then by start time
                    new Date(b.date).getTime() - new Date(a.date).getTime() ||
                    b.startTime.localeCompare(a.startTime)
                  ).slice(0, 10).map(trip => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {format(parseISO(trip.date), 'dd MMM yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{trip.vehicle.registrationNumber}</div>
                        <div className="text-xs text-muted-foreground">{trip.vehicle.model}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {trip.destination}
                        </div>
                      </TableCell>
                      <TableCell>{trip.purpose}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          {trip.startTime}
                          {trip.endTime && ` - ${trip.endTime}`}
                        </div>
                      </TableCell>
                      <TableCell>{getTripStatusBadge(trip.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {trip.status === 'In Progress' ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleCompleteTrip(trip.id)}
                                className="h-8 w-8"
                                title="Complete Trip"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleCancelTrip(trip.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                title="Cancel Trip"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                // View trip details - show dialog
                                toast('Trip details feature coming soon');
                              }}
                              className="h-8 w-8"
                              title="View Details"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Show message if no trips are recorded */}
                  {vehicles.flatMap(v => v.trips || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No trips recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
