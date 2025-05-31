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
  totalPaid?: number; // Added for payment tracking
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
  code?: string; // Added for delivery sheet product codes
}

export interface OrderItem {
  productId: string;
  customerId?: string;
  quantity: number;
  unitPrice: number;
  price?: number; // For dashboard compatibility
  rate?: number; // Alias for unitPrice
  id?: string; // Added to support InvoiceService
  productName?: string; // Added for InvoiceService
  unit?: string; // Added for InvoiceService
}

export interface Order {
  id: string;
  date: string;
  orderDate?: string; // Alias for date
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
  paymentMethod: string; // Changed from enum to string to support more payment methods
  reference?: string;
  referenceNumber?: string; // For backward compatibility
  notes?: string;
  status?: 'completed' | 'pending' | 'failed'; // Added for PaymentListView with proper type
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
  paymentMethod: string; // Changed from enum to string to support more payment methods
  reference?: string;
  referenceNumber?: string; // For backward compatibility
  notes?: string;
  method?: string; // For backward compatibility
  status?: 'completed' | 'pending' | 'failed';
  description?: string;
  receiptNumber?: string;
  transactionId?: string;
  bankDetails?: string;
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
  quantities: Record<string, number | string>; // Product name -> quantity
  total: number;
  amount: number;
  products?: string[]; // Adding the products property
}

export interface TrackSheet {
  id: string;
  name: string;
  title?: string; // Adding title property for backward compatibility
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
  notes?: string; // Adding notes property
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string; // Changed from specific type to string for flexibility
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

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber?: string;
  number: string;
  date: string;
  dueDate: string;
  items: Array<{
    productId: string;
    productName?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    total?: number;
  }>;
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
  orderId?: string; // Add orderId for InvoiceGenerator
  customerName?: string; // Add customerName for InvoiceHistory
  amount?: number; // Add amount for InvoiceHistory
}

export interface StockRecord {
  id: string;
  productId: string;
  quantity: number; // Required field
  date: string;
  type: 'in' | 'out' | 'adjustment'; // Required field
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
  total?: number; // For compatibility with existing code
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
  referenceNumber?: string; // Add for PurchaseHistory and StockManagement
}

export interface TaxSetting {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
  applicableOn?: string[]; // Changed from string to string[]
  appliedTo?: string[]; // Changed from string to string[]
}

// Define ProductRate type since it's missing
export type ProductRate = CustomerProductRate;

// Define StockTransaction type
export interface StockTransaction {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  type: 'in' | 'out' | 'adjustment';
  notes?: string;
  referenceNumber?: string;
}

// Update VehicleTrip type to match what we need
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
