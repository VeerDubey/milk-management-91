
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Calendar, 
  Package, 
  User,
  ArrowUpDown,
  Eye,
  Edit,
  Trash,
  FileText,
  MoreHorizontal
} from 'lucide-react';

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function Orders() {
  const { orders, customers, deleteOrder } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Enhance orders with customer names
  const ordersWithCustomerNames = orders.map(order => {
    const customer = customers.find(c => c.id === order.customerId);
    return {
      ...order,
      customerName: customer ? customer.name : 'Unknown Customer'
    };
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Filter orders based on search term
  const filteredOrders = ordersWithCustomerNames.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.date.includes(searchTerm) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const fieldA = a[sortBy as keyof typeof a];
    const fieldB = b[sortBy as keyof typeof b];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }
    return 0;
  });

  const handleDeleteOrder = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteOrder(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300">Paid</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-300">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your customer orders</p>
        </div>
        <Button onClick={() => navigate('/order-entry')}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>Orders</CardTitle>
          <div className="ml-auto w-64 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortBy === 'customerName' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.length > 0 ? (
                  sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {order.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                          {order.id.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          {order.customerName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{(order.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/edit/${order.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/invoices/create/${order.id}`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive" 
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm 
                        ? "No orders match your search criteria."
                        : "No orders found. Create your first order to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
