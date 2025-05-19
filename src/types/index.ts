
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
}

export interface OrderItem {
  productId: string;
  customerId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  vehicleId: string;
  salesmanId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial';
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

export interface Stock {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  date: string;
}

export interface StockRecord {
  id: string;
  date: string;
  entries: StockEntry[];
}

export interface StockEntry {
  productId: string;
  quantity: number;
  price: number;
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
}
