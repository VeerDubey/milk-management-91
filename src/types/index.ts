
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
  outstandingBalance: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  email?: string;
  area?: string;
  outstandingAmount?: number; // Added for compatibility with existing code
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image?: string;
  isActive: boolean;
  sku?: string;
  category?: string;
  minStockLevel?: number;
  stock?: number; // Added for dashboard display
  minStock?: number; // Added for dashboard display
  costPrice?: number; // Added for product detail
}

export interface OrderItem {
  productId: string;
  customerId?: string;
  quantity: number;
  unitPrice: number;
  price?: number; // For dashboard compatibility
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  vehicleId: string;
  salesmanId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial';
  customerId?: string; // Added for CustomerLedger
  total?: number; // Added for CustomerLedger
  customerName?: string; // Added for display purposes
  totalAmount?: number; // Added for compatibility with existing code
}

export interface Payment {
  id: string;
  customerId: string;
  orderId: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  notes?: string;
}

export interface CustomerProductRate {
  id: string;
  customerId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
}

export interface SupplierProductRate {
  id: string;
  supplierId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  products: string[];
  isActive: boolean;
  outstandingBalance?: number;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  notes?: string;
}

export interface StockEntryItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface StockEntry {
  id?: string;
  date: string;
  supplierId: string;
  items: StockEntryItem[];
  totalAmount: number;
  referenceNumber?: string;
  notes?: string;
}

export interface StockRecord {
  id: string;
  date: string;
  productId: string;
  openingStock: number;
  received: number;
  dispatched: number;
  closingStock: number;
  minStockLevel?: number;
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es';
  currency: 'USD' | 'EUR' | 'GBP';
}

export interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  type: string;
  capacity: number;
  isActive: boolean;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  title?: string;
  paymentMethod?: string;
  paidTo?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
}

export interface TrackSheetRow {
  name: string;
  quantities: Record<string, number | string>;
  total: number;
  amount: number;
}

export interface TrackSheet {
  id: string;
  title: string;
  date: string;
  vehicleId: string;
  salesmanId: string;
  productNames: string[];
  rows: TrackSheetRow[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: OrderItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  notes?: string;
  paymentTerms?: string;
  taxRate?: number;
  discount?: number;
  shipping?: number;
  customerName?: string; // Added for display purposes
  amount?: number; // Added for compatibility
  orderId?: string; // Added for linking to orders
}

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  type: 'order' | 'payment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
}

export interface CustomerLedgerReportType {
  customer: Customer;
  entries: CustomerLedgerEntry[];
  startingBalance: number;
  endingBalance: number;
  totalDebit: number;
  totalCredit: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  fontFamily?: string;
  primaryColor?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}
