
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, MapPin, Truck, Package, CheckCircle, 
  XCircle, AlertCircle, Route, Bell, Download, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useData } from '@/contexts/data/DataContext';

interface DeliverySchedule {
  id: string;
  vehicleId: string;
  salesmanId: string;
  route: string[];
  scheduledDate: string;
  estimatedDuration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  orders: string[];
}

interface DeliveryTracking {
  orderId: string;
  status: 'pending' | 'dispatched' | 'delivered' | 'missed';
  estimatedTime: string;
  actualTime?: string;
  notes?: string;
  customerFeedback?: string;
}

export default function DeliveryManagement() {
  const { orders, customers, vehicles, salesmen } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [activeTab, setActiveTab] = useState('scheduling');

  // Mock delivery schedules
  const [deliverySchedules, setDeliverySchedules] = useState<DeliverySchedule[]>([
    {
      id: 'sch-1',
      vehicleId: 'vehicle-1',
      salesmanId: 'salesman-1',
      route: ['SEWRI', 'LALBAUGH', 'PAREL-BHOIWADA'],
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      estimatedDuration: 240, // minutes
      status: 'scheduled',
      orders: ['order-1', 'order-2', 'order-3']
    }
  ]);

  // Mock delivery tracking
  const [deliveryTracking, setDeliveryTracking] = useState<DeliveryTracking[]>([
    {
      orderId: 'order-1',
      status: 'delivered',
      estimatedTime: '09:30',
      actualTime: '09:45',
      notes: 'Customer was waiting'
    },
    {
      orderId: 'order-2',
      status: 'delivered',
      estimatedTime: '10:15',
      actualTime: '10:20'
    },
    {
      orderId: 'order-3',
      status: 'missed',
      estimatedTime: '11:00',
      notes: 'Customer not available'
    }
  ]);

  const createDeliverySchedule = () => {
    if (!selectedVehicle || !selectedDate) {
      toast.error('Please select vehicle and date');
      return;
    }

    // Get orders for selected date
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const ordersForDate = orders.filter(order => order.date === dateStr);

    if (ordersForDate.length === 0) {
      toast.warning('No orders found for selected date');
      return;
    }

    // Group orders by area to create optimal route
    const areaGroups = ordersForDate.reduce((acc, order) => {
      const customer = customers.find(c => c.id === order.customerId);
      const area = customer?.area || 'Unknown';
      if (!acc[area]) acc[area] = [];
      acc[area].push(order.id);
      return acc;
    }, {} as Record<string, string[]>);

    const route = Object.keys(areaGroups);
    const estimatedDuration = route.length * 60; // 1 hour per area

    const newSchedule: DeliverySchedule = {
      id: `sch-${Date.now()}`,
      vehicleId: selectedVehicle,
      salesmanId: '', // Would be selected in UI
      route,
      scheduledDate: dateStr,
      estimatedDuration,
      status: 'scheduled',
      orders: ordersForDate.map(o => o.id)
    };

    setDeliverySchedules(prev => [...prev, newSchedule]);
    toast.success(`Delivery schedule created for ${route.length} areas`);
  };

  const updateDeliveryStatus = (orderId: string, status: DeliveryTracking['status'], notes?: string) => {
    setDeliveryTracking(prev => prev.map(tracking => 
      tracking.orderId === orderId 
        ? { 
            ...tracking, 
            status, 
            actualTime: status === 'delivered' ? format(new Date(), 'HH:mm') : tracking.actualTime,
            notes: notes || tracking.notes
          }
        : tracking
    ));
    toast.success(`Order ${orderId} marked as ${status}`);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      scheduled: { label: 'Scheduled', variant: 'secondary' as const, icon: Clock },
      'in-progress': { label: 'In Progress', variant: 'default' as const, icon: Truck },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      delayed: { label: 'Delayed', variant: 'destructive' as const, icon: AlertCircle },
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      dispatched: { label: 'Dispatched', variant: 'default' as const, icon: Truck },
      delivered: { label: 'Delivered', variant: 'default' as const, icon: CheckCircle },
      missed: { label: 'Missed', variant: 'destructive' as const, icon: XCircle },
    };

    const item = config[status as keyof typeof config] || config.pending;
    const Icon = item.icon;

    return (
      <Badge variant={item.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {item.label}
      </Badge>
    );
  };

  const exportDeliveryReport = () => {
    // This would generate and download a delivery report
    toast.success('Delivery report exported successfully');
  };

  const sendCustomerNotifications = () => {
    // This would send SMS/email notifications to customers
    toast.success('Customer notifications sent');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">
            Schedule, track, and manage deliveries with route optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendCustomerNotifications} variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Notify Customers
          </Button>
          <Button onClick={exportDeliveryReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Delivery Scheduling
              </CardTitle>
              <CardDescription>Create and manage delivery schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={createDeliverySchedule} className="w-full">
                    Create Schedule
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Schedules</h3>
                {deliverySchedules.map(schedule => (
                  <Card key={schedule.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span className="font-medium">
                              {vehicles.find(v => v.id === schedule.vehicleId)?.name}
                            </span>
                            {getStatusBadge(schedule.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {schedule.scheduledDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(schedule.estimatedDuration / 60)}h {schedule.estimatedDuration % 60}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Route className="h-3 w-3" />
                              {schedule.route.length} areas
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {schedule.route.map(area => (
                              <Badge key={area} variant="outline">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Delivery Tracking
              </CardTitle>
              <CardDescription>Track individual delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryTracking.map(tracking => {
                  const order = orders.find(o => o.id === tracking.orderId);
                  const customer = customers.find(c => c.id === order?.customerId);
                  
                  return (
                    <Card key={tracking.orderId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{customer?.name}</span>
                              {getStatusBadge(tracking.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Est: {tracking.estimatedTime}</span>
                              {tracking.actualTime && (
                                <span>Actual: {tracking.actualTime}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {customer?.area}
                              </span>
                            </div>
                            {tracking.notes && (
                              <p className="text-sm text-muted-foreground">{tracking.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {tracking.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateDeliveryStatus(tracking.orderId, 'dispatched')}
                              >
                                Dispatch
                              </Button>
                            )}
                            {tracking.status === 'dispatched' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updateDeliveryStatus(tracking.orderId, 'delivered')}
                                >
                                  Delivered
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateDeliveryStatus(tracking.orderId, 'missed')}
                                >
                                  Missed
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Route Management
              </CardTitle>
              <CardDescription>Visualize and optimize delivery routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Route className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Route Visualization</h3>
                <p className="text-muted-foreground">
                  Interactive route mapping will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-sm text-muted-foreground">On-time Delivery</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-muted-foreground">Avg Stops/Route</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">3.2h</div>
                      <div className="text-sm text-muted-foreground">Avg Route Time</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
