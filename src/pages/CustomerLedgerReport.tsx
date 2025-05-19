
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer } from '@/types';
import { exportToPdf } from '@/utils/pdfUtils';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

// Define the types needed for the report
interface CustomerLedgerEntry {
  id: string;
  date: string;
  type: 'order' | 'payment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
}

interface CustomerLedgerReportType {
  customer: Customer;
  entries: CustomerLedgerEntry[];
  startingBalance: number;
  endingBalance: number;
  totalDebit: number;
  totalCredit: number;
}

export default function CustomerLedgerReport() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { customers, orders, payments } = useData();

  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [report, setReport] = useState<CustomerLedgerReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('report');

  const customer = useMemo(() => {
    return customers.find((c) => c.id === customerId);
  }, [customers, customerId]);

  useEffect(() => {
    if (!customerId || !customer) {
      setError('Customer not found.');
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get relevant orders and payments for the customer
        const customerOrders = orders.filter(o => o.customerId === customerId);
        const customerPayments = payments.filter(p => p.customerId === customerId);
        
        // Create ledger entries
        const entries: CustomerLedgerEntry[] = [];
        
        // Add order entries
        customerOrders.forEach(order => {
          const total = order.total || 0;
          if (total > 0) {
            entries.push({
              id: `ord-${order.id}`,
              date: order.date,
              type: 'order',
              description: `Order #${order.id}`,
              debit: total,
              credit: 0,
              balance: 0, // To be calculated
              reference: order.id
            });
          }
        });
        
        // Add payment entries
        customerPayments.forEach(payment => {
          entries.push({
            id: `pay-${payment.id}`,
            date: payment.date,
            type: 'payment',
            description: `Payment #${payment.id}`,
            debit: 0,
            credit: payment.amount,
            balance: 0, // To be calculated
            reference: payment.id
          });
        });
        
        // Sort entries by date
        entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Calculate running balance
        let balance = 0;
        let totalDebit = 0;
        let totalCredit = 0;
        
        entries.forEach(entry => {
          balance = balance + entry.debit - entry.credit;
          entry.balance = balance;
          totalDebit += entry.debit;
          totalCredit += entry.credit;
        });
        
        const reportData: CustomerLedgerReportType = {
          customer,
          entries,
          startingBalance: 0, // Assuming starting balance is 0
          endingBalance: balance,
          totalDebit,
          totalCredit
        };

        setReport(reportData);
      } catch (err) {
        setError('Failed to generate customer ledger report.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [customerId, startDate, endDate, customer, orders, payments]);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    // Re-trigger the report generation
    setReport(null);
  };

  const exportToCSV = () => {
    if (!report) return;
    
    let csvContent = "Date,Description,Debit,Credit,Balance\n";
    
    report.entries.forEach(entry => {
      csvContent += `${entry.date},"${entry.description}",${entry.debit},${entry.credit},${entry.balance}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `customer_ledger_${customer?.name || customerId}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Ledger exported to CSV successfully.');
  };

  const exportToPDFFile = () => {
    if (!report) return;
    
    const headers = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
    const rows = report.entries.map(entry => [
      entry.date,
      entry.description,
      entry.debit.toString(),
      entry.credit.toString(),
      entry.balance.toString()
    ]);
    
    exportToPdf(
      headers,
      rows,
      {
        title: `Customer Ledger: ${customer?.name || 'Unknown Customer'}`,
        subtitle: `Period: ${format(startDate, 'PP')} - ${format(endDate, 'PP')}`,
        additionalInfo: [
          { label: 'Opening Balance', value: '0.00' },
          { label: 'Total Debit', value: report.totalDebit.toString() },
          { label: 'Total Credit', value: report.totalCredit.toString() },
          { label: 'Closing Balance', value: report.endingBalance.toString() }
        ],
        filename: `customer_ledger_${customer?.name || customerId}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        dateInfo: `Generated on: ${format(new Date(), 'PP')}`
      }
    );
    
    toast.success('Ledger exported to PDF successfully.');
  };

  if (loading) {
    return <div>Loading report...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!customer) {
    return <div>Customer not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Ledger Report
          </h1>
          <CardDescription>
            View detailed financial activity for {customer.name}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
          {report && (
            <>
              <Button variant="outline" onClick={exportToCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToPDFFile}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Select date range to generate the ledger report
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </CardFooter>
      </Card>

      {report && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ledger Entries</CardTitle>
                <CardDescription>
                  Detailed list of transactions for {customer.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.debit}</TableCell>
                        <TableCell>{entry.credit}</TableCell>
                        <TableCell>{entry.balance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
                <CardDescription>
                  Summary of financial activity for {customer.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Opening Balance: {report.startingBalance}</p>
                  <p>Total Debit: {report.totalDebit}</p>
                  <p>Total Credit: {report.totalCredit}</p>
                  <p>Closing Balance: {report.endingBalance}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
