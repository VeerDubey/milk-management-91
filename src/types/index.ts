export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image?: string;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  customerId: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  vehicleId: string;
  salesmanId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial';
}

export interface Payment {
  id: string;
  customerId: string;
  orderId: string;
  date: string;
  amount: number;
  method: string;
}

export interface ProductRate {
  id: string;
  productId: string;
  date: string;
  rate: number;
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
}

export interface Stock {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  date: string;
}

export interface UISettings {
  theme: 'light' | 'dark';
  language: 'en' | 'es';
  currency: 'USD' | 'EUR' | 'GBP';
}

export interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  type: string;
  capacity: number;
  isActive: boolean;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

// Add the TrackSheet type
export interface TrackSheetRow {
  name: string;
  quantities: Record<string, number | string>;
  total: number;
  amount: number;
}

export interface TrackSheet {
  id: string;
  title: string;
  date: string;
  vehicleId: string;
  salesmanId: string;
  productNames: string[];
  rows: TrackSheetRow[];
}
