
// Include the missing types for TrackSheet, TrackSheetRow, Invoice, etc.

import { ReactNode } from 'react';

// Extend the existing types
declare module '@/types' {
  export interface Invoice {
    id: string;
    customerId: string;
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
  }

  export interface StockRecord {
    id: string;
    productId: string;
    quantity: number;
    date: string;
    type: 'in' | 'out' | 'adjustment';
    notes?: string;
    relatedEntryId?: string;
  }

  export interface StockEntryItem {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }

  export interface StockEntry {
    id: string;
    supplierId: string;
    date: string;
    items: StockEntryItem[];
    notes?: string;
    totalAmount: number;
    paymentStatus: 'paid' | 'partial' | 'unpaid';
    createdAt: string;
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
  }

  // Make sure the Vehicle interface has the correct properties
  export interface Vehicle {
    id: string;
    name: string;
    type: string;
    registrationNumber: string;
    driverName?: string;
    isActive: boolean;
    capacity?: number;
  }

  // Make sure the UISettings interface has the correct properties
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
  }

  // Make sure the TrackSheet interface has the correct properties
  export interface TrackSheet {
    id: string;
    date: string;
    vehicleId?: string;
    salesmanId?: string;
    rows: TrackSheetRow[];
    routeName?: string;
    title?: string; // Added for compatibility
    createdAt?: string;
    updatedAt?: string;
  }

  // Make sure the Salesman interface has the correct property
  export interface Salesman {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    isActive: boolean;
    vehicleId?: string;
  }
}
