
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Eye, 
  MoreHorizontal, 
  FileText, 
  Truck, 
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Order } from '@/types';

export default function OrderHistory() {
  const { orders, customers, products, createTrackSheetFromOrder } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateTrackSheetDialog, setShowCreateTrackSheetDialog] = useState(false);
  const [isCreatingTrackSheet, setIsCreatingTrackSheet] = useState(false);

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const customerName = customer?.name || order.customerName || '';
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTrackSheet = async () => {
    if (!selectedOrder) return;
    
    setIsCreatingTrackSheet(true);
    try {
      const trackSheet = createTrackSheetFromOrder(selectedOrder.id);
      if (trackSheet) {
        toast.success('Track sheet created successfully');
        setShowCreateTrackSheetDialog(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error creating track sheet:', error);
      toast.error('Failed to create track sheet');
    } finally {
      setIsCreatingTrackSheet(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">View and manage all orders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Complete history of all orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                const customerName = customer?.name || order.customerName || 'Unknown Customer';
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{customerName}</TableCell>
                    <TableCell>
                      {format(new Date(order.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell>₹{(order.total || order.totalAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status || 'pending')}>
                        {order.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(order.paymentStatus || 'pending')}>
                        {order.paymentStatus || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCreateTrackSheetDialog(true);
                            }}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Create Track Sheet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Track Sheet Dialog */}
      <Dialog open={showCreateTrackSheetDialog} onOpenChange={setShowCreateTrackSheetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Track Sheet</DialogTitle>
            <DialogDescription>
              Create a track sheet from order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>This will create a new track sheet based on the items in this order.</p>
            {selectedOrder && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h4 className="font-medium">Order Details:</h4>
                <p>Order ID: {selectedOrder.id}</p>
                <p>Items: {selectedOrder.items?.length || 0}</p>
                <p>Total: ₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateTrackSheetDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTrackSheet}
              disabled={isCreatingTrackSheet}
            >
              {isCreatingTrackSheet ? 'Creating...' : 'Create Track Sheet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
