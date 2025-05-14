
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  area?: string; // Add area field
  outstandingBalance: number;
  outstandingAmount?: number; // Add for compatibility
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  totalPaid?: number; // Add total paid amount
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  unit: string;
  sku: string;
  category: string;
  minStockLevel?: number;
  stock?: number; // Add stock field
  minStock?: number; // Add for compatibility
}

export interface OrderItem {
  customerId: string;
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  vehicleId?: string;
  salesmanId?: string;
  totalAmount?: number;
  customerName?: string;
  customerId?: string; // Add customer ID
  status?: string; // Add status field
}

export interface Payment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  paymentMethod: "cash" | "bank" | "upi" | "other";
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  title?: string; // Add title field
  paymentMethod: "cash" | "bank" | "upi" | "other";
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  amount: number;
  paymentMethod: "cash" | "bank" | "upi" | "other";
  invoiceNumber?: string;
  notes?: string;
  billImageUrl?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  category?: string;
  outstandingBalance?: number;
}

export interface CustomerProductRate {
  id: string;
  customerId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
}

export interface SupplierProductRate {
  id: string;
  supplierId: string;
  productId: string;
  rate: number;
  effectiveDate: string;
  remarks?: string;
  isActive: boolean;
}

export interface StockRecord {
  id: string;
  date: string;
  productId: string;
  openingStock: number;
  received: number;
  dispatched: number;
  closingStock: number;
  supplierId?: string;
  minStockLevel?: number;
}

export interface StockEntry {
  id: string;
  date: string;
  supplierId: string;
  items: StockEntryItem[];
  totalAmount: number;
  invoiceNumber?: string;
  invoiceImageUrl?: string;
}

export interface StockEntryItem {
  productId: string;
  quantity: number;
  rate: number;
}

export interface CustomerLedgerEntry {
  date: string;
  orderId?: string;
  paymentId?: string;
  productQuantities: {[productId: string]: number};
  totalQuantity: number;
  amountBilled: number;
  paymentReceived: number;
  closingBalance: number;
  reference?: string;
}

export interface CustomerLedgerReport {
  customerId: string;
  startDate: string;
  endDate: string;
  openingBalance: number;
  entries: CustomerLedgerEntry[];
  totalProductQuantities: {[productId: string]: number};
  totalAmountBilled: number;
  totalPaymentReceived: number;
  closingBalance: number;
}

export interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  type: string;
  driver?: string;
  isActive: boolean;
  number: string;
  model?: string;
  capacity?: number;
  notes?: string;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  address?: string;
  isActive: boolean;
  vehicleId?: string;
}

export interface UISettings {
  theme: "light" | "dark" | "system";
  accentColor: string;
  sidebarStyle: "default" | "compact" | "expanded" | "gradient" | "solid" | "minimal";
  sidebarColor: string;
  tableStyle: "default" | "bordered" | "striped" | "compact" | "minimal";
  compactMode?: boolean;
  paymentReminders?: boolean;
  lowStockAlerts?: boolean;
  enableAnimations?: boolean;
  highContrast?: boolean;
  fontSize?: "small" | "medium" | "large" | "x-large";
  showTips?: boolean;
  showQuickActions?: boolean;
  showRevenueChart?: boolean;
  showRecentActivities?: boolean;
  showCustomerStats?: boolean;
  dateFormat?: string;
  currencyFormat?: string;
  timezone?: string;
  defaultView?: string;
  autoGenerateInvoices?: boolean;
  defaultInvoiceTemplate?: string;
  invoiceDueDays?: number;
  invoicePrefix?: string;
  invoiceStartNumber?: number;
  includeDateInInvoice?: boolean;
  defaultInvoiceNotes?: string;
  notificationFrequency?: "immediate" | "hourly" | "daily" | "weekly";
  orderNotifications?: boolean;
  invoiceNotifications?: boolean;
  startWithSystem?: boolean;
  minimizeToTray?: boolean;
  defaultPrinter?: string;
  hardwareAcceleration?: boolean;
  autoUpdate?: boolean;
  updateChannel?: "stable" | "beta" | "dev";
}

export interface Invoice {
  id: string;
  orderId: string;
  customerName: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Draft" | "Cancelled" | "Processing" | "Completed" | string;
  items: OrderItem[];
  notes?: string;
  terms?: string;
  dueDate?: string;
  discountPercentage?: number;
  taxRate?: number;
  templateId?: string;
  paidAmount?: number;
  paidDate?: string;
  paymentMethod?: "cash" | "bank" | "upi" | "other";
  reference?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  primaryColor: string;
  fontFamily: string;
  showHeader: boolean;
  showFooter: boolean;
}
