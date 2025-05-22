
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TrackSheetRow } from '@/types';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  FileText,
  Calendar,
  ArrowDownUp,
  Filter,
  Download,
  Users,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { exportToPdf } from '@/utils/pdfUtils';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { orders, customers, products, addTrackSheet } = useData();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Handle order selection
  const toggleOrderSelection = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };
  
  // Handle select all orders
  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  // Add type checking for the return value of addTrackSheet
  const handleCreateTrackSheet = () => {
    if (!selectedOrders.length) {
      toast.error("Please select at least one order");
      return;
    }

    // Create track sheet rows from orders
    const trackSheetRows = selectedOrders.map((orderId) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return null;

      const customer = customers.find((c) => c.id === order.customerId);
      if (!customer) return null;

      // Map order items to quantities
      const quantities: Record<string, number | string> = {};
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          quantities[product.name] = item.quantity;
        }
      });

      return {
        name: customer.name,
        customerId: customer.id,
        quantities,
        total: order.total || 0,
        amount: order.total || 0,
      };
    }).filter(Boolean) as TrackSheetRow[];

    // Create track sheet with the tracksheet data
    const trackSheetData = {
      name: `Track Sheet - ${format(new Date(), "dd/MM/yyyy")}`,
      date: format(new Date(), "yyyy-MM-dd"),
      rows: trackSheetRows,
      notes: "Created from orders",
    };

    try {
      const newTrackSheet = addTrackSheet(trackSheetData);
      
      if (newTrackSheet && newTrackSheet.id) {
        toast.success("Track sheet created successfully");
        navigate(`/track-sheet/${newTrackSheet.id}`);
      } else {
        toast.error("Failed to create track sheet");
      }
    } catch (error) {
      console.error("Error creating track sheet:", error);
      toast.error("Failed to create track sheet");
    }
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search term filter
    const searchMatch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customers.find(c => c.id === order.customerId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Customer filter
    const customerMatch = !filterCustomer || order.customerId === filterCustomer;
    
    // Date filter
    const dateMatch = !filterDate || 
      (order.date && new Date(order.date).toDateString() === filterDate.toDateString());
    
    return searchMatch && customerMatch && dateMatch;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'date':
        return direction * (new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
      case 'customer':
        const customerA = customers.find(c => c.id === a.customerId)?.name || '';
        const customerB = customers.find(c => c.id === b.customerId)?.name || '';
        return direction * customerA.localeCompare(customerB);
      case 'total':
        return direction * ((a.total || 0) - (b.total || 0));
      default:
        return 0;
    }
  });
  
  // Export orders to PDF
  const handleExportOrders = () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order to export");
      return;
    }
    
    const ordersToExport = sortedOrders.filter(order => selectedOrders.includes(order.id));
    
    const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total'];
    const rows = ordersToExport.map(order => [
      order.id,
      order.date || '',
      customers.find(c => c.id === order.customerId)?.name || order.customerName || '',
      order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return `${item.quantity} x ${product?.name || 'Unknown Product'}`;
      }).join(', '),
      `₹${order.total?.toFixed(2) || '0.00'}`
    ]);
    
    exportToPdf(headers, rows, {
      title: 'Order History',
      subtitle: `Generated on ${format(new Date(), 'PPP')}`,
      filename: `orders-export-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    });
    
    toast.success(`Exported ${selectedOrders.length} orders to PDF`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">View and manage order history</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportOrders} 
            disabled={selectedOrders.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Selected
          </Button>
          <Button 
            onClick={handleCreateTrackSheet} 
            disabled={selectedOrders.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            Create Track Sheet
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              View, filter and manage orders
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Label>Filter by customer:</Label>
                <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Customers</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Filter by date:</Label>
                <DatePicker
                  date={filterDate}
                  onSelect={setFilterDate}
                  placeholder="Select date"
                />
                {filterDate && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFilterDate(undefined)}
                    className="h-8 w-8"
                  >
                    ✕
                  </Button>
                )}
              </div>
              {(filterCustomer || filterDate) && (
                <Button variant="ghost" onClick={() => {
                  setFilterCustomer('');
                  setFilterDate(undefined);
                }} size="sm">
                  Clear filters
                </Button>
              )}
            </div>
            
            <ScrollArea className="rounded-md border h-[calc(100vh-350px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={
                          filteredOrders.length > 0 && 
                          selectedOrders.length === filteredOrders.length
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all orders"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                        {sortBy === 'date' && (
                          <ArrowDownUp className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('customer')}
                    >
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Customer</span>
                        {sortBy === 'customer' && (
                          <ArrowDownUp className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Total</span>
                        {sortBy === 'total' && (
                          <ArrowDownUp className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedOrders.map(order => {
                      const customer = customers.find(c => c.id === order.customerId);
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                              aria-label={`Select order ${order.id}`}
                            />
                          </TableCell>
                          <TableCell>
                            {order.date ? format(new Date(order.date), 'PP') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {customer?.name || order.customerName || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {order.items.slice(0, 2).map((item, idx) => {
                                const product = products.find(p => p.id === item.productId);
                                return (
                                  <Badge key={idx} variant="outline">
                                    {item.quantity} x {product?.name || 'Unknown'}
                                  </Badge>
                                );
                              })}
                              {order.items.length > 2 && (
                                <Badge variant="outline">
                                  +{order.items.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{order.total?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {selectedOrders.length > 0 && (
              <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                <div>
                  <span className="font-medium">{selectedOrders.length}</span> orders selected
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedOrders([])}
                  >
                    Clear selection
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleCreateTrackSheet}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Create Track Sheet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;
