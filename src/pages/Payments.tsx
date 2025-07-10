
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CreditCard, Calendar, TrendingUp } from "lucide-react";
import { PaymentDialog } from "@/components/payment/PaymentDialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Payments() {
  const { payments, customers } = useData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = payments.filter((payment) => {
    const customer = customers.find(c => c.id === payment.customerId);
    return customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           payment.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           payment.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const todaysPayments = payments.filter(p => 
    format(new Date(p.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage customer payments
          </p>
        </div>
        <PaymentDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">₹{totalPayments.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Payments</p>
                <p className="text-2xl font-bold text-green-500">₹{todaysPayments.toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-500">{completedPayments}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-500">{pendingPayments}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View all customer payment transactions
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => {
                    const customer = customers.find(c => c.id === payment.customerId);
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {customer?.name || 'Unknown Customer'}
                        </TableCell>
                        <TableCell>{payment.method || payment.paymentMethod}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.referenceNumber || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(payment.status)}>
                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchQuery ? 'No payments found matching your search.' : 'No payments recorded yet. Click "Record Payment" to get started.'}
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
