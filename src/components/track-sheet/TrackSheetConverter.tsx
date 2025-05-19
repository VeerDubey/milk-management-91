
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from '@/contexts/data/DataContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface TrackSheetConverterProps {
  orderId?: string;
  onConvert?: () => void;
}

export function TrackSheetConverter({ orderId, onConvert }: TrackSheetConverterProps) {
  const { orders, customers, products, vehicles, salesmen } = useData();
  const navigate = useNavigate();
  const [converting, setConverting] = useState(false);

  // Find the order if an ID is provided
  const order = orderId ? orders.find(o => o.id === orderId) : null;

  // Get all applicable orders if no specific ID is provided
  const applicableOrders = !orderId 
    ? orders.filter(o => o.vehicleId && o.salesmanId) 
    : [];

  const handleConvertSingleOrder = () => {
    if (!order) return;
    
    setConverting(true);
    
    // Simulate conversion process
    setTimeout(() => {
      // Navigate to track sheet with this order's data
      navigate('/track-sheet', { 
        state: { 
          fromOrder: true, 
          orderId: order.id,
          vehicleId: order.vehicleId,
          salesmanId: order.salesmanId,
          items: order.items,
          date: new Date(order.date)
        } 
      });
      
      toast.success("Order converted to track sheet successfully!");
      if (onConvert) onConvert();
      setConverting(false);
    }, 1000);
  };

  const handleConvertVehicleOrders = (vehicleId: string) => {
    setConverting(true);
    
    // Get all orders for this vehicle
    const vehicleOrders = orders.filter(o => o.vehicleId === vehicleId);
    
    if (vehicleOrders.length === 0) {
      toast.error("No orders found for this vehicle");
      setConverting(false);
      return;
    }
    
    // Simulate conversion process
    setTimeout(() => {
      // Navigate to track sheet with all orders for this vehicle
      navigate('/track-sheet', { 
        state: { 
          fromOrder: true, 
          vehicleId: vehicleId,
          salesmanId: vehicleOrders[0].salesmanId, // Use the salesman from the first order
          items: vehicleOrders.flatMap(o => o.items),
          date: new Date()
        } 
      });
      
      toast.success(`${vehicleOrders.length} orders converted to track sheet successfully!`);
      if (onConvert) onConvert();
      setConverting(false);
    }, 1000);
  };

  // Content for single order view
  if (order) {
    const vehicle = vehicles.find(v => v.id === order.vehicleId);
    const salesman = salesmen.find(s => s.id === order.salesmanId);
    
    return (
      <Card className="my-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Convert Order to Track Sheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md bg-primary/10 p-3">
              <h3 className="font-medium">Order #{order.id}</h3>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(order.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Vehicle: {vehicle ? vehicle.name : 'Not assigned'}
              </p>
              <p className="text-sm text-muted-foreground">
                Salesman: {salesman ? salesman.name : 'Not assigned'}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Items: {order.items.length}
              </p>
            </div>
            
            {(!order.vehicleId || !order.salesmanId) ? (
              <div className="rounded-md bg-amber-500/10 p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-500">Incomplete Assignment</h4>
                  <p className="text-sm">
                    This order cannot be converted to a track sheet until it is assigned to both a vehicle and a salesman.
                  </p>
                </div>
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleConvertSingleOrder}
                disabled={converting || !order.vehicleId || !order.salesmanId}
              >
                {converting ? (
                  <>Converting...</>
                ) : (
                  <>Convert to Track Sheet</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Content for vehicle-grouped view
  const vehicleGroups = applicableOrders.reduce((acc, order) => {
    if (!order.vehicleId) return acc;
    
    if (!acc[order.vehicleId]) {
      acc[order.vehicleId] = {
        orders: [],
        vehicleId: order.vehicleId
      };
    }
    
    acc[order.vehicleId].orders.push(order);
    return acc;
  }, {} as Record<string, { orders: typeof orders, vehicleId: string }>);
  
  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Convert Orders to Track Sheets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.keys(vehicleGroups).length === 0 ? (
            <div className="rounded-md bg-muted p-3 text-center">
              <p>No orders found that can be converted to track sheets.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Orders must be assigned to both a vehicle and a salesman to be converted.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.values(vehicleGroups).map(group => {
                const vehicle = vehicles.find(v => v.id === group.vehicleId);
                
                return (
                  <div key={group.vehicleId} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{vehicle ? vehicle.name : 'Unknown Vehicle'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Orders: {group.orders.length}
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleConvertVehicleOrders(group.vehicleId)}
                        disabled={converting}
                      >
                        {converting ? 'Converting...' : 'Convert'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
