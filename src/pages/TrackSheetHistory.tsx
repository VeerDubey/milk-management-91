import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, subDays } from 'date-fns';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import {
  Search,
  FileText,
  Truck,
  Calendar,
  Download,
  FileDown,
  Filter,
  Eye,
} from 'lucide-react';

const TrackSheetHistory = () => {
  const { orders, customers, vehicles, salesmen } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterSalesman, setFilterSalesman] = useState('all');

  // Filter orders based on criteria
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Filter by date range
        if (dateRange.from && dateRange.to) {
          const orderDate = new Date(order.date);
          if (orderDate < dateRange.from || orderDate > dateRange.to) {
            return false;
          }
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const customerName = order.customerName?.toLowerCase() || '';
          const customerId = order.customerId?.toLowerCase() || '';
          const orderId = order.id?.toLowerCase() || '';

          if (
            !customerName.includes(query) &&
            !customerId.includes(query) &&
            !orderId.includes(query)
          ) {
            return false;
          }
        }

        // Filter by status
        if (filterStatus !== 'all' && order.status !== filterStatus) {
          return false;
        }

        // Filter by vehicle
        if (filterVehicle !== 'all' && order.vehicleId !== filterVehicle) {
          return false;
        }

        // Filter by salesman
        if (filterSalesman !== 'all' && order.salesmanId !== filterSalesman) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, searchQuery, dateRange, filterStatus, filterVehicle, filterSalesman]);

  // Generate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredOrders.length;
    const delivered = filteredOrders.filter((o) => o.status === 'delivered').length;
    const pending = filteredOrders.filter((o) => o.status === 'pending').length;
    const cancelled = filteredOrders.filter((o) => o.status === 'cancelled').length;
    const totalValue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      total,
      delivered,
      pending,
      cancelled,
      totalValue,
    };
  }, [filteredOrders]);

  // Get unique values for filters
  const uniqueVehicles = useMemo(() => {
    const vehicleIds = [...new Set(orders.map((o) => o.vehicleId).filter(Boolean))];
    return vehicleIds.map((id) => vehicles.find((v) => v.id === id)).filter(Boolean);
  }, [orders, vehicles]);

  const uniqueSalesmen = useMemo(() => {
    const salesmenIds = [...new Set(orders.map((o) => o.salesmanId).filter(Boolean))];
    return salesmenIds.map((id) => salesmen.find((s) => s.id === id)).filter(Boolean);
  }, [orders, salesmen]);

  // Handle view order details
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TrackSheet History</h1>
          <p className="text-muted-foreground">
            View and manage your past dispatch records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="default">
            <FileDown className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Value: ₹{summaryStats.totalValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.delivered}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryStats.total > 0
                ? `${Math.round((summaryStats.delivered / summaryStats.total) * 100)}% of total`
                : '0% of total'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{summaryStats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryStats.total > 0
                ? `${Math.round((summaryStats.pending / summaryStats.total) * 100)}% of total`
                : '0% of total'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{summaryStats.cancelled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryStats.total > 0
                ? `${Math.round((summaryStats.cancelled / summaryStats.total) * 100)}% of total`
                : '0% of total'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
            className="min-w-[300px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {uniqueVehicles.map((vehicle: any) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSalesman} onValueChange={setFilterSalesman}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by salesman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salesmen</SelectItem>
              {uniqueSalesmen.map((salesman: any) => (
                <SelectItem key={salesman.id} value={salesman.id}>
                  {salesman.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Salesman</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? 'Try adjusting your search or filters'
                          : 'No order history to display'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const vehicle = vehicles.find((v) => v.id === order.vehicleId);
                  const salesman = salesmen.find((s) => s.id === order.salesmanId);

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{format(parseISO(order.date), 'dd MMM yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-muted-foreground" />
                          <span>{vehicle ? vehicle.name : 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {salesman ? salesman.name : 'Not assigned'}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{order.total?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View order</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order ID: {selectedOrder.id} | Date:{' '}
                {format(parseISO(selectedOrder.date), 'dd MMM yyyy')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm">{selectedOrder.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customerId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Order Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit || 'pcs'}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{item.unitPrice?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{selectedOrder.total?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Vehicle</p>
                  <p className="text-sm">
                    {vehicles.find((v) => v.id === selectedOrder.vehicleId)?.name || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Salesman</p>
                  <p className="text-sm">
                    {salesmen.find((s) => s.id === selectedOrder.salesmanId)?.name || 'Not assigned'}
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <Button>Generate Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TrackSheetHistory;
