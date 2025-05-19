
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  User, 
  Calendar, 
  Filter, 
  MapPin, 
  Package, 
  ClipboardList,
  Search,
  FileSpreadsheet
} from "lucide-react";
import { TrackSheetConverter } from '@/components/track-sheet/TrackSheetConverter';

export default function OrderList() {
  const { orders, customers, products, vehicles, salesmen, updateOrder } = useData();
  const { toast } = useToast();
  
  // State for filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    salesmanId: '',
    vehicleId: '',
    dateRange: '',
    status: ''
  });
  
  // State for expanded order details
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  // State to control the visibility of TrackSheet conversion UI
  const [showTrackSheetConverter, setShowTrackSheetConverter] = useState(false);

  // Filter orders based on criteria
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Get customer name for search
      const customer = customers.find(c => 
        order.items.some(item => item.customerId === c.id)
      );
      const customerName = customer?.name.toLowerCase() || '';
      
      // Search filter
      if (filters.searchTerm && 
          !customerName.includes(filters.searchTerm.toLowerCase()) &&
          !order.id.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Salesman filter
      if (filters.salesmanId && order.salesmanId !== filters.salesmanId) {
        return false;
      }
      
      // Vehicle filter
      if (filters.vehicleId && order.vehicleId !== filters.vehicleId) {
        return false;
      }
      
      // Date range filter - simplified for now
      if (filters.dateRange) {
        const today = new Date();
        const orderDate = new Date(order.date);
        
        if (filters.dateRange === 'today' && 
            orderDate.getDate() !== today.getDate()) {
          return false;
        }
        
        if (filters.dateRange === 'week' && 
            orderDate < new Date(today.setDate(today.getDate() - 7))) {
          return false;
        }
        
        if (filters.dateRange === 'month' && 
            orderDate < new Date(today.setMonth(today.getMonth() - 1))) {
          return false;
        }
      }
      
      return true;
    });
  }, [orders, customers, filters]);

  // Handlers for assignment
  const handleAssignVehicle = (orderId: string, vehicleId: string) => {
    updateOrder(orderId, { vehicleId });
    toast({
      title: "Vehicle Assigned",
      description: "Order has been assigned to the selected vehicle",
    });
  };
  
  const handleAssignSalesman = (orderId: string, salesmanId: string) => {
    updateOrder(orderId, { salesmanId });
    toast({
      title: "Salesman Assigned",
      description: "Order has been assigned to the selected salesman",
    });
  };
  
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  
  // Helper function to get product and customer details
  const getOrderDetails = (order) => {
    const orderItems = order.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const customer = customers.find(c => c.id === item.customerId);
      return {
        product,
        customer,
        quantity: item.quantity
      };
    });
    
    return orderItems;
  };
  
  // Helper to get total quantity and amount
  const calculateOrderTotals = (order) => {
    let totalQuantity = 0;
    let totalAmount = 0;
    
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalQuantity += item.quantity;
        totalAmount += item.quantity * product.price;
      }
    });
    
    return { totalQuantity, totalAmount };
  };
  
  // Get assignment status
  const getAssignmentStatus = (order) => {
    if (order.vehicleId && order.salesmanId) return 'fully-assigned';
    if (order.vehicleId || order.salesmanId) return 'partially-assigned';
    return 'unassigned';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order List</h1>
          <p className="text-muted-foreground">
            Manage and assign orders to vehicles and salesmen
          </p>
        </div>
        <Button
          onClick={() => setShowTrackSheetConverter(!showTrackSheetConverter)}
          className="flex items-center"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {showTrackSheetConverter ? "Hide Track Sheet Converter" : "Convert to Track Sheet"}
        </Button>
      </div>
      
      {showTrackSheetConverter && (
        <TrackSheetConverter onConvert={() => setShowTrackSheetConverter(false)} />
      )}
      
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders..." 
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="flex-1"
              />
            </div>
            
            <Select 
              value={filters.vehicleId} 
              onValueChange={(value) => setFilters({...filters, vehicleId: value})}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>{filters.vehicleId ? 'Vehicle: ' + (vehicles.find(v => v.id === filters.vehicleId)?.name || 'Selected') : 'All Vehicles'}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.regNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.salesmanId} 
              onValueChange={(value) => setFilters({...filters, salesmanId: value})}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{filters.salesmanId ? 'Salesman: ' + (salesmen.find(s => s.id === filters.salesmanId)?.name || 'Selected') : 'All Salesmen'}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salesmen</SelectItem>
                {salesmen.map(salesman => (
                  <SelectItem key={salesman.id} value={salesman.id}>
                    {salesman.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters({...filters, dateRange: value})}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{filters.dateRange ? 
                    filters.dateRange === 'today' ? 'Today' : 
                    filters.dateRange === 'week' ? 'This Week' : 
                    'This Month' : 'All Time'}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={() => setFilters({
                searchTerm: '',
                salesmanId: '',
                vehicleId: '',
                dateRange: '',
                status: ''
              })}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const { totalQuantity, totalAmount } = calculateOrderTotals(order);
                const assignmentStatus = getAssignmentStatus(order);
                // Get primary customer from first item
                const firstItem = order.items[0];
                const primaryCustomer = customers.find(c => c.id === firstItem?.customerId);
                
                // Get assigned entities
                const assignedVehicle = vehicles.find(v => v.id === order.vehicleId);
                const assignedSalesman = salesmen.find(s => s.id === order.salesmanId);
                
                return (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{primaryCustomer?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        ₹{totalAmount.toFixed(2)}
                        <div className="text-xs text-muted-foreground">
                          {totalQuantity} items
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          assignmentStatus === 'fully-assigned' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          assignmentStatus === 'partially-assigned' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                          'bg-red-100 text-red-800 hover:bg-red-200'
                        }>
                          {assignmentStatus === 'fully-assigned' ? 'Fully Assigned' :
                           assignmentStatus === 'partially-assigned' ? 'Partially Assigned' :
                           'Unassigned'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleOrderDetails(order.id)}
                          >
                            {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                          </Button>
                          
                          {assignmentStatus === 'fully-assigned' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                              onClick={() => {
                                setShowTrackSheetConverter(true);
                                setExpandedOrder(order.id);
                              }}
                            >
                              <FileSpreadsheet className="mr-1 h-3 w-3" />
                              To Sheet
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row */}
                    {expandedOrder === order.id && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={6} className="p-4">
                          <div className="space-y-4">
                            {/* Order Details */}
                            <div>
                              <h4 className="font-medium mb-2">Order Items</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getOrderDetails(order).map((detail, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{detail.product?.name || 'Unknown Product'}</TableCell>
                                      <TableCell>{detail.customer?.name || 'Unknown Customer'}</TableCell>
                                      <TableCell>{detail.quantity} {detail.product?.unit || 'units'}</TableCell>
                                      <TableCell>₹{(detail.quantity * (detail.product?.price || 0)).toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            
                            {/* Track Sheet Conversion for expanded order */}
                            {expandedOrder === order.id && showTrackSheetConverter && (
                              <TrackSheetConverter 
                                orderId={order.id} 
                                onConvert={() => {
                                  setExpandedOrder(null);
                                  setShowTrackSheetConverter(false);
                                }}
                              />
                            )}
                            
                            {/* Assignment Section */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Vehicle Assignment */}
                              <div>
                                <h4 className="font-medium mb-2 flex items-center">
                                  <Truck className="mr-2 h-4 w-4" />
                                  Vehicle Assignment
                                </h4>
                                <div className="flex space-x-2 items-center">
                                  <select 
                                    className="border rounded p-2 flex-1"
                                    value={order.vehicleId || 'none'}
                                    onChange={(e) => handleAssignVehicle(order.id, e.target.value === 'none' ? '' : e.target.value)}
                                  >
                                    <option value="none">Select Vehicle</option>
                                    {vehicles.filter(v => v.isActive).map(vehicle => (
                                      <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.name} ({vehicle.regNumber})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {assignedVehicle && (
                                  <div className="mt-2 p-2 bg-primary/5 rounded">
                                    <p className="text-sm">
                                      <span className="font-medium">Assigned to:</span> {assignedVehicle.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Reg: {assignedVehicle.regNumber} | Type: {assignedVehicle.type}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Salesman Assignment */}
                              <div>
                                <h4 className="font-medium mb-2 flex items-center">
                                  <User className="mr-2 h-4 w-4" />
                                  Salesman Assignment
                                </h4>
                                <div className="flex space-x-2 items-center">
                                  <select 
                                    className="border rounded p-2 flex-1"
                                    value={order.salesmanId || 'none'}
                                    onChange={(e) => handleAssignSalesman(order.id, e.target.value === 'none' ? '' : e.target.value)}
                                  >
                                    <option value="none">Select Salesman</option>
                                    {salesmen.filter(s => s.isActive).map(salesman => (
                                      <option key={salesman.id} value={salesman.id}>
                                        {salesman.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {assignedSalesman && (
                                  <div className="mt-2 p-2 bg-primary/5 rounded">
                                    <p className="text-sm">
                                      <span className="font-medium">Assigned to:</span> {assignedSalesman.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Phone: {assignedSalesman.phone}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No orders found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
