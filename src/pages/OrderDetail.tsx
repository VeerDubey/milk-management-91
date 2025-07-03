import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileText, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, customers, products } = useData();

  const order = orders.find(o => o.id === id);
  const customer = order ? customers.find(c => c.id === order.customerId) : null;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-semibold">Order Not Found</h2>
        <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Order details sent to printer');
  };

  const handleDownload = () => {
    // Mock download functionality
    toast.success('Order details downloaded');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={() => navigate(`/orders/edit/${order.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
          <Button onClick={() => navigate(`/invoices/create/${order.id}`)}>
            <FileText className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p className="text-lg">{format(new Date(order.date), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <div className="mt-1">{getPaymentStatusBadge(order.paymentStatus)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold text-primary">₹{(order.total || 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            {customer ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{customer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{customer.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Area</p>
                  <p>{customer.area || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Customer information not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={index} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ₹{item.rate?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.quantity * (item.rate || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">₹{(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No items found for this order</p>
          )}
        </CardContent>
      </Card>

      {order.notes && (
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}