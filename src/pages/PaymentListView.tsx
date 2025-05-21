import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useData } from '@/contexts/data/DataContext';
import { Payment } from '@/types';
import { 
  Plus, 
  Search, 
  Calendar, 
  Check, 
  AlertCircle, 
  Download, 
  Printer, 
  MoreVertical, 
  FileText, 
  Filter,
  ArrowUpDown,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToPdf } from '@/utils/pdfUtils';

// Augment the Payment type
interface ExtendedPayment extends Payment {
  status?: string;
  referenceNumber?: string;
  paymentMethod?: string;
}

export default function PaymentListView() {
  const { payments, customers, deletePayment, deleteMultiplePayments } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortColumn, setSortColumn] = useState<string>('date');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort payments
  const filteredPayments = (payments as ExtendedPayment[])
    .filter(payment => {
      const customerName = customers.find(c => c.id === payment.customerId)?.name || '';
      const matchesSearch = 
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.amount.toString().includes(searchQuery);
      
      const matchesStatus = !statusFilter || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortColumn === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime() 
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortColumn === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else if (sortColumn === 'customerName') {
        const nameA = customers.find(c => c.id === a.customerId)?.name || '';
        const nameB = customers.find(c => c.id === b.customerId)?.name || '';
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      }
      return 0;
    });

  // Handle payment selection
  const togglePaymentSelection = (id: string) => {
    setSelectedPayments(prev => 
      prev.includes(id) 
        ? prev.filter(paymentId => paymentId !== id) 
        : [...prev, id]
    );
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedPayments.length === 0) {
      toast.error("No payments selected");
      return;
    }
    
    deleteMultiplePayments(selectedPayments);
    setSelectedPayments([]);
  };

  // Handle export PDF
  const handleExportPdf = () => {
    const headers = ["Date", "Customer", "Amount", "Status", "Method", "Reference"];
    
    const rows = filteredPayments.map(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      return [
        format(new Date(payment.date), 'dd/MM/yyyy'),
        customer ? customer.name : 'Unknown',
        formatCurrency(payment.amount),
        payment.status || 'completed',
        payment.paymentMethod || 'cash',
        payment.referenceNumber || '-'
      ];
    });
    
    exportToPdf(headers, rows, {
      title: 'Payment List',
      subtitle: `Generated on ${format(new Date(), 'dd/MM/yyyy')}`,
      filename: `payment-list-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    });
    
    toast.success("PDF exported successfully");
  };

  // Handle print
  const handlePrint = () => {
    // Prepare a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Could not open print window. Please allow popups.");
      return;
    }
    
    const customerMap = new Map(customers.map(c => [c.id, c.name]));
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
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
            <h1>Payment List</h1>
            <div class="print-date">Generated: ${format(new Date(), 'PPP')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.map(payment => `
                <tr>
                  <td>${format(new Date(payment.date), 'dd/MM/yyyy')}</td>
                  <td>${customerMap.get(payment.customerId) || 'Unknown'}</td>
                  <td>${formatCurrency(payment.amount)}</td>
                  <td>${payment.status || 'completed'}</td>
                  <td>${payment.paymentMethod || 'cash'}</td>
                  <td>${payment.referenceNumber || '-'}</td>
                </tr>
              `).join('')}
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
    
    // Automatically trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500"><Check className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Calendar className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><AlertCircle className="mr-1 h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">Manage and track all customer payments</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/payment-create')} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} payments recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const now = new Date();
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              const monthlyTotal = payments
                .filter(p => new Date(p.date) >= startOfMonth)
                .reduce((sum, payment) => sum + payment.amount, 0);
                
              return (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(monthlyTotal)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(startOfMonth, 'MMMM yyyy')}
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportPdf} className="flex-1">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            {selectedPayments.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedPayments.length})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value === "" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedPayments.length > 0 && selectedPayments.length === filteredPayments.length}
                  onChange={() => {
                    if (selectedPayments.length === filteredPayments.length) {
                      setSelectedPayments([]);
                    } else {
                      setSelectedPayments(filteredPayments.map(p => p.id));
                    }
                  }}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortColumn === 'date' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center">
                  Customer
                  {sortColumn === 'customerName' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount
                  {sortColumn === 'amount' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const customer = customers.find(c => c.id === payment.customerId);
                return (
                  <TableRow key={payment.id} className="hover:bg-muted/50">
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => togglePaymentSelection(payment.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(payment.date), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{customer ? customer.name : 'Unknown'}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status || 'completed')}</TableCell>
                    <TableCell>
                      {payment.paymentMethod || 'Cash'}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => navigate(`/payment/${payment.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              deletePayment(payment.id);
                              toast.success("Payment deleted successfully");
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
    </div>
  );
}
