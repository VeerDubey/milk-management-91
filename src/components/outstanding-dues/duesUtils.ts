
import { differenceInDays } from 'date-fns';

export type DuesItemType = {
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  outstanding: number;
  daysOverdue: number;
  latestInvoiceDate: string | null;
  latestInvoiceAmount: number;
  latestPaymentDate: string | null;
  latestPaymentAmount: number;
  invoiceCount: number;
  invoices: any[];
};

// Generate outstanding dues data from customers, invoices and payments
export const generateDuesData = (customers: any[], invoices: any[], payments: any[]): DuesItemType[] => {
  return customers.map(customer => {
    // All invoices for this customer
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customer.id);
    
    // Sum of all invoice amounts
    const totalInvoiced = customerInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // All payments from this customer
    const customerPayments = payments.filter(payment => payment.customerId === customer.id);
    
    // Sum of all payments
    const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate outstanding amount
    const outstanding = totalInvoiced - totalPaid;
    
    // Find latest invoice
    const sortedInvoices = [...customerInvoices].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latestInvoice = sortedInvoices[0];
    
    // Find latest payment
    const sortedPayments = [...customerPayments].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latestPayment = sortedPayments[0];
    
    // Calculate days overdue from latest invoice
    const daysOverdue = latestInvoice 
      ? differenceInDays(new Date(), new Date(latestInvoice.date))
      : 0;
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      outstanding,
      daysOverdue,
      latestInvoiceDate: latestInvoice?.date || null,
      latestInvoiceAmount: latestInvoice?.total || 0,
      latestPaymentDate: latestPayment?.date || null,
      latestPaymentAmount: latestPayment?.amount || 0,
      invoiceCount: customerInvoices.length,
      invoices: customerInvoices
    };
  }).filter(data => data.outstanding > 0);
};

// Filter by search query
export const filterBySearch = (data: DuesItemType[], searchQuery: string): DuesItemType[] => {
  if (!searchQuery) return data;
  return data.filter(item => 
    item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.includes(searchQuery)
  );
};

// Filter by date range
export const filterByDate = (data: DuesItemType[], dateRange: any): DuesItemType[] => {
  if (!dateRange || !dateRange.from || !dateRange.to) return data;
  
  return data.filter(item => {
    if (!item.latestInvoiceDate) return false;
    
    const invoiceDate = new Date(item.latestInvoiceDate);
    return invoiceDate >= dateRange.from && invoiceDate <= dateRange.to;
  });
};

// Filter by overdue status
export const filterByOverdue = (data: DuesItemType[], filterOverdue: string): DuesItemType[] => {
  switch (filterOverdue) {
    case 'all':
      return data;
    case 'current':
      return data.filter(item => item.daysOverdue < 30);
    case 'overdue-30':
      return data.filter(item => item.daysOverdue >= 30 && item.daysOverdue < 60);
    case 'overdue-60':
      return data.filter(item => item.daysOverdue >= 60 && item.daysOverdue < 90);
    case 'critical':
      return data.filter(item => item.daysOverdue >= 90);
    default:
      return data;
  }
};

// Filter by tab
export const filterByTab = (data: DuesItemType[], activeTab: string): DuesItemType[] => {
  switch (activeTab) {
    case 'all':
      return data;
    case 'current':
      return data.filter(item => item.daysOverdue < 30);
    case 'overdue':
      return data.filter(item => item.daysOverdue >= 30);
    case 'critical':
      return data.filter(item => item.daysOverdue >= 90);
    default:
      return data;
  }
};

// Sort function for dues data
export const sortDuesData = (data: DuesItemType[], sortColumn: string, sortDirection: 'asc' | 'desc'): DuesItemType[] => {
  return [...data].sort((a, b) => {
    let aValue = a[sortColumn as keyof DuesItemType];
    let bValue = b[sortColumn as keyof DuesItemType];
    
    // Handle dates
    if (sortColumn.includes('Date') && aValue && bValue) {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    
    // Handle null values
    if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === null) return sortDirection === 'asc' ? -1 : 1;
    
    // Compare values
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};
