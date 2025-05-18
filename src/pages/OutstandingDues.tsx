
import { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { DateRange } from 'react-day-picker';
import { 
  generateDuesData, 
  filterBySearch, 
  filterByDate, 
  filterByOverdue,
  filterByTab,
  sortDuesData
} from '@/components/outstanding-dues/duesUtils';
import { DuesStatCards } from '@/components/outstanding-dues/DuesStatCards';
import { DuesActionBar, DuesFilterCard } from '@/components/outstanding-dues/DuesFilters';
import { DuesTable } from '@/components/outstanding-dues/DuesTable';
import { ReminderDialog } from '@/components/outstanding-dues/ReminderDialog';
import { PaymentDialog } from '@/components/outstanding-dues/PaymentDialog';

const OutstandingDues = () => {
  const { customers, invoices, payments } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 90)),
    to: new Date()
  });
  const [sortColumn, setSortColumn] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [filterOverdue, setFilterOverdue] = useState<string>('all');

  // Generate outstanding dues data
  const duesData = generateDuesData(customers, invoices, payments);

  // Apply all filters and sort
  let filteredData = duesData;
  filteredData = filterBySearch(filteredData, searchQuery);
  filteredData = filterByDate(filteredData, dateRange);
  filteredData = filterByOverdue(filteredData, filterOverdue);
  filteredData = filterByTab(filteredData, activeTab);
  filteredData = sortDuesData(filteredData, sortColumn, sortDirection);

  // Toggle sort
  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle sending reminder
  const handleSendReminder = (customer: any) => {
    setSelectedCustomer(customer);
    setIsReminderDialogOpen(true);
  };

  // Handle recording a payment
  const handleAddPayment = (customer: any) => {
    setSelectedCustomer(customer);
    setIsPaymentDialogOpen(true);
  };

  // Calculate statistics
  const totalOutstanding = duesData.reduce((sum, item) => sum + item.outstanding, 0);
  const averageOutstanding = duesData.length > 0 ? totalOutstanding / duesData.length : 0;
  const totalOverdue = duesData.filter(item => item.daysOverdue >= 30).reduce((sum, item) => sum + item.outstanding, 0);
  const criticalAccounts = duesData.filter(item => item.daysOverdue >= 90).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outstanding Dues</h1>
        <p className="text-muted-foreground">
          Track and manage customer outstanding balances and payments
        </p>
      </div>

      {/* Statistics Cards */}
      <DuesStatCards 
        totalOutstanding={totalOutstanding}
        duesData={duesData}
        totalOverdue={totalOverdue}
        criticalAccounts={criticalAccounts}
        averageOutstanding={averageOutstanding}
      />

      {/* Filters and Actions */}
      <DuesActionBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Filter Card */}
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

      {/* Main Content */}
      <DuesTable 
        filteredData={filteredData}
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

      {/* Dialogs */}
      <ReminderDialog 
        isOpen={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        selectedCustomer={selectedCustomer}
      />

      <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        selectedCustomer={selectedCustomer}
      />
    </div>
  );
};

export default OutstandingDues;
