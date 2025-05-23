
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Download, ChevronDown, ChevronUp, FilterX, ArrowUpDown 
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { ElectronService } from '@/services/ElectronService';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

export default function SupplierLedger() {
  const { toast } = useToast();
  const { suppliers, supplierPayments } = useData();
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1), // 3 months ago
    to: new Date()
  });
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  // Get the selected supplier
  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId);
  }, [suppliers, selectedSupplierId]);

  // Get payments for the selected supplier filtered by date range
  const filteredPayments = useMemo(() => {
    if (!selectedSupplierId) return [];
    
    let payments = supplierPayments.filter(payment => payment.supplierId === selectedSupplierId);
    
    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      payments = payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return isWithinInterval(paymentDate, {
          start: dateRange.from!,
          end: dateRange.to!
        });
      });
    }
    
    return payments;
  }, [supplierPayments, selectedSupplierId, dateRange]);

  // Sort payments
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortColumn) {
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'paymentMethod':
          valueA = a.paymentMethod?.toLowerCase() || '';
          valueB = b.paymentMethod?.toLowerCase() || '';
          break;
        default:
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredPayments, sortColumn, sortDirection]);

  // Calculate summary
  const summary = useMemo(() => {
    if (!selectedSupplier) return {
      totalPaid: 0,
      transactionCount: 0,
      startingBalance: 0,
      endingBalance: 0
    };
    
    const totalPaid = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const transactionCount = sortedPayments.length;
    
    // Assuming that the outstanding balance in supplier record represents the current balance
    const endingBalance = selectedSupplier.outstandingBalance || 0;
    const startingBalance = endingBalance + totalPaid;
    
    return { totalPaid, transactionCount, startingBalance, endingBalance };
  }, [selectedSupplier, sortedPayments]);

  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Function to toggle transaction details
  const toggleTransactionDetails = (transactionId: string) => {
    const newExpandedTransactions = new Set(expandedTransactions);
    if (newExpandedTransactions.has(transactionId)) {
      newExpandedTransactions.delete(transactionId);
    } else {
      newExpandedTransactions.add(transactionId);
    }
    setExpandedTransactions(newExpandedTransactions);
  };

  // Function to export ledger
  const exportLedger = async () => {
    if (!selectedSupplier) {
      toast({
        title: "Export Failed",
        description: "Please select a supplier to export ledger",
        variant: "destructive"
      });
      return;
    }
    
    const headers = [
      'Date', 'Reference', 'Description', 'Payment Method', 'Amount', 'Balance'
    ];
    
    let runningBalance = summary.startingBalance;
    const rows = [
      // Add opening balance row
      [
        format(dateRange.from || new Date(), 'yyyy-MM-dd'),
        '',
        'Opening Balance',
        '',
        '',
        runningBalance.toFixed(2)
      ]
    ];
    
    // Add transactions
    sortedPayments.forEach(payment => {
      runningBalance -= payment.amount;
      
      rows.push([
        payment.date,
        payment.reference || '',
        payment.description || `Payment to ${selectedSupplier?.name}`,
        payment.paymentMethod || '',
        payment.amount.toFixed(2),
        runningBalance.toFixed(2)
      ]);
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    try {
      await ElectronService.exportData(csvData, `supplier-ledger-${selectedSupplier.name}-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Ledger Exported",
        description: "Supplier ledger has been exported successfully"
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the ledger",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Ledger</h1>
      
      <div className="flex flex-col space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Ledger Configuration</CardTitle>
            <CardDescription>Select supplier and date range for ledger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium mb-1">Supplier</label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <DateRangePicker
                  value={dateRange}
                  onValueChange={setDateRange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedSupplier ? `${selectedSupplier.name} - ${summary.transactionCount} transactions` : 'No supplier selected'}
            </span>
            
            <Button 
              variant="outline" 
              onClick={exportLedger}
              disabled={!selectedSupplier}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Ledger
            </Button>
          </CardFooter>
        </Card>

        {/* Summary */}
        {selectedSupplier && (
          <Card>
            <CardHeader>
              <CardTitle>Ledger Summary</CardTitle>
              <CardDescription>Financial summary for {selectedSupplier.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Starting Balance</dt>
                  <dd className="mt-1 text-2xl font-semibold">₹{summary.startingBalance.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Total Paid</dt>
                  <dd className="mt-1 text-2xl font-semibold text-green-600">₹{summary.totalPaid.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Current Balance</dt>
                  <dd className="mt-1 text-2xl font-semibold text-red-600">₹{summary.endingBalance.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Transactions</dt>
                  <dd className="mt-1 text-2xl font-semibold">{summary.transactionCount}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Transactions */}
        {selectedSupplier && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Payment history and transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-0"></TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('date')}
                      >
                        Date
                        {sortColumn === 'date' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('paymentMethod')}
                      >
                        Payment Method
                        {sortColumn === 'paymentMethod' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer"
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                        {sortColumn === 'amount' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Opening balance row */}
                    <TableRow key="opening-balance">
                      <TableCell></TableCell>
                      <TableCell>{format(dateRange.from || new Date(), 'dd MMM yyyy')}</TableCell>
                      <TableCell></TableCell>
                      <TableCell>Opening Balance</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{summary.startingBalance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    
                    {sortedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No transactions found for the selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedPayments.map((payment) => {
                        const isExpanded = expandedTransactions.has(payment.id);
                        
                        return (
                          <React.Fragment key={payment.id}>
                            <TableRow>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => toggleTransactionDetails(payment.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>{formatDate(payment.date)}</TableCell>
                              <TableCell>{payment.reference || '-'}</TableCell>
                              <TableCell>{payment.description || `Payment to ${selectedSupplier.name}`}</TableCell>
                              <TableCell>
                                {payment.paymentMethod && (
                                  <Badge variant="outline">{payment.paymentMethod}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{payment.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                            
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/50 p-0">
                                  <div className="px-4 py-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {payment.notes && (
                                        <div>
                                          <h4 className="text-sm font-medium">Notes</h4>
                                          <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                                        </div>
                                      )}
                                      {payment.receiptNumber && (
                                        <div>
                                          <h4 className="text-sm font-medium">Receipt Number</h4>
                                          <p className="text-sm text-muted-foreground mt-1">{payment.receiptNumber}</p>
                                        </div>
                                      )}
                                      {payment.transactionId && (
                                        <div>
                                          <h4 className="text-sm font-medium">Transaction ID</h4>
                                          <p className="text-sm text-muted-foreground mt-1">{payment.transactionId}</p>
                                        </div>
                                      )}
                                      {payment.bankDetails && (
                                        <div>
                                          <h4 className="text-sm font-medium">Bank Details</h4>
                                          <p className="text-sm text-muted-foreground mt-1">{payment.bankDetails}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                    
                    {/* Closing balance row */}
                    <TableRow key="closing-balance" className="bg-muted/30">
                      <TableCell></TableCell>
                      <TableCell>{format(dateRange.to || new Date(), 'dd MMM yyyy')}</TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <span className="font-medium">Closing Balance</span>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        ₹{summary.endingBalance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
