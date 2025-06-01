
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TrackDeliverySheet() {
  const { orders, customers, vehicles, salesmen } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  // Get unique areas from customers
  const areas = React.useMemo(() => {
    const areaSet = new Set(customers.map(c => c.area).filter(Boolean));
    return Array.from(areaSet);
  }, [customers]);

  // Filter orders based on selected criteria
  const filteredOrders = React.useMemo(() => {
    if (!selectedDate) return [];

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return orders.filter(order => {
      const orderDate = format(new Date(order.date), 'yyyy-MM-dd');
      const matchesDate = orderDate === dateStr;
      const matchesArea = !selectedArea || 
        customers.find(c => c.id === order.customerId)?.area === selectedArea;
      const matchesVehicle = !selectedVehicle || order.vehicleId === selectedVehicle;
      return matchesDate && matchesArea && matchesVehicle;
    });
  }, [selectedDate, selectedArea, selectedVehicle, orders, customers]);

  const updateOrderStatus = (orderId: string, status: string) => {
    // This would update the order status in real implementation
    toast.success(`Order status updated to ${status}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      processing: { label: 'Processing', variant: 'default' as const, icon: Truck },
      completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold neo-noir-gradient-text">
              Track Delivery Sheet
            </h1>
            <p className="neo-noir-text-muted">
              Track delivery status and manage order fulfillment
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text">Tracking Filters</CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Filter orders by date, area, and vehicle to track deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="neo-noir-text text-sm font-medium">Date</label>
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  className="w-full neo-noir-input"
                />
              </div>
              
              <div className="space-y-2">
                <label className="neo-noir-text text-sm font-medium">Area</label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue placeholder="All areas" />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    <SelectItem value="">All Areas</SelectItem>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {area}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="neo-noir-text text-sm font-medium">Vehicle</label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="neo-noir-input">
                    <SelectValue placeholder="All vehicles" />
                  </SelectTrigger>
                  <SelectContent className="neo-noir-surface">
                    <SelectItem value="">All Vehicles</SelectItem>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {vehicle.registrationNumber} - {vehicle.driverName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="neo-noir-card">
          <CardHeader>
            <CardTitle className="neo-noir-text">
              Delivery Tracking - {format(selectedDate, 'dd/MM/yyyy')}
            </CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Track and update delivery status for orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <Table className="neo-noir-table">
                <TableHeader>
                  <TableRow className="neo-noir-table-header">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const customer = customers.find(c => c.id === order.customerId);
                    const vehicle = vehicles.find(v => v.id === order.vehicleId);
                    
                    return (
                      <TableRow key={order.id} className="neo-noir-table-row">
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{customer?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer?.area || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {order.items?.length || 0} items
                          </div>
                        </TableCell>
                        <TableCell>₹{order.total?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'processing')}
                                className="neo-noir-button-outline text-xs"
                              >
                                Start Processing
                              </Button>
                            )}
                            {order.status === 'processing' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="neo-noir-button-accent text-xs"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold neo-noir-text mb-2">No orders found</h3>
                <p className="neo-noir-text-muted">
                  No orders found for the selected criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
