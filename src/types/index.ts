
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
  outstandingAmount?: number;
  vehicleId?: string;
  salesmanId?: string;
  totalPaid?: number;
  balanceDue?: number;
  balance: number;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  type?: 'regular' | 'wholesale' | 'retail';
  customerCode?: string;
  routeId?: string;
  areaId?: string;
  customFields?: Record<string, any>;
  city?: string;
  pinCode?: string;
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
  stock?: number;
  minStock?: number;
  costPrice?: number;
  code?: string;
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
  hasVariants: boolean;
  variants?: ProductVariant[];
  attributes?: string[];
  taxRate?: number;
  hsnCode?: string;
  customFields?: Record<string, any>;
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

export interface OrderItem {
  productId: string;
  customerId?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  rate?: number;
  id?: string;
  productName?: string;
  unit?: string;
  discount?: number;
  total?: number;
  notes?: string;
  variantId?: string;
  taxRate?: number;
  taxAmount?: number;
}

export interface Order {
  id: string;
  date: string;
  orderDate?: string;
  items: OrderItem[];
  vehicleId: string;
  salesmanId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial';
  customerId?: string;
  total?: number;
  customerName?: string;
  totalAmount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  discount?: number;
  tax?: number;
  deliveryDate?: string;
  deliveryAddress?: string;
  invoiceId?: string;
  paymentMethod?: string;
  customFields?: Record<string, any>;
}

export interface Payment {
  id: string;
  customerId: string;
  orderId?: string;
  date: string;
  amount: number;
  paymentMethod: string;
  method: string;
  reference?: string;
  referenceNumber?: string;
  notes?: string;
  status?: 'completed' | 'pending' | 'failed';
  customerName?: string;
  createdAt?: string;
  updatedAt?: string;
  invoiceId?: string;
  attachment?: string;
  customFields?: Record<string, any>;
  receiptNumber?: string;
}

export interface CustomerProductRate {
  id: string;
  customerId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierProductRate {
  id: string;
  supplierId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  notes?: string;
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
  status?: string;
  contactPerson?: string;
  contact?: string;
  gstNumber?: string;
  gstin?: string;
  notes?: string;
  paymentTerms?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  reference?: string;
  referenceNumber?: string;
  notes?: string;
  method?: string;
  status?: 'completed' | 'pending' | 'failed';
  description?: string;
  receiptNumber?: string;
  transactionId?: string;
  bankDetails?: string;
  supplierName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  type: string;
  description?: string;
  driverName?: string;
  capacity?: number;
  isActive: boolean;
  model?: string;
  status?: 'Available' | 'In Use' | 'Under Maintenance';
  driverContactNumber?: string;
  notes?: string;
  lastMaintenanceDate?: string | null;
  trips?: Array<any>;
  createdAt?: string;
  updatedAt?: string;
  driver?: string;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  vehicleId?: string;
  isActive: boolean;
  status?: 'Active' | 'Inactive' | 'On Leave';
  orders?: Array<any>;
  contactNumber?: string;
  joiningDate?: string;
  targetAmount?: number;
  commission?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrackSheetRow {
  name: string;
  customerId?: string;
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

export interface TrackSheet {
  id: string;
  name: string;
  title?: string;
  date: string;
  rows: TrackSheetRow[];
  vehicleId?: string;
  vehicleName?: string;
  salesmanId?: string;
  salesmanName?: string;
  routeName?: string;
  createdAt?: string;
  updatedAt?: string;
  savedAt?: string;
  notes?: string;
  status?: 'draft' | 'completed';
  summary?: TrackSheetSummary;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  reference?: string;
  recurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  title: string;
  paidTo?: string;
  notes?: string;
  isRecurring?: boolean;
  nextDueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

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

export interface InvoiceItem {
  id?: string;
  productId: string;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  total?: number;
  unit?: string;
  discount?: number;
  tax?: number;
  taxAmount?: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber?: string;
  number: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  notes: string;
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
  discount?: number;
  shipping?: number;
  orderId?: string;
  customerName?: string;
  amount?: number;
  amountPaid?: number;
  balance?: number;
  terms?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  trackSheetId?: string;
  customFields?: Record<string, any>;
}

export interface StockRecord {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  type: 'in' | 'out' | 'adjustment';
  notes?: string;
  relatedEntryId?: string;
  openingStock?: number;
  received?: number;
  dispatched?: number;
  closingStock?: number;
  minStockLevel?: number;
}

export interface StockEntryItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  total?: number;
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

export interface TaxSetting {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
  applicableOn?: string[];
  appliedTo?: string[];
}

export type ProductRate = CustomerProductRate;

export interface StockTransaction {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  type: 'in' | 'out' | 'adjustment' | 'purchase' | 'sale' | 'transfer' | 'return';
  notes?: string;
  referenceNumber?: string;
  referenceId?: string;
  batchNumber?: string;
  expiryDate?: string;
  unitCost?: number;
  totalCost?: number;
  supplierId?: string;
  createdAt?: string;
  updated?: string;
}

export interface VehicleTrip {
  id: string;
  vehicleId: string;
  salesmanId?: string;
  date: string;
  startLocation?: string;
  endLocation?: string;
  distance?: number;
  purpose?: string;
  notes?: string;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  startReading?: number;
  endReading?: number;
  routes?: string[];
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
