
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Truck, User, Plus, Edit, Download, Bell } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { useData } from '@/contexts/data/DataContext';

interface ScheduledDelivery {
  id: string;
  customerId: string;
  customerName: string;
  area: string;
  scheduledDate: Date;
  timeSlot: string;
  vehicleId: string;
  driverId: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'missed';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
  notes?: string;
}

export default function DeliveryScheduling() {
  const { customers, vehicles, salesmen } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledDeliveries, setScheduledDeliveries] = useState<ScheduledDelivery[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newDelivery, setNewDelivery] = useState({
    customerId: '',
    scheduledDate: new Date(),
    timeSlot: '',
    vehicleId: '',
    driverId: '',
    priority: 'medium' as const,
    estimatedDuration: 30,
    notes: ''
  });

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00'
  ];

  const createDeliverySchedule = () => {
    const customer = customers.find(c => c.id === newDelivery.customerId);
    if (!customer || !newDelivery.timeSlot || !newDelivery.vehicleId || !newDelivery.driverId) {
      toast.error('Please fill all required fields');
      return;
    }

    const delivery: ScheduledDelivery = {
      id: `schedule-${Date.now()}`,
      customerId: newDelivery.customerId,
      customerName: customer.name,
      area: customer.area || 'Unknown',
      scheduledDate: newDelivery.scheduledDate,
      timeSlot: newDelivery.timeSlot,
      vehicleId: newDelivery.vehicleId,
      driverId: newDelivery.driverId,
      status: 'scheduled',
      priority: newDelivery.priority,
      estimatedDuration: newDelivery.estimatedDuration,
      notes: newDelivery.notes
    };

    setScheduledDeliveries(prev => [...prev, delivery]);
    setShowCreateForm(false);
    setNewDelivery({
      customerId: '',
      scheduledDate: new Date(),
      timeSlot: '',
      vehicleId: '',
      driverId: '',
      priority: 'medium',
      estimatedDuration: 30,
      notes: ''
    });
    toast.success('Delivery scheduled successfully');
  };

  const autoScheduleDeliveries = () => {
    // Auto-schedule logic for multiple deliveries
    const unscheduledCustomers = customers.filter(c => 
      !scheduledDeliveries.some(sd => sd.customerId === c.id)
    );

    if (unscheduledCustomers.length === 0) {
      toast.info('All customers already have scheduled deliveries');
      return;
    }

    const newSchedules: ScheduledDelivery[] = [];
    let currentDate = new Date(selectedDate);
    let timeSlotIndex = 0;

    unscheduledCustomers.forEach((customer, index) => {
      if (timeSlotIndex >= timeSlots.length) {
        timeSlotIndex = 0;
        currentDate = addDays(currentDate, 1);
      }

      const schedule: ScheduledDelivery = {
        id: `auto-schedule-${Date.now()}-${index}`,
        customerId: customer.id,
        customerName: customer.name,
        area: customer.area || 'Unknown',
        scheduledDate: new Date(currentDate),
        timeSlot: timeSlots[timeSlotIndex],
        vehicleId: vehicles[0]?.id || '',
        driverId: salesmen[0]?.id || '',
        status: 'scheduled',
        priority: 'medium',
        estimatedDuration: 30,
        notes: 'Auto-scheduled'
      };

      newSchedules.push(schedule);
      timeSlotIndex++;
    });

    setScheduledDeliveries(prev => [...prev, ...newSchedules]);
    toast.success(`Auto-scheduled ${newSchedules.length} deliveries`);
  };

  const updateDeliveryStatus = (deliveryId: string, newStatus: ScheduledDelivery['status']) => {
    setScheduledDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus }
          : delivery
      )
    );
    toast.success('Delivery status updated');
  };

  const sendNotifications = () => {
    const todayDeliveries = scheduledDeliveries.filter(d => 
      format(d.scheduledDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
    
    toast.success(`Notifications sent for ${todayDeliveries.length} scheduled deliveries`);
  };

  const filteredDeliveries = scheduledDeliveries.filter(d => 
    format(d.scheduledDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const getStatusColor = (status: ScheduledDelivery['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ScheduledDelivery['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Delivery Scheduling
          </h1>
          <p className="text-muted-foreground">
            Automated delivery scheduling and management system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={sendNotifications}
            variant="outline"
            className="border-accent/20 text-accent hover:bg-accent/10"
          >
            <Bell className="mr-2 h-4 w-4" />
            Send Notifications
          </Button>
          <Button 
            onClick={autoScheduleDeliveries}
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/10"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Auto Schedule
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="aurora-button">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Delivery
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Date Selector */}
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DatePicker
              date={selectedDate}
              setDate={setSelectedDate}
              className="w-full"
            />
            <div className="mt-4 space-y-2">
              <div className="text-sm text-muted-foreground">
                Scheduled: {filteredDeliveries.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Completed: {filteredDeliveries.filter(d => d.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">
                Pending: {filteredDeliveries.filter(d => d.status === 'scheduled').length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Schedule */}
        <Card className="lg:col-span-3 aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Clock className="h-5 w-5" />
              Scheduled Deliveries - {format(selectedDate, 'dd/MM/yyyy')}
            </CardTitle>
            <CardDescription>
              Manage and track delivery schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No deliveries scheduled</h3>
                <p className="text-muted-foreground">
                  Schedule deliveries for {format(selectedDate, 'dd/MM/yyyy')}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {delivery.area}
                        </div>
                      </TableCell>
                      <TableCell>{delivery.timeSlot}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {vehicles.find(v => v.id === delivery.vehicleId)?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(delivery.priority)}>
                          {delivery.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {delivery.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDeliveryStatus(delivery.id, 'in-progress')}
                            >
                              Start
                            </Button>
                          )}
                          {delivery.status === 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Schedule Form */}
      {showCreateForm && (
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle>Schedule New Delivery</CardTitle>
            <CardDescription>Create a new delivery schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={newDelivery.customerId} onValueChange={(value) => 
                  setNewDelivery(prev => ({ ...prev, customerId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {customer.name} - {customer.area}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker
                  date={newDelivery.scheduledDate}
                  setDate={(date) => setNewDelivery(prev => ({ ...prev, scheduledDate: date || new Date() }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Time Slot</Label>
                <Select value={newDelivery.timeSlot} onValueChange={(value) => 
                  setNewDelivery(prev => ({ ...prev, timeSlot: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={newDelivery.vehicleId} onValueChange={(value) => 
                  setNewDelivery(prev => ({ ...prev, vehicleId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {vehicle.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Driver</Label>
                <Select value={newDelivery.driverId} onValueChange={(value) => 
                  setNewDelivery(prev => ({ ...prev, driverId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesmen.map(salesman => (
                      <SelectItem key={salesman.id} value={salesman.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {salesman.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newDelivery.priority} onValueChange={(value: any) => 
                  setNewDelivery(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={newDelivery.notes}
                onChange={(e) => setNewDelivery(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createDeliverySchedule} className="aurora-button">
                Schedule Delivery
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
