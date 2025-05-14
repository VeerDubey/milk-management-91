
// Add this to the existing types/index.ts file, we'll define/update types needed for the app

// Customer type definition
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  area?: string; // Added area property
  email?: string;
  outstandingBalance: number;
  outstandingAmount?: number; // Added for compatibility
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  totalPaid?: number; // Added total paid tracking
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
  stock?: number; // Added stock property
  minStock?: number; // Added minimum stock threshold
  costPrice?: number;
  image?: string;
  barcode?: string;
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
}

// Order type definition
export interface Order {
  id: string;
  customerId: string; // Added customer ID
  customerName: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'delivered' | 'cancelled' | 'processing'; // Added status
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  deliveryDate?: string;
  deliveryNotes?: string;
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
  paidTo?: string; // Added paidTo property
  title?: string; // Added title property
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
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  paymentTerms?: string;
  invoiceNumber: string;
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
