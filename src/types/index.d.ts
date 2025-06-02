// Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  balance: number;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  isActive: boolean;
  type?: 'regular' | 'wholesale' | 'retail';
  customerCode?: string;
  routeId?: string;
  areaId?: string;
  customFields?: Record<string, any>;
  totalPaid?: number;
  outstandingBalance?: number;
  area?: string;
  balanceDue?: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  price: number;
  costPrice?: number;
  stock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
  hasVariants: boolean;
  variants?: ProductVariant[];
  attributes?: string[];
  taxRate?: number;
  hsnCode?: string;
  customFields?: Record<string, any>;
  code?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  attributeValues: Record<string, string>;
  price: number;
  costPrice?: number;
  stock?: number;
  sku?: string;
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  items: OrderItem[];
  total?: number;
  totalAmount?: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  vehicleId?: string;
  salesmanId?: string;
  discount?: number;
  tax?: number;
  deliveryDate?: string;
  deliveryAddress?: string;
  invoiceId?: string;
  paymentMethod?: string;
  customFields?: Record<string, any>;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total?: number;
  notes?: string;
  variantId?: string;
  taxRate?: number;
  taxAmount?: number;
}

// Track Sheet Types
export interface TrackSheet {
  id: string;
  name?: string;
  title?: string;
  date: string;
  vehicleId?: string;
  salesmanId?: string;
  routeName?: string;
  rows: TrackSheetRow[];
  notes?: string;
  createdAt?: string;
  status?: 'draft' | 'completed';
  summary?: TrackSheetSummary;
}

export interface TrackSheetRow {
  customerId: string;
  name: string;
  quantities: Record<string, number | string>;
  total: number;
  amount: number;
  products?: string[];
}

export interface TrackSheetSummary {
  totalItems: number;
  totalAmount: number;
  productTotals: Record<string, number>;
}

// Invoice Types
export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName?: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  discountAmount?: number;
  tax?: number;
  taxRate: number;
  taxAmount?: number;
  total: number;
  amountPaid?: number;
  balance?: number;
  notes?: string;
  terms?: string;
  termsAndConditions?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  referenceNumber?: string;
  orderId?: string;
  trackSheetId?: string;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Record<string, any>;
  invoiceNumber?: string;
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  productName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  discount?: number;
  tax?: number;
  taxAmount?: number;
  total?: number;
  amount?: number;
}

// Payment Types
export interface Payment {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  amount: number;
  method: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'completed' | 'pending' | 'failed';
  invoiceId?: string;
  orderId?: string;
  attachment?: string;
  customFields?: Record<string, any>;
  receiptNumber?: string;
}

// Vehicle and Salesman Types
export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  type?: string;
  capacity?: number;
  driver?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Salesman {
  id: string;
  name: string;
  contactNumber?: string;
  email?: string;
  route?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleTrip {
  id: string;
  vehicleId: string;
  salesmanId?: string;
  date: string;
  startTime: string;
  endTime?: string;
  startReading?: number;
  endReading?: number;
  status: 'planned' | 'in-progress' | 'completed';
  routes?: string[];
  notes?: string;
}

// Other Types
export interface ProductRate {
  id: string;
  productId: string;
  customerId: string;
  rate: number;
  effectiveDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName?: string;
  amount: number;
  date: string;
  paymentMethod: string;
  reference?: string;
  description?: string;
  notes?: string;
  status?: 'completed' | 'pending' | 'failed';
  createdAt?: string;
  updatedAt?: string;
  receiptNumber?: string;
  transactionId?: string;
  bankDetails?: string;
  referenceNumber?: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  date: string;
  referenceId?: string;
  notes?: string;
  batchNumber?: string;
  expiryDate?: string;
  unitCost?: number;
  totalCost?: number;
  supplierId?: string;
  createdAt?: string;
  updated?: string;
}

export interface StockEntry {
  id: string;
  supplierId: string;
  date: string;
  items: StockEntryItem[];
  notes?: string;
  totalAmount: number;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  createdAt?: string;
  referenceNumber?: string;
}

export interface StockEntryItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  total?: number;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  city?: string;
  pinCodes?: string[];
  isActive: boolean;
}

export interface Route {
  id: string;
  name: string;
  areas: string[];
  description?: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  attachment?: string;
  isRecurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  products?: string[];
  isActive: boolean;
  outstandingBalance?: number;
  status?: string;
  contact?: string;
  gstNumber?: string;
  gstin?: string;
  notes?: string;
  paymentTerms?: string;
}

// UI Settings
export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  currency: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
  defaultPaymentMethod: string;
  defaultReportPeriod: string;
  fontSize?: 'small' | 'medium' | 'large';
  colorScheme?: string;
  sidebarStyle?: 'compact' | 'expanded';
  tableStyle?: 'bordered' | 'minimal' | 'striped';
  notificationFrequency?: 'high' | 'medium' | 'low' | 'off';
  language?: string;
  currencyFormat?: string;
}

// Notification Types
export interface NotificationTemplate {
  id: string;
  type: 'sms' | 'email' | 'whatsapp';
  event: 'order_confirmation' | 'delivery_update' | 'payment_receipt' | 'payment_reminder' | 'low_stock';
  template: string;
  isActive: boolean;
  variables?: string[];
}

export interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  apiKey?: string;
  senderId?: string;
  emailFrom?: string;
}

// Role Management
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission {
  id: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete';
  allowed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
}
