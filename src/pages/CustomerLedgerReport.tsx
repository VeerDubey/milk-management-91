// Import the proper types
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { CustomerLedgerEntry, CustomerLedgerReport as CustomerLedgerReportType } from '@/types';

// Fix the error: 'CustomerLedgerReport' refers to a value, but is being used as a type here
export default function CustomerLedgerReport() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { customers } = useData();

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
    if (!customerId) {
      setError('Customer ID is required.');
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        // Mock data for demonstration
        const mockEntries: CustomerLedgerEntry[] = [
          {
            id: '1',
            customerId: customerId,
            date: format(new Date(), 'yyyy-MM-dd'),
            type: 'order',
            description: 'Order #123',
            debit: 500,
            credit: 0,
            balance: 500,
            referenceId: 'ORD-123',
            orderId: 'ORD-123',
            paymentId: null,
            productQuantities: { 'PROD-1': 2, 'PROD-2': 1 },
            totalQuantity: 3,
            amountBilled: 500,
            paymentReceived: 0,
            closingBalance: 500,
            reference: 'Order #123',
          },
          {
            id: '2',
            customerId: customerId,
            date: format(new Date(), 'yyyy-MM-dd'),
            type: 'payment',
            description: 'Payment received',
            debit: 0,
            credit: 300,
            balance: 200,
            referenceId: 'PAY-456',
            orderId: null,
            paymentId: 'PAY-456',
            productQuantities: null,
            totalQuantity: 0,
            amountBilled: 0,
            paymentReceived: 300,
            closingBalance: 200,
            reference: 'Payment #456',
          },
        ];

        const mockReport: CustomerLedgerReportType = {
          customerId: customerId,
          customerName: customer?.name || 'Unknown Customer',
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          entries: mockEntries,
          openingBalance: 0,
          closingBalance: 200,
          totalAmountBilled: 500,
          totalPaymentReceived: 300,
          totalProductQuantities: { 'PROD-1': 2, 'PROD-2': 1 },
        };

        setReport(mockReport);
      } catch (err) {
        setError('Failed to fetch customer ledger report.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchReport();
    }
  }, [customerId, startDate, endDate, customer]);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
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
        <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
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
              id="start-date"
              date={startDate}
              onDateChange={setStartDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <DatePicker
              id="end-date"
              date={endDate}
              onDateChange={setEndDate}
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
                  <p>Opening Balance: {report.openingBalance}</p>
                  <p>Total Amount Billed: {report.totalAmountBilled}</p>
                  <p>Total Payment Received: {report.totalPaymentReceived}</p>
                  <p>Closing Balance: {report.closingBalance}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
