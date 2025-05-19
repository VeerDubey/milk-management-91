
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Edit, ArrowLeft, Phone, Mail, MapPin, FileText, Download } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, orders, payments } = useData();
  const [activeTab, setActiveTab] = useState('info');

  const customer = customers.find((c) => c.id === id);

  // Get orders for this customer
  const customerOrders = orders.filter(order => order.customerId === id);
  
  // Get payments for this customer
  const customerPayments = payments.filter(payment => payment.customerId === id);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h1 className="text-2xl font-bold">Customer Not Found</h1>
        <p className="text-muted-foreground mb-4">The customer you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
          {customer.isActive ? (
            <Badge className="ml-2">Active</Badge>
          ) : (
            <Badge variant="outline" className="ml-2">Inactive</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/customer-ledger/${id}`)}>
            <FileText className="mr-2 h-4 w-4" />
            View Ledger
          </Button>
          <Button onClick={() => navigate(`/edit-customer/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Customer Info</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <div className="mt-2 flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                    <span>{customer.address}</span>
                  </div>
                </div>
                
                {customer.area && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Area</h3>
                    <div className="mt-2">
                      <Badge variant="outline">{customer.area}</Badge>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Financial Summary</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Outstanding Balance:</span>
                      <span className="font-medium">₹{customer.outstandingBalance || 0}</span>
                    </div>
                    
                    {customer.lastPaymentDate && (
                      <div className="flex justify-between">
                        <span>Last Payment:</span>
                        <span className="font-medium">₹{customer.lastPaymentAmount || 0} on {customer.lastPaymentDate}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Total Orders:</span>
                      <span className="font-medium">{customerOrders.length}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Total Payments:</span>
                      <span className="font-medium">{customerPayments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>All orders placed by this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {customerOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>₹{order.total || 0}</TableCell>
                        <TableCell>
                          <Badge>{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/order-detail/${order.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No orders found for this customer.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payments made by this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {customerPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>₹{payment.amount}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/payment-detail/${payment.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No payments found for this customer.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
