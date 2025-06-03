
import { InvoiceTemplate } from '@/types/invoice';

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'professional_blue',
    name: 'Professional Blue',
    description: 'Clean professional template with blue accents',
    category: 'professional',
    layout: 'detailed',
    primaryColor: '#2563eb',
    fontFamily: 'Inter, sans-serif',
    headerStyle: 'banner',
    itemTableStyle: 'bordered'
  },
  {
    id: 'modern_green',
    name: 'Modern Green',
    description: 'Modern design with eco-friendly green theme',
    category: 'modern',
    layout: 'compact',
    primaryColor: '#059669',
    fontFamily: 'Roboto, sans-serif',
    headerStyle: 'logo',
    itemTableStyle: 'striped'
  },
  {
    id: 'classic_black',
    name: 'Classic Black',
    description: 'Timeless black and white professional design',
    category: 'classic',
    layout: 'detailed',
    primaryColor: '#1f2937',
    fontFamily: 'Times New Roman, serif',
    headerStyle: 'simple',
    itemTableStyle: 'bordered'
  },
  {
    id: 'thermal_receipt',
    name: 'Thermal Receipt',
    description: 'Optimized for 80mm thermal printers',
    category: 'thermal',
    layout: 'minimal',
    primaryColor: '#000000',
    fontFamily: 'Courier New, monospace',
    headerStyle: 'simple',
    itemTableStyle: 'minimal'
  },
  {
    id: 'dairy_fresh',
    name: 'Dairy Fresh',
    description: 'Milk-themed template with fresh colors',
    category: 'modern',
    layout: 'compact',
    primaryColor: '#0ea5e9',
    fontFamily: 'Poppins, sans-serif',
    headerStyle: 'banner',
    itemTableStyle: 'striped'
  },
  {
    id: 'minimal_white',
    name: 'Minimal White',
    description: 'Clean minimal design with lots of white space',
    category: 'modern',
    layout: 'minimal',
    primaryColor: '#6366f1',
    fontFamily: 'Inter, sans-serif',
    headerStyle: 'simple',
    itemTableStyle: 'minimal'
  },
  {
    id: 'corporate_gold',
    name: 'Corporate Gold',
    description: 'Premium corporate template with gold accents',
    category: 'professional',
    layout: 'detailed',
    primaryColor: '#d97706',
    fontFamily: 'Montserrat, sans-serif',
    headerStyle: 'logo',
    itemTableStyle: 'bordered'
  },
  {
    id: 'simple_receipt',
    name: 'Simple Receipt',
    description: 'Basic receipt format for quick printing',
    category: 'thermal',
    layout: 'minimal',
    primaryColor: '#374151',
    fontFamily: 'Arial, sans-serif',
    headerStyle: 'simple',
    itemTableStyle: 'minimal'
  },
  {
    id: 'elegant_purple',
    name: 'Elegant Purple',
    description: 'Sophisticated design with purple highlights',
    category: 'professional',
    layout: 'detailed',
    primaryColor: '#7c3aed',
    fontFamily: 'Playfair Display, serif',
    headerStyle: 'banner',
    itemTableStyle: 'striped'
  },
  {
    id: 'fresh_milk_blue',
    name: 'Fresh Milk Blue',
    description: 'Light blue theme perfect for dairy businesses',
    category: 'modern',
    layout: 'compact',
    primaryColor: '#3b82f6',
    fontFamily: 'Nunito, sans-serif',
    headerStyle: 'logo',
    itemTableStyle: 'bordered'
  }
];

export const MILK_PRODUCTS: any[] = [
  {
    id: 'whole_milk_1l',
    name: 'Whole Milk',
    category: 'whole_milk',
    unit: 'liter',
    defaultRate: 60,
    description: 'Fresh whole milk with 3.5% fat content'
  },
  {
    id: 'skimmed_milk_1l',
    name: 'Skimmed Milk',
    category: 'skimmed_milk',
    unit: 'liter',
    defaultRate: 55,
    description: 'Low-fat skimmed milk with 0.5% fat'
  },
  {
    id: 'organic_milk_1l',
    name: 'Organic Milk',
    category: 'organic_milk',
    unit: 'liter',
    defaultRate: 80,
    description: 'Certified organic whole milk'
  },
  {
    id: 'buffalo_milk_1l',
    name: 'Buffalo Milk',
    category: 'buffalo_milk',
    unit: 'liter',
    defaultRate: 70,
    description: 'Rich buffalo milk with high fat content'
  },
  {
    id: 'paneer_250g',
    name: 'Fresh Paneer',
    category: 'dairy_products',
    unit: 'gm',
    defaultRate: 120,
    description: 'Fresh cottage cheese - 250g pack'
  },
  {
    id: 'yogurt_500g',
    name: 'Fresh Yogurt',
    category: 'dairy_products',
    unit: 'gm',
    defaultRate: 40,
    description: 'Homemade fresh yogurt - 500g'
  },
  {
    id: 'butter_100g',
    name: 'Pure Butter',
    category: 'dairy_products',
    unit: 'gm',
    defaultRate: 80,
    description: 'Pure white butter - 100g'
  },
  {
    id: 'ghee_500g',
    name: 'Pure Ghee',
    category: 'dairy_products',
    unit: 'gm',
    defaultRate: 450,
    description: 'Pure cow ghee - 500g jar'
  }
];

export const CURRENCIES = [
  { code: 'INR' as const, symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD' as const, symbol: '$', name: 'US Dollar' }
];

export const DEFAULT_COMPANY_PROFILE = {
  name: 'Vikas Milk Centre',
  address: '123 Dairy Street, Milk Valley, State - 400001',
  phone: '+91 98765 43210',
  email: 'contact@vikasmilk.com',
  gstNumber: '27AABCV1234F1Z5',
  website: 'www.vikasmilk.com'
};

export const PRESET_NOTES = [
  'Thank you for your business! Fresh milk delivered daily.',
  'Payment due within 7 days. Late charges may apply.',
  'For any queries, please contact us at the above number.',
  'Quality assured - Farm fresh milk guaranteed.',
  'Next delivery scheduled for tomorrow morning.',
  'Special discount applied for regular customers.'
];

export const DEFAULT_TERMS = `Terms & Conditions:
1. Payment due within specified due date
2. Late payments may incur additional charges
3. Quality guarantee on all dairy products
4. Delivery timing: 6:00 AM - 8:00 AM daily
5. For complaints, contact within 24 hours
6. All prices inclusive of applicable taxes`;
