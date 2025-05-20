

// Include the missing types for TrackSheet, TrackSheetRow, Invoice, etc.

import { ReactNode } from 'react';

// Extend Window interface for Electron
declare global {
  interface Window {
    electron?: {
      isElectron: boolean;
      appInfo?: {
        getVersion: () => Promise<string>;
        getPlatform: () => string;
        getSystemInfo: () => Promise<Record<string, any>>;
        getAppPaths: () => Promise<Record<string, string>>;
      };
      exportData?: (data: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      importData?: () => Promise<{ success: boolean; data?: string; error?: string }>;
      saveLog?: (logData: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      system?: {
        openExternal: (url: string) => Promise<boolean>;
        openPath: (path: string) => Promise<boolean>;
        copyToClipboard: (text: string) => Promise<boolean>;
        readFromClipboard: () => Promise<string>;
        isPlatform: (platform: 'win32' | 'darwin' | 'linux') => Promise<boolean>;
      };
      updates?: {
        checkForUpdates: () => Promise<any>;
        downloadUpdate: () => Promise<any>;
        installUpdate: () => Promise<any>;
      };
      onMenuExportData?: (callback: () => void) => void;
      onMenuImportData?: (callback: () => void) => void;
    };
  }
}

// Extend the existing types
declare module '@/types' {
  export interface Invoice {
    id: string;
    customerId: string;
    invoiceNumber?: string;
    number: string;
    date: string;
    dueDate: string;
    items: Array<{
      productId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
    notes: string;
    termsAndConditions: string;
    createdAt: string;
    updatedAt: string;
    discount?: number;
    shipping?: number;
  }

  export interface StockRecord {
    id: string;
    productId: string;
    quantity: number;
    date: string;
    type: 'in' | 'out' | 'adjustment';
    notes?: string;
    relatedEntryId?: string;
    // Added properties
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
  }

  export interface TaxSetting {
    id: string;
    name: string;
    rate: number;
    isActive: boolean;
    isDefault: boolean;
  }

  // Make sure the Expense interface has the correct properties
  export interface Expense {
    id: string;
    category: string;
    amount: number;
    date: string;
    recurring: boolean;
    recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    title: string;
    notes?: string;
    paidTo?: string;
    description: string; // Added for compatibility
    paymentMethod: string; // Added for compatibility
    reference?: string; // Added for compatibility
    isRecurring?: boolean; // Added for compatibility with existing code
  }

  // Updated Vehicle interface with the missing properties
  export interface Vehicle {
    id: string;
    name: string;
    type: string;
    registrationNumber: string;
    driverName?: string;
    isActive: boolean;
    capacity?: number;
    description?: string;
  }

  // Updated UISettings interface with the missing properties
  export interface UISettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: string;
    currencyFormat: string;
    fontSize?: 'small' | 'medium' | 'large';
    colorScheme?: string;
    sidebarStyle?: 'compact' | 'expanded';
    tableStyle?: 'bordered' | 'minimal' | 'striped';
    notificationFrequency?: 'high' | 'medium' | 'low' | 'off';
    compactMode: boolean; // Added for compatibility
    currency: string; // Added for compatibility
    sidebarCollapsed: boolean; // Added for compatibility
    defaultPaymentMethod: string; // Added for compatibility
    defaultReportPeriod: string; // Added for compatibility
  }

  // Updated TrackSheet interface with compatible properties
  export interface TrackSheet {
    id: string;
    date: string;
    vehicleId?: string;
    salesmanId?: string;
    rows: TrackSheetRow[];
    routeName?: string;
    name: string; // Required property
    title?: string; // For backward compatibility
    createdAt?: string;
    updatedAt?: string;
    vehicleName?: string;
    salesmanName?: string;
    savedAt?: string;
  }

  // Updated TrackSheetRow interface with all required properties
  export interface TrackSheetRow {
    name: string;
    customerName?: string; // Made optional for compatibility
    customerId?: string;
    quantities: Record<string, number | string>;
    total: number;
    amount: number;
    products?: string[];
  }

  // Updated Salesman interface with necessary properties
  export interface Salesman {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    isActive: boolean;
    vehicleId?: string;
  }

  // Updated SupplierPayment interface with method property
  export interface SupplierPayment {
    id: string;
    supplierId: string;
    amount: number;
    date: string;
    paymentMethod: 'cash' | 'bank' | 'upi' | 'other';
    referenceNumber?: string;
    notes?: string;
    method?: 'cash' | 'bank' | 'upi' | 'other'; // For backward compatibility
  }
}
