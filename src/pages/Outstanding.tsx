
import { useState, useMemo } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign, FileDown, Printer, Filter, Users, RefreshCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Outstanding() {
  const { customers, orders, payments } = useData();
  const [searchQuery, setSearchQuery] = useState("");

  const outstandingData = useMemo(() => {
    return customers.map(customer => {
      // Calculate total ordered
      const customerOrders = orders.filter(order => order.customerId === customer.id);
      const totalOrdered = customerOrders.reduce((sum, order) => sum + order.total, 0);
      
      // Calculate total paid
      const customerPayments = payments.filter(payment => payment.customerId === customer.id);
      const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate balance
      const outstandingBalance = totalOrdered - totalPaid;
      
      // Get last payment date
      let lastPaymentDate = null;
      if (customerPayments.length > 0) {
        const lastPayment = customerPayments.reduce((latest, payment) => {
          const paymentDate = new Date(payment.date);
          const latestDate = new Date(latest.date);
          return paymentDate > latestDate ? payment : latest;
        }, customerPayments[0]);
        lastPaymentDate = new Date(lastPayment.date);
      }
      
      // Get days since last payment
      let daysSincePayment = null;
      if (lastPaymentDate) {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastPaymentDate.getTime());
        daysSincePayment = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalOrdered,
        totalPaid,
        outstandingBalance,
        lastPaymentDate,
        daysSincePayment
      };
    }).filter(customer => {
      // Filter based on search query and only show customers with outstanding balance
      if (!searchQuery) return customer.outstandingBalance > 0; 
      
      const query = searchQuery.toLowerCase();
      return (
        customer.outstandingBalance > 0 &&
        (customer.name.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.toLowerCase().includes(query)))
      );
    }).sort((a, b) => b.outstandingBalance - a.outstandingBalance); // Sort by highest outstanding balance first
  }, [customers, orders, payments, searchQuery]);
  
  const totalOutstanding = outstandingData.reduce((sum, customer) => sum + customer.outstandingBalance, 0);
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <html>
        <head>
          <title>Outstanding Amounts Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .status-overdue { color: #dc2626; font-weight: bold; }
            .status-recent { color: #16a34a; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Outstanding Amounts Report</h1>
            <p>Generated on ${format(new Date(), 'PPP')}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Outstanding:</strong> ₹${totalOutstanding.toFixed(2)}</p>
            <p><strong>Customers with Balance:</strong> ${outstandingData.length}</p>
            <p><strong>Average Outstanding:</strong> ₹${outstandingData.length ? (totalOutstanding / outstandingData.length).toFixed(2) : "0.00"}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th class="text-right">Total Ordered</th>
                <th class="text-right">Total Paid</th>
                <th class="text-right">Outstanding</th>
                <th>Last Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${outstandingData.map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.phone || '-'}</td>
                  <td class="text-right">₹${customer.totalOrdered.toFixed(2)}</td>
                  <td class="text-right">₹${customer.totalPaid.toFixed(2)}</td>
                  <td class="text-right">₹${customer.outstandingBalance.toFixed(2)}</td>
                  <td>${customer.lastPaymentDate ? format(customer.lastPaymentDate, "dd/MM/yyyy") : "No payments"}</td>
                  <td class="${customer.daysSincePayment === null ? '' : customer.daysSincePayment > 30 ? 'status-overdue' : 'status-recent'}">
                    ${customer.daysSincePayment === null ? 'New' : customer.daysSincePayment > 30 ? 'Overdue' : 'Recent'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    
    toast.success("Outstanding report sent to printer");
  };
  
  const handleExport = () => {
    try {
      // Prepare CSV data
      const headers = ['Customer Name', 'Phone', 'Total Ordered', 'Total Paid', 'Outstanding Balance', 'Last Payment Date', 'Days Since Payment', 'Status'];
      
      const csvData = outstandingData.map(customer => [
        customer.name,
        customer.phone || '',
        customer.totalOrdered.toFixed(2),
        customer.totalPaid.toFixed(2),
        customer.outstandingBalance.toFixed(2),
        customer.lastPaymentDate ? format(customer.lastPaymentDate, "dd/MM/yyyy") : "No payments",
        customer.daysSincePayment?.toString() || 'N/A',
        customer.daysSincePayment === null ? 'New' : customer.daysSincePayment > 30 ? 'Overdue' : 'Recent'
      ]);
      
      // Convert to CSV format
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `outstanding-amounts-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Outstanding amounts exported successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export outstanding amounts");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Outstanding Amounts
        </h1>
        <p className="text-muted-foreground">
          Track and manage customer outstanding balances
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customers with Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{outstandingData.length}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-primary" />
              Average Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{outstandingData.length ? (totalOutstanding / outstandingData.length).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
          <div>
            <CardTitle>Outstanding Balances</CardTitle>
            <CardDescription>
              Customers with pending payments
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 w-full sm:w-[200px]"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} size="sm" className="gap-1">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button variant="outline" onClick={handleExport} size="sm" className="gap-1">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {outstandingData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Total Ordered</TableHead>
                    <TableHead className="text-right">Total Paid</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingData.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell className="text-right">₹{customer.totalOrdered.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{customer.totalPaid.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ₹{customer.outstandingBalance.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {customer.lastPaymentDate 
                          ? format(customer.lastPaymentDate, "dd/MM/yyyy")
                          : "No payments"}
                      </TableCell>
                      <TableCell>
                        {customer.daysSincePayment === null ? (
                          <Badge variant="outline">New</Badge>
                        ) : customer.daysSincePayment > 30 ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : customer.daysSincePayment > 15 ? (
                          <Badge variant="warning">Follow up</Badge>
                        ) : (
                          <Badge variant="success">Recent</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Filter className="h-12 w-12 mb-4 text-muted" />
              <h3 className="text-lg font-medium">No outstanding balances found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
