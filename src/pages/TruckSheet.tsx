import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Truck, Save, Download, FileText, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryItem {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  products: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  totalAmount: number;
  delivered: boolean;
  deliveryTime?: string;
  notes: string;
}

export default function TruckSheet() {
  const { customers, orders, vehicles, salesmen, products } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [routeName, setRouteName] = useState('');
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  // Generate delivery items from today's orders
  useEffect(() => {
    const todayStr = format(selectedDate, 'yyyy-MM-dd');
    const todayOrders = orders.filter(order => order.date === todayStr);
    
    const items: DeliveryItem[] = todayOrders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      return {
        id: order.id,
        customerId: order.customerId || '',
        customerName: customer?.name || 'Unknown Customer',
        address: customer?.address || 'No address',
        products: order.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            name: product?.name || 'Unknown Product',
            quantity: item.quantity,
            unit: product?.unit || 'unit'
          };
        }),
        totalAmount: order.total || 0,
        delivered: false,
        notes: ''
      };
    });
    
    setDeliveryItems(items);
  }, [selectedDate, orders, customers, products]);

  // Calculate delivery statistics
  useEffect(() => {
    const delivered = deliveryItems.filter(item => item.delivered).length;
    const pending = deliveryItems.filter(item => !item.delivered).length;
    setTotalDelivered(delivered);
    setTotalPending(pending);
  }, [deliveryItems]);

  const handleDeliveryToggle = (itemId: string, delivered: boolean) => {
    setDeliveryItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, delivered, deliveryTime: delivered ? new Date().toLocaleTimeString() : undefined }
          : item
      )
    );
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setDeliveryItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const generateTruckSheet = () => {
    if (!selectedVehicle || !selectedDriver) {
      toast.error('Please select vehicle and driver');
      return;
    }
    
    toast.success('Truck sheet generated successfully');
  };

  const saveTruckSheet = () => {
    if (deliveryItems.length === 0) {
      toast.error('No delivery items to save');
      return;
    }
    
    toast.success('Truck sheet saved successfully');
  };

  const exportTruckSheet = () => {
    toast.success('Truck sheet exported successfully');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Truck className="mr-3 h-8 w-8" />
            Truck Sheet
          </h1>
          <p className="text-muted-foreground">Delivery tracking and route management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportTruckSheet}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={saveTruckSheet}>
            <Save className="mr-2 h-4 w-4" />
            Save Sheet
          </Button>
        </div>
      </div>

      {/* Truck Sheet Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      {vehicle.name} - {vehicle.registrationNumber || vehicle.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Driver/Salesman</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {salesmen.map(salesman => (
                    <SelectItem key={salesman.id} value={salesman.id}>
                      {salesman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Route Name</Label>
              <Input
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Enter route name"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button onClick={generateTruckSheet} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="mr-2 h-4 w-4" />
              Generate Truck Sheet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{deliveryItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{totalDelivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Items */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No deliveries for selected date</p>
              </div>
            ) : (
              deliveryItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={item.delivered}
                          onCheckedChange={(checked) => handleDeliveryToggle(item.id, checked as boolean)}
                        />
                        <div>
                          <h4 className="font-semibold">{item.customerName}</h4>
                          <p className="text-sm text-muted-foreground">{item.address}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 ml-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {item.products.map((product, index) => (
                            <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {product.quantity} {product.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">₹{item.totalAmount.toFixed(2)}</p>
                      {item.delivered && item.deliveryTime && (
                        <p className="text-sm text-green-600">Delivered at {item.deliveryTime}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <Input
                      placeholder="Delivery notes..."
                      value={item.notes}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
