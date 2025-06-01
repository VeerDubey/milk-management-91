
import type { OrderItem } from './index';

// Enhanced types for the upgraded ERP system

export interface MilkCollection {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  quantity: number;
  fatPercentage: number;
  rate: number;
  amount: number;
  wastage?: number;
  batchNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReturn {
  id: string;
  orderId: string;
  customerId: string;
  productId: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'not_required' | 'quality_issue';
  returnDate: string;
  refundAmount: number;
  status: 'pending' | 'processed' | 'refunded';
  notes?: string;
  createdAt: string;
}

export interface CrateTracking {
  id: string;
  customerId: string;
  crateType: string;
  issued: number;
  returned: number;
  balance: number;
  lastUpdated: string;
  deliveryId?: string;
}

export interface RecurringOrder {
  id: string;
  customerId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  items: OrderItem[];
  isActive: boolean;
  startDate: string;
  endDate?: string;
  lastGenerated?: string;
  skipDates: string[];
  modifiedDates: { date: string; items: OrderItem[] }[];
}

export interface DemandForecast {
  id: string;
  productId: string;
  customerId?: string;
  predictedQuantity: number;
  confidence: number;
  baseDate: string;
  factors: {
    historical: number;
    seasonal: number;
    trending: number;
  };
}

export interface Notification {
  id: string;
  type: 'sms' | 'whatsapp' | 'email';
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  orderId?: string;
  customerId?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  managerId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  filters: {
    dateRange?: { from: string; to: string };
    customers?: string[];
    products?: string[];
    branches?: string[];
    customFilters?: Record<string, any>;
  };
  columns: string[];
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  createdBy: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalOrders: number;
  totalQuantity: number;
  totalAmount: number;
  cashCollected: number;
  paymentsReceived: {
    cash: number;
    bank: number;
    upi: number;
    other: number;
  };
  expenses: number;
  milkCollected: number;
  returns: number;
  outstandingBalance: number;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  alertType: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  acknowledged: boolean;
}

export interface BatchInfo {
  id: string;
  batchNumber: string;
  productId: string;
  quantity: number;
  manufacturedDate: string;
  expiryDate: string;
  supplierBatch?: string;
  status: 'active' | 'expired' | 'recalled';
  remainingQuantity: number;
}

export interface DynamicPricing {
  id: string;
  productId: string;
  customerId?: string;
  customerGroup?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priceType: 'fixed' | 'percentage_discount' | 'bulk_discount';
  value: number;
  minimumQuantity?: number;
  isActive: boolean;
}

export interface TwoFactorAuth {
  userId: string;
  secret: string;
  isEnabled: boolean;
  backupCodes: string[];
  lastUsed?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  isActive: boolean;
}

export interface APISettings {
  smsProvider: 'twilio' | 'msg91' | 'textlocal';
  smsConfig: {
    apiKey: string;
    senderId: string;
    templateId?: string;
  };
  whatsappConfig: {
    apiKey: string;
    phoneNumberId: string;
    accessToken: string;
  };
  emailConfig: {
    provider: 'smtp' | 'sendgrid' | 'mailgun';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

export interface SystemHealth {
  database: boolean;
  cache: boolean;
  storage: boolean;
  notifications: boolean;
  lastChecked: string;
  errors: string[];
}

// User roles and permissions
export interface UserRole {
  id: string;
  name: 'admin' | 'staff' | 'customer' | 'driver';
  permissions: Permission[];
  description: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  module: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  resource: string;
}

export interface EnhancedCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  area?: string;
  creditLimit: number;
  currentBalance: number;
  outstandingBalance: number;
  lastOrderDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'order' | 'payment' | 'credit_note' | 'debit_note';
  orderId?: string;
  paymentId?: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  createdAt: string;
}

// Product with enhanced features
export interface EnhancedProduct {
  id: string;
  name: string;
  code: string; // Auto-generated product code
  price: number;
  unit: string;
  category: string;
  description?: string;
  isActive: boolean;
  stock?: number;
  minStock?: number;
  dynamicPricing: DynamicPricing[];
  createdAt: string;
  updatedAt: string;
}

// Delivery sheet specific types
export interface DeliverySheetEntry {
  customerId: string;
  customerName: string;
  area: string;
  products: { [productCode: string]: number }; // Product code to quantity mapping
  totalQuantity: number;
  totalAmount: number;
  notes?: string;
}

export interface DeliverySheet {
  id: string;
  date: string;
  area?: string;
  entries: DeliverySheetEntry[];
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'finalized' | 'delivered';
}
