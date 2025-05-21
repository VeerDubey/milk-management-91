
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useData } from '@/contexts/data/DataContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileSpreadsheet, Check, AlertCircle, Truck, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TrackSheetConverterProps {
  orderId?: string;
  onConvert?: () => void;
}

export function TrackSheetConverter({ orderId, onConvert }: TrackSheetConverterProps) {
  const { orders, customers, products, vehicles, salesmen } = useData();
  const navigate = useNavigate();
  const [converting, setConverting] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Find the order if an ID is provided
  const order = orderId ? orders.find(o => o.id === orderId) : null;

  // Get all applicable orders if no specific ID is provided
  const applicableOrders = !orderId 
    ? orders.filter(o => o.vehicleId && o.salesmanId) 
    : [];

  const handleConvertSingleOrder = () => {
    if (!order) return;
    
    setConverting(true);
    
    // Animate loading and conversion process
    toast.loading("Converting order to track sheet...");
    
    setTimeout(() => {
      toast.dismiss();
      
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
      
      toast.success("Order converted to track sheet successfully!", {
        description: `Track sheet created for order #${order.id.slice(-5)}`,
        action: {
          label: "View Sheet",
          onClick: () => navigate('/track-sheet')
        }
      });
      
      if (onConvert) onConvert();
      setConverting(false);
    }, 1200);
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
    
    // Animate loading and conversion process
    toast.loading(`Converting ${vehicleOrders.length} orders to track sheet...`);
    
    setTimeout(() => {
      toast.dismiss();
      
      // Navigate to track sheet with all orders for this vehicle
      navigate('/track-sheet', { 
        state: { 
          fromOrder: true, 
          vehicleId: vehicleId,
          salesmanId: vehicleOrders[0].salesmanId, // Use the salesman from the first order
          items: vehicleOrders.flatMap(o => o.items),
          date: new Date(),
          isGrouped: true,
          orderIds: vehicleOrders.map(o => o.id)
        } 
      });
      
      toast.success(`${vehicleOrders.length} orders converted to track sheet successfully!`, {
        description: "Combined track sheet created for all selected orders",
        action: {
          label: "View Sheet",
          onClick: () => navigate('/track-sheet')
        }
      });
      
      if (onConvert) onConvert();
      setConverting(false);
    }, 1500);
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleConvertSelectedOrders = () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    
    setConverting(true);
    
    // Get all selected orders
    const ordersToConvert = orders.filter(o => selectedOrders.includes(o.id));
    
    // Group by vehicle
    const ordersByVehicle = ordersToConvert.reduce((acc, order) => {
      if (!order.vehicleId) return acc;
      
      if (!acc[order.vehicleId]) {
        acc[order.vehicleId] = {
          orders: [],
          vehicleId: order.vehicleId,
          salesmanId: order.salesmanId,
        };
      }
      
      acc[order.vehicleId].orders.push(order);
      return acc;
    }, {} as Record<string, { orders: typeof orders, vehicleId: string, salesmanId: string }>);
    
    // Create track sheets for each vehicle
    const vehicleIds = Object.keys(ordersByVehicle);
    
    if (vehicleIds.length === 0) {
      toast.error("No valid orders to convert");
      setConverting(false);
      return;
    }
    
    toast.loading(`Converting ${ordersToConvert.length} orders to ${vehicleIds.length} track sheets...`);
    
    // For each vehicle group, create a track sheet
    setTimeout(() => {
      toast.dismiss();
      
      // Navigate to the first vehicle's track sheet
      const firstVehicle = ordersByVehicle[vehicleIds[0]];
      
      navigate('/track-sheet', { 
        state: { 
          fromOrder: true, 
          vehicleId: firstVehicle.vehicleId,
          salesmanId: firstVehicle.salesmanId,
          items: firstVehicle.orders.flatMap(o => o.items),
          date: new Date(),
          isGrouped: true,
          orderIds: firstVehicle.orders.map(o => o.id),
          moreSheets: vehicleIds.length > 1
        } 
      });
      
      toast.success(`${ordersToConvert.length} orders converted to ${vehicleIds.length} track sheets!`, {
        description: vehicleIds.length > 1 
          ? "Multiple track sheets created. You can switch between them."
          : "Track sheet created successfully.",
        action: {
          label: "View Sheets",
          onClick: () => navigate('/track-sheet-history')
        }
      });
      
      if (onConvert) onConvert();
      setConverting(false);
      setSelectedOrders([]);
    }, 1800);
  };

  // Content for single order view
  if (order) {
    const vehicle = vehicles.find(v => v.id === order.vehicleId);
    const salesman = salesmen.find(s => s.id === order.salesmanId);
    
    return (
      <Card className="my-4 overflow-hidden border border-border/80 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
        
        <CardHeader className="bg-card/80 backdrop-blur-sm border-b border-border/20">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Convert Order to Track Sheet
          </CardTitle>
          <CardDescription>
            Create a distribution track sheet from this order
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 relative">
          <div className="space-y-4">
            <div className="rounded-md bg-primary/10 p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-lg">Order #{order.id.slice(-5)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>{vehicle ? vehicle.name : 'Not assigned'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">
                      {order.items.length} Items
                    </Badge>
                    {salesman && (
                      <Badge variant="outline" className="bg-secondary/5 border-secondary/20">
                        {salesman.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {(!order.vehicleId || !order.salesmanId) ? (
              <div className="rounded-md bg-amber-500/10 p-4 flex items-start gap-3 border border-amber-500/20">
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
                className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
                onClick={handleConvertSingleOrder}
                disabled={converting || !order.vehicleId || !order.salesmanId}
              >
                {converting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Convert to Track Sheet
                  </>
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
    <Card className="my-4 overflow-hidden border border-border/80 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
      
      <CardHeader className="bg-card/80 backdrop-blur-sm border-b border-border/20">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Convert Orders to Track Sheets
            </CardTitle>
            <CardDescription>
              Create distribution track sheets from your orders
            </CardDescription>
          </div>
          
          {selectedOrders.length > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              {selectedOrders.length} Selected
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          {Object.keys(vehicleGroups).length === 0 ? (
            <div className="rounded-md bg-muted p-6 text-center border border-border/20">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="font-medium">No orders found that can be converted</p>
              <p className="text-sm text-muted-foreground mt-2">
                Orders must be assigned to both a vehicle and a salesman to be converted to track sheets.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/order-entry')}
              >
                Create New Order
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Batch selection controls */}
              {applicableOrders.length > 0 && (
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/20">
                  <div className="text-sm text-muted-foreground">
                    {selectedOrders.length} of {applicableOrders.length} orders selected
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrders(applicableOrders.map(o => o.id))}
                      disabled={converting || applicableOrders.length === 0}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrders([])}
                      disabled={converting || selectedOrders.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Order list with vehicle groups */}
              {Object.values(vehicleGroups).map(group => {
                const vehicle = vehicles.find(v => v.id === group.vehicleId);
                const uniqueSalesmenIds = [...new Set(group.orders.map(o => o.salesmanId))];
                const hasSalesmen = uniqueSalesmenIds.every(id => id);
                
                return (
                  <div key={group.vehicleId} className="rounded-md border border-border/60 bg-card/50 overflow-hidden">
                    <div className="bg-muted/50 p-4 border-b border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{vehicle ? vehicle.name : 'Unknown Vehicle'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.orders.length} Order{group.orders.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={() => handleConvertVehicleOrders(group.vehicleId)}
                        disabled={converting || !hasSalesmen}
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
                      >
                        {converting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Convert All
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="divide-y divide-border/40">
                      {group.orders.map(order => {
                        const salesman = salesmen.find(s => s.id === order.salesmanId);
                        const isSelected = selectedOrders.includes(order.id);
                        
                        return (
                          <div 
                            key={order.id} 
                            className={`p-4 transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                            onClick={() => handleToggleSelectOrder(order.id)}
                          >
                            <div className="flex items-center gap-3 cursor-pointer">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Order #{order.id.slice(-5)}</span>
                                  <Badge variant="outline" className={`${isSelected ? 'border-primary bg-primary/5' : 'border-muted bg-muted/20'}`}>
                                    {order.items.length} items
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(order.date), 'MMM dd, yyyy')}
                                  </div>
                                  
                                  {salesman && (
                                    <div>
                                      Salesman: {salesman.name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
      
      {selectedOrders.length > 0 && (
        <CardFooter className="border-t border-border/20 bg-card/80 backdrop-blur-sm flex justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
          </p>
          <Button
            onClick={handleConvertSelectedOrders}
            disabled={converting}
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
          >
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                Create Track Sheet{selectedOrders.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
