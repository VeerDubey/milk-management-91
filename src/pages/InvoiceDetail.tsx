
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '@/contexts/InvoiceContext';
import { useData } from '@/contexts/data/DataContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  Edit, 
  Printer, 
  Clock, 
  Check, 
  Calendar, 
  FileText, 
  User, 
  CreditCard 
} from 'lucide-react';
import { format } from 'date-fns';
import InvoiceDownloadButton from '@/components/invoices/InvoiceDownloadButton';
import { toast } from 'sonner';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoiceById, downloadInvoice } = useInvoices();
  const { customers, products } = useData();
  const [activeTab, setActiveTab] = useState('details');
  
  const invoice = getInvoiceById(id || '');
  const customer = invoice?.customerId ? customers.find(c => c.id === invoice.customerId) : undefined;
  
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h1 className="text-2xl font-bold">Invoice Not Found</h1>
        <p className="text-muted-foreground mb-4">The invoice you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500">Sent</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const markAsPaid = () => {
    // In a real app, this would update the invoice status
    toast.success("Invoice marked as paid");
  };
  
  const sendInvoice = () => {
    // In a real app, this would send the invoice to the customer
    toast.success("Invoice sent to customer");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice #{invoice.invoiceNumber || invoice.id}</h1>
            <p className="text-muted-foreground">
              {invoice.date && format(new Date(invoice.date), 'PPP')}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/invoice-edit/${invoice.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={sendInvoice}>
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <InvoiceDownloadButton invoiceId={invoice.id} />
          
          {invoice.status !== 'paid' && (
            <Button onClick={markAsPaid}>
              <Check className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              {getStatusBadge(invoice.status)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{invoice.dueDate ? format(new Date(invoice.dueDate), 'PPP') : 'Not set'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">{formatCurrency(invoice.total || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="customer">Customer Info</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {invoice.items && invoice.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product?.name || `Product ${item.productId}`}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <div className="space-y-2 text-right">
                <div className="flex justify-between w-[250px]">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.total || 0)}</span>
                </div>
                
                {invoice.taxRate && (
                  <div className="flex justify-between w-[250px]">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{formatCurrency((invoice.total || 0) * (invoice.taxRate / 100))}</span>
                  </div>
                )}
                
                {invoice.discount && (
                  <div className="flex justify-between w-[250px]">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                
                {invoice.shipping && (
                  <div className="flex justify-between w-[250px]">
                    <span>Shipping:</span>
                    <span>{formatCurrency(invoice.shipping)}</span>
                  </div>
                )}
                
                <div className="flex justify-between w-[250px] font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total || 0)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-muted-foreground">{customer.address}</p>
                    </div>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center space-x-4">
                      <ArrowLeft className="h-5 w-5 text-transparent" />
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Phone:</span>
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {customer.email && (
                    <div className="flex items-center space-x-4">
                      <ArrowLeft className="h-5 w-5 text-transparent" />
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Email:</span>
                        <span>{customer.email}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/customer-detail/${customer.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Customer Details
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Customer information not available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Timeline of changes to this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Invoice Created</h3>
                    <p className="text-muted-foreground">{invoice.date && format(new Date(invoice.date), 'PPP')} at {invoice.date && format(new Date(invoice.date), 'p')}</p>
                  </div>
                </div>
                
                {invoice.status === 'sent' && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Send className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Invoice Sent</h3>
                      <p className="text-muted-foreground">The invoice was sent to the customer</p>
                    </div>
                  </div>
                )}
                
                {invoice.status === 'paid' && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Payment Received</h3>
                      <p className="text-muted-foreground">The invoice has been paid</p>
                    </div>
                  </div>
                )}
                
                {/* Empty state if no history */}
                {invoice.status === 'draft' && (
                  <p className="text-muted-foreground text-center py-4">No additional history available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
