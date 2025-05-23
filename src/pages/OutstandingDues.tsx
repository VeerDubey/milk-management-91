
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DuesTable } from '@/components/outstanding-dues/DuesTable';
import { DuesActionBar, DuesFilterCard } from '@/components/outstanding-dues/DuesFilters';
import { DuesStatCards } from '@/components/outstanding-dues/DuesStatCards';
import { useData } from '@/contexts/data/DataContext';
import { DateRange } from 'react-day-picker';

export default function OutstandingDues() {
  const { customers, invoices, payments } = useData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOverdue, setFilterOverdue] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [sortColumn, setSortColumn] = useState('daysOverdue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculate dues data based on customers, invoices, and payments
  const duesData = React.useMemo(() => {
    return customers
      .filter(customer => customer.outstandingBalance && customer.outstandingBalance > 0)
      .map(customer => {
        const customerInvoices = invoices?.filter(inv => inv.customerId === customer.id) || [];
        const latestInvoice = customerInvoices.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        
        const daysOverdue = customer.lastPaymentDate 
          ? Math.floor((Date.now() - new Date(customer.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
          : 30; // Default to 30 days if no payment date
        
        return {
          customerId: customer.id,
          customerName: customer.name,
          phone: customer.phone || '',
          email: customer.email || '',
          outstanding: customer.outstandingBalance || 0,
          daysOverdue: daysOverdue,
          latestInvoiceDate: latestInvoice?.date || null,
          latestInvoiceAmount: latestInvoice?.total || 0,
          latestPaymentDate: customer.lastPaymentDate || null,
          latestPaymentAmount: customer.lastPaymentAmount || 0,
          invoiceCount: customerInvoices.length,
          invoices: customerInvoices
        };
      });
  }, [customers, invoices, payments]);

  // Calculate statistics
  const totalOutstanding = duesData.reduce((sum, item) => sum + item.outstanding, 0);
  const totalOverdue = duesData
    .filter(item => item.daysOverdue > 30)
    .reduce((sum, item) => sum + item.outstanding, 0);
  const criticalAccounts = duesData.filter(item => item.daysOverdue > 90).length;
  const averageOutstanding = duesData.length > 0 ? totalOutstanding / duesData.length : 0;

  // Filter data based on search, date range, and filters
  const filteredData = React.useMemo(() => {
    return duesData.filter(item => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone?.includes(searchQuery) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by date range
      const matchesDateRange = !dateRange || !dateRange.from || !dateRange.to || 
        (item.latestInvoiceDate && new Date(item.latestInvoiceDate) >= dateRange.from && 
         new Date(item.latestInvoiceDate) <= dateRange.to);
      
      // Filter by overdue status
      let matchesOverdue = true;
      if (filterOverdue === 'current') {
        matchesOverdue = item.daysOverdue < 30;
      } else if (filterOverdue === 'overdue-30') {
        matchesOverdue = item.daysOverdue >= 30 && item.daysOverdue < 60;
      } else if (filterOverdue === 'overdue-60') {
        matchesOverdue = item.daysOverdue >= 60 && item.daysOverdue < 90;
      } else if (filterOverdue === 'critical') {
        matchesOverdue = item.daysOverdue >= 90;
      }
      
      // Filter by tab
      let matchesTab = true;
      if (activeTab === 'current') {
        matchesTab = item.daysOverdue < 30;
      } else if (activeTab === 'overdue') {
        matchesTab = item.daysOverdue >= 30 && item.daysOverdue < 90;
      } else if (activeTab === 'critical') {
        matchesTab = item.daysOverdue >= 90;
      }
      
      return matchesSearch && matchesDateRange && matchesOverdue && matchesTab;
    });
  }, [duesData, searchQuery, dateRange, filterOverdue, activeTab]);

  // Sort data
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof typeof a];
      let bValue: any = b[sortColumn as keyof typeof b];
      
      // Handle null values
      if (aValue === null) aValue = sortDirection === 'asc' ? -Infinity : Infinity;
      if (bValue === null) bValue = sortDirection === 'asc' ? -Infinity : Infinity;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Handle sorting
  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle payment and reminder actions
  const handleAddPayment = (customer: any) => {
    // This would be implemented with a dialog or navigation to payment screen
    console.log('Add payment for customer:', customer);
  };

  const handleSendReminder = (customer: any) => {
    // This would be implemented with a dialog or messaging integration
    console.log('Send reminder to customer:', customer);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Outstanding Dues</h1>
      
      <DuesStatCards 
        totalOutstanding={totalOutstanding}
        duesData={duesData}
        totalOverdue={totalOverdue}
        criticalAccounts={criticalAccounts}
        averageOutstanding={averageOutstanding}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Customer Dues</CardTitle>
          <CardDescription>Track and manage customer outstanding payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DuesActionBar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          <DuesFilterCard 
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterOverdue={filterOverdue}
            setFilterOverdue={setFilterOverdue}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          <DuesTable 
            filteredData={sortedData}
            duesData={duesData}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            toggleSort={toggleSort}
            handleAddPayment={handleAddPayment}
            handleSendReminder={handleSendReminder}
            setSearchQuery={setSearchQuery}
            setDateRange={setDateRange}
            setFilterOverdue={setFilterOverdue}
            setActiveTab={setActiveTab}
          />
        </CardContent>
      </Card>
    </div>
  );
}
