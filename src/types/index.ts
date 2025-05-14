// Add this to the existing types/index.ts file, we'll define/update types needed for the app

// Customer type definition
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  area?: string;
  email?: string;
  outstandingBalance: number;
  outstandingAmount?: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  totalPaid?: number;
  joinedDate?: string;
  notes?: string;
}

// Product type definition
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  category?: string;
  stock?: number;
  minStock?: number;
  minStockLevel?: number;
  costPrice?: number;
  image?: string;
  barcode?: string;
  sku?: string;
  isActive?: boolean;
}

// Order item definition
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  price?: number; // Total price for this item (quantity * unitPrice)
  unit: string;
  customerId?: string; // Added this property as it's being used
}

// Order type definition
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  total: number;
  totalAmount?: number; // Added totalAmount as an alias for total
  status: 'pending' | 'delivered' | 'cancelled' | 'processing';
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  deliveryDate?: string;
  deliveryNotes?: string;
  vehicleId?: string; // Added vehicleId
  salesmanId?: string; // Added salesmanId
}

// Payment definition
export interface Payment {
  id: string;
  customerId: string;
  customerName?: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  notes?: string;
  invoiceId?: string;
  receivedBy?: string;
}

// Expense definition
export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  paidTo?: string;
  title?: string;
  notes?: string;
  receiptImage?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// Supplier definition
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address: string;
  gstNumber?: string;
  outstandingBalance?: number;
  notes?: string;
  products?: string[];
}

// Supplier Payment definition
export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName?: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  notes?: string;
  referenceNumber?: string;
}

// Customer Product Rate definition
export interface CustomerProductRate {
  id: string;
  customerId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  notes?: string;
}

// Supplier Product Rate definition
export interface SupplierProductRate {
  id: string;
  supplierId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  notes?: string;
}

// Stock Record definition
export interface StockRecord {
  id?: string;
  date: string;
  productId: string;
  openingStock: number;
  received: number;
  dispatched: number;
  closingStock: number;
  minStockLevel?: number;
  notes?: string;
}

// Stock Entry (purchase) definition
export interface StockEntry {
  id: string;
  date: string;
  supplierId: string;
  referenceNumber?: string;
  totalAmount: number;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
}

// Vehicle definition
export interface Vehicle {
  id: string;
  name: string;
  number: string;
  type: string;
  regNumber: string;
  model?: string;
  capacity?: number;
  isActive: boolean;
  notes?: string;
}

// Salesman definition
export interface Salesman {
  id: string;
  name: string;
  phone: string;
  address?: string;
  vehicleId?: string;
  isActive: boolean;
  email?: string;
  joinedDate?: string;
  salary?: number;
  commissionRate?: number;
}

// Invoice definition
export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate?: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  amount?: number; // Alias for total for backward compatibility
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  paymentTerms?: string;
  invoiceNumber: string;
  orderId?: string; // Added for linking to orders
}

// Invoice Template definition
export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  fontFamily?: string;
  primaryColor?: string;
}

// UI Settings
export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  tableStyle: 'default' | 'compact' | 'minimal' | 'bordered' | 'striped';
  sidebarStyle: 'default' | 'compact' | 'expanded' | 'gradient' | 'solid' | 'minimal';
  dateFormat: string;
  colorScheme: string;
  notificationFrequency: 'weekly' | 'immediate' | 'hourly' | 'daily';
  accentColor?: string;
  compactMode?: boolean;
  highContrast?: boolean;
}

// Product Rate definition
export interface ProductRate {
  id: string;
  productId: string;
  customerId?: string; // If null, it's the default rate
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  notes?: string;
}

// Stock Transaction
export interface StockTransaction {
  id: string;
  productId: string;
  quantity: number;
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'loss';
  date: string;
  reference?: string;
  notes?: string;
  unitCost?: number;
}

// Customer Ledger Entry
export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'order' | 'payment' | 'adjustment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  referenceId?: string; // Order ID or Payment ID
  orderId?: string;
  paymentId?: string;
  productQuantities?: { [productId: string]: number };
  totalQuantity?: number;
  amountBilled?: number;
  paymentReceived?: number;
  closingBalance?: number;
}

// Customer Ledger Report
export interface CustomerLedgerReport {
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  entries: CustomerLedgerEntry[];
  openingBalance: number;
  closingBalance: number;
  totalAmountBilled?: number;
  totalPaymentReceived?: number;
  totalProductQuantities?: { [productId: string]: number };
}
