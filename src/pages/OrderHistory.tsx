import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToPdf } from '@/utils/pdfUtils';
import { v4 as uuidv4 } from 'uuid';
import { 
  ArrowDown, 
  Calendar, 
  Clock, 
  Download, 
  Edit, 
  FileText, 
  Filter, 
  History, 
  MoreVertical, 
  Plus, 
  Printer, 
  Search, 
  User 
} from 'lucide-react';
import { Order, TrackSheet, TrackSheetRow } from '@/types';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { orders, customers, products, deleteOrder, addTrackSheet, trackSheets } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCarryForwardDialogOpen, setIsCarryForwardDialogOpen] = useState(false);
  
  // Calculate some stats
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId);
      return itemSum + (item.quantity * (product?.price || 0));
    }, 0);
  }, 0);
  
  // Filter orders based on search query and date filter
  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const customerName = customer ? customer.name.toLowerCase() : '';
    
    // Search filter
    const matchesSearch = 
      customerName.includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);
      matchesDate = orderDate.getTime() === today.getTime();
    } else if (dateFilter === 'week') {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      const orderDate = new Date(order.date);
      matchesDate = orderDate >= weekAgo && orderDate <= today;
    } else if (dateFilter === 'month') {
      const today = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      const orderDate = new Date(order.date);
      matchesDate = orderDate >= monthAgo && orderDate <= today;
    }
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Function to calculate order total
  const calculateOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (item.quantity * (product?.price || 0));
    }, 0);
  };

  // Function to export orders as PDF
  const handleExportPdf = () => {
    const headers = ["Date", "Order ID", "Customer", "Items", "Total"];
    
    const rows = filteredOrders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      const total = calculateOrderTotal(order);
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
      
      return [
        format(new Date(order.date), 'dd/MM/yyyy'),
        order.id,
        customer ? customer.name : 'Unknown',
        `${itemCount} items`,
        `₹${total.toFixed(2)}`
      ];
    });
    
    exportToPdf(headers, rows, {
      title: 'Order History',
      subtitle: `Generated on ${format(new Date(), 'dd/MM/yyyy')}`,
      filename: `order-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    });
    
    toast.success("PDF exported successfully");
  };

  // Function to print orders
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Could not open print window. Please allow popups.");
      return;
    }
    
    const customerMap = new Map(customers.map(c => [c.id, c.name]));
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Order History</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; text-align: left; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            h1 { margin: 0; }
            .print-date { text-align: right; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order History</h1>
            <div class="print-date">Generated: ${format(new Date(), 'PPP')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => {
                const total = calculateOrderTotal(order);
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                
                return `
                  <tr>
                    <td>${format(new Date(order.date), 'dd/MM/yyyy')}</td>
                    <td>${order.id}</td>
                    <td>${customerMap.get(order.customerId) || 'Unknown'}</td>
                    <td>${itemCount} items</td>
                    <td>₹${total.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // Function to carry forward order to next day
  const handleCarryForward = () => {
    if (!selectedOrderId) return;
    
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
      toast.error("Order not found");
      return;
    }
    
    // Create a new track sheet based on the order
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const trackSheetRows: TrackSheetRow[] = order.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const quantities: Record<string, number | string> = {};
      quantities[product?.id || "unknown"] = item.quantity;
      
      return {
        name: product?.name || "Unknown Product",
        quantities: quantities,
        total: item.quantity,
        amount: item.quantity * (product?.price || 0)
      };
    });
    
    const newTrackSheet = {
      id: "", // This will be generated by addTrackSheet
      name: `Track Sheet - ${format(tomorrow, 'yyyy-MM-dd')}`,
      date: format(tomorrow, 'yyyy-MM-dd'),
      vehicleId: order.vehicleId || "",
      salesmanId: order.salesmanId || "",
      rows: trackSheetRows,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: `Created from order ${order.id}`
    };
    
    try {
      // Store the result in a variable first
      const result = addTrackSheet(newTrackSheet);
      setIsCarryForwardDialogOpen(false);
      setSelectedOrderId(null);
      
      toast.success("Order carried forward to next day's track sheet successfully");
      
      // Only navigate if there's a valid track sheet ID
      if (result && typeof result === 'object' && 'id' in result) {
        // Offer to navigate to the newly created track sheet
        setTimeout(() => {
          const shouldNavigate = window.confirm("Do you want to view the created track sheet?");
          if (shouldNavigate) {
            navigate(`/track-sheet/${result.id}`);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error creating track sheet:", error);
      toast.error("Failed to create track sheet");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">View and manage your order history</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/order-entry')} className="bg-gradient-primary hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From all orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {orders.length > 0
                    ? `Last order ${format(new Date(orders[0].date), 'dd MMM yyyy')}`
                    : "No recent orders"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center py-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="ml-4">
            <Select
              value={dateFilter}
              onValueChange={setDateFilter}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by date" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const customer = customers.find(c => c.id === order.customerId);
                    const total = calculateOrderTotal(order);
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {format(new Date(order.date), 'dd/MM/yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {customer ? customer.name : 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{itemCount} items</Badge>
                        </TableCell>
                        <TableCell>₹{total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/order/${order.id}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/order-edit/${order.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedOrderId(order.id);
                                setIsCarryForwardDialogOpen(true);
                              }}>
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Carry Forward
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this order?')) {
                                    deleteOrder(order.id);
                                    toast.success("Order deleted successfully");
                                  }
                                }}
                              >
                                <History className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders
                  .filter(order => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const orderDate = new Date(order.date);
                    orderDate.setHours(0, 0, 0, 0);
                    return orderDate.getTime() === today.getTime();
                  })
                  .map((order) => {
                    const customer = customers.find(c => c.id === order.customerId);
                    const total = calculateOrderTotal(order);
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          {format(new Date(order.date), 'HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{customer ? customer.name : 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{itemCount} items</Badge>
                        </TableCell>
                        <TableCell>₹{total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/order/${order.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Average Order Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Get the past 7 days
                  const days: { date: Date; orders: Order[] }[] = [];
                  
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    
                    const dayOrders = orders.filter(order => {
                      const orderDate = new Date(order.date);
                      orderDate.setHours(0, 0, 0, 0);
                      return orderDate.getTime() === date.getTime();
                    });
                    
                    days.push({ date, orders: dayOrders });
                  }
                  
                  return days.map((day, index) => {
                    const dayRevenue = day.orders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
                    const avgOrderValue = day.orders.length > 0 ? dayRevenue / day.orders.length : 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{format(day.date, 'EEE, dd MMM')}</TableCell>
                        <TableCell>{day.orders.length}</TableCell>
                        <TableCell>₹{dayRevenue.toFixed(2)}</TableCell>
                        <TableCell>₹{avgOrderValue.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Carry Forward Dialog */}
      <Dialog open={isCarryForwardDialogOpen} onOpenChange={setIsCarryForwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carry Forward Order</DialogTitle>
            <DialogDescription>
              This will create a new track sheet for tomorrow with the same items from this order.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderId && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to carry forward this order to tomorrow's track sheet?
              </p>
              
              <div className="mt-4">
                <div className="font-medium">Order Details</div>
                {(() => {
                  const order = orders.find(o => o.id === selectedOrderId);
                  if (!order) return null;
                  
                  const customer = customers.find(c => c.id === order.customerId);
                  const total = calculateOrderTotal(order);
                  
                  return (
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span>{order.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span>{customer ? customer.name : 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{format(new Date(order.date), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCarryForward}>
              <ArrowDown className="mr-2 h-4 w-4" /> Carry Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
