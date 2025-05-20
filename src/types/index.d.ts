
// Define all the missing types referenced in the code

// Invoice related types
export interface Invoice {
  id: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  termsAndConditions?: string;
  templateId?: string;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

// Stock related types
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

export interface StockEntry {
  id: string;
  date: string;
  supplierId: string;
  items: StockEntryItem[];
  totalAmount: number;
  referenceNumber?: string;
}

export interface StockEntryItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Expense related types
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
  paidTo: string;
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// Vehicle and Salesman related types
export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string; // This is the correct property name, not regNumber
  type: string;
  driverName?: string; // This is the correct property name, not driver
  isActive: boolean;
  capacity: number;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  isActive: boolean;
  assignedVehicleId?: string; // This is the correct property name, not vehicleId
}

// Tax Settings
export interface TaxSetting {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
  code?: string;
  description?: string;
}

// Track Sheet
export interface TrackSheet {
  id: string;
  date: string;
  title: string;
  vehicleId?: string;
  salesmanId?: string;
  items: TrackSheetItem[];
  isTemplate: boolean;
  createdAt: string;
}

export interface TrackSheetItem {
  customerId: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  totalAmount: number;
}

// UI Settings
export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: string;
  notifications: boolean;
  compactView: boolean;
  sidebarStyle: 'compact' | 'full';
  tableStyle: 'bordered' | 'minimal' | 'striped';
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Add any other missing types here
