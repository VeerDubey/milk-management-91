
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, FileText, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, orders, payments } = useData();
  
  const customer = customers.find(c => c.id === id);
  const customerOrders = orders.filter(o => o.customerId === id);
  const customerPayments = payments.filter(p => p.customerId === id);
  
  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gradient-moody">Customer Not Found</h1>
          <Button onClick={() => navigate('/customer-list')} className="mt-4 moody-button">
            Back to Customer List
          </Button>
        </div>
      </div>
    );
  }

  const totalOrders = customerOrders.length;
  const totalOrderValue = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalPayments = customerPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const outstandingAmount = totalOrderValue - totalPayments;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customer-list')}
          className="hover:bg-primary/20 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-moody">{customer.name}</h1>
          <p className="text-muted-foreground">Customer Details & History</p>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{totalOrders}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-8 w-8 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-secondary">₹{totalOrderValue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Order Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">₹{totalPayments.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">₹{outstandingAmount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Outstanding</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3 moody-card">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="moody-card">
            <CardHeader>
              <CardTitle className="text-gradient-moody">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Name</div>
                      <div className="text-muted-foreground">{customer.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-muted-foreground">{customer.phone || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">{customer.email || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-success mt-1" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-muted-foreground">{customer.address || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-warning" />
                    <div>
                      <div className="font-medium">Customer Since</div>
                      <div className="text-muted-foreground">
                        {customer.lastPaymentDate ? format(new Date(customer.lastPaymentDate), 'PPP') : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="moody-card">
            <CardHeader>
              <CardTitle className="text-gradient-moody">Order History</CardTitle>
              <CardDescription>All orders placed by this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="moody-table">
                <TableHeader className="moody-table-header">
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.map((order) => (
                    <TableRow key={order.id} className="moody-table-row">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{format(new Date(order.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{order.items?.length || 0} items</TableCell>
                      <TableCell>₹{(order.total || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`status-${order.status || 'pending'}`}>
                          {order.status || 'pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="moody-card">
            <CardHeader>
              <CardTitle className="text-gradient-moody">Payment History</CardTitle>
              <CardDescription>All payments received from this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="moody-table">
                <TableHeader className="moody-table-header">
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayments.map((payment) => (
                    <TableRow key={payment.id} className="moody-table-row">
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{format(new Date(payment.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>₹{(payment.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>{payment.paymentMethod || 'Cash'}</TableCell>
                      <TableCell>
                        <Badge className="status-completed">
                          Completed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
