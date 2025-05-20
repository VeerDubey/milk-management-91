
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
  vehicleId?: string; // Track vehicle assignment
  salesmanId?: string; // Track salesman assignment
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
  id?: string; // Added to support InvoiceService
  productName?: string; // Added for InvoiceService
  unit?: string; // Added for InvoiceService
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
  orderId?: string; // Made optional for compatibility with PaymentCreate
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
  notes?: string; // Added for SupplierRates
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
  status?: string; // Added for SupplierDirectory
  contactPerson?: string; // Added for compatibility
  contact?: string; // Added for compatibility
  gstNumber?: string; // Added for SupplierPayments
  notes?: string; // Added for SupplierPayments
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  referenceNumber?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  type: string;
  description?: string;
  isActive: boolean;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  isActive: boolean;
}

export interface TrackSheetRow {
  name: string;
  quantities: Record<string, number | string>; // Product name -> quantity
  total: number;
  amount: number;
  customerId?: string;
}

export interface TrackSheet {
  id: string;
  name: string;
  date: string;
  rows: TrackSheetRow[];
  vehicleId?: string;
  vehicleName?: string;
  salesmanId?: string;
  salesmanName?: string;
  routeName?: string;
  createdAt?: string;
  savedAt?: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  reference?: string;
  recurring?: boolean;
  recurringInterval?: string;
  nextDueDate?: string;
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  currency: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
  defaultPaymentMethod: string;
  defaultReportPeriod: string;
}

export interface ProductStockEntry {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  supplierId?: string;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  type: 'in' | 'out' | 'adjustment';
  referenceNumber?: string;
}
