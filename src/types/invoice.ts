
export interface Currency {
  code: 'INR' | 'USD';
  symbol: string;
  name: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'thermal' | 'modern' | 'classic';
  layout: 'compact' | 'detailed' | 'minimal';
  primaryColor: string;
  fontFamily: string;
  headerStyle: 'simple' | 'logo' | 'banner';
  itemTableStyle: 'bordered' | 'striped' | 'minimal';
}

export interface MilkProduct {
  id: string;
  name: string;
  category: 'whole_milk' | 'skimmed_milk' | 'organic_milk' | 'buffalo_milk' | 'dairy_products';
  unit: 'liter' | 'ml' | 'kg' | 'gm' | 'piece';
  defaultRate: number;
  description?: string;
}

export interface InvoiceFormData {
  // Customer Information
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail?: string;
  
  // Delivery Information
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime?: string;
  
  // Business Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail?: string;
  companyGST?: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: Currency;
  
  // Items
  items: InvoiceItem[];
  
  // Calculations
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  
  // Additional
  notes: string;
  terms: string;
  templateId: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
  category?: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
  logo?: string;
  website?: string;
}
