
import { Product } from '@/types';

// Auto-generate product codes from names
const generateProductCode = (name: string): string => {
  // Handle special cases first
  const specialCases: { [key: string]: string } = {
    'F&L': 'FL',
    'A. TAAK': 'AT',
    'W.TAAK': 'WT',
    'W.DAHI': 'WD',
    '100 W': '100W',
    '150 W': '150W',
    '80 A': '80A',
    '200 A': '200A'
  };

  if (specialCases[name]) {
    return specialCases[name];
  }

  // Split by space and take first letters
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }

  // Take first letter of each word
  let code = words.map(word => word.charAt(0)).join('');
  
  // Add numbers if present
  const numbers = name.match(/\d+/g);
  if (numbers) {
    code += numbers.join('');
  }

  return code.toUpperCase();
};

export const productsList: Omit<Product, 'id'>[] = [
  { name: 'AMUL TAZZA', code: 'AT', price: 28, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Amul Tazza Milk', createdAt: new Date().toISOString() },
  { name: 'AMUL COW', code: 'AC', price: 30, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Amul Cow Milk', createdAt: new Date().toISOString() },
  { name: 'AMUL A2', code: 'A2', price: 35, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Amul A2 Milk', createdAt: new Date().toISOString() },
  { name: 'MAHA', code: 'MA', price: 32, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Maha Milk', createdAt: new Date().toISOString() },
  { name: 'G.COW H', code: 'GCH', price: 29, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'G.Cow H Milk', createdAt: new Date().toISOString() },
  { name: 'G.COW F', code: 'GCF', price: 27, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'G.Cow F Milk', createdAt: new Date().toISOString() },
  { name: 'G.SPL H', code: 'GSH', price: 33, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'G.Special H Milk', createdAt: new Date().toISOString() },
  { name: 'G.SPL F', code: 'GSF', price: 31, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'G.Special F Milk', createdAt: new Date().toISOString() },
  { name: 'G.SHAKTI', code: 'GS', price: 34, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'G.Shakti Milk', createdAt: new Date().toISOString() },
  { name: 'G.DAHI H', code: 'GDH', price: 25, unit: 'piece', category: 'Curd', isActive: true, hasVariants: false, description: 'G.Dahi H', createdAt: new Date().toISOString() },
  { name: 'G.DAHI F', code: 'GDF', price: 23, unit: 'piece', category: 'Curd', isActive: true, hasVariants: false, description: 'G.Dahi F', createdAt: new Date().toISOString() },
  { name: 'TONE H', code: 'TH', price: 26, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Tone H Milk', createdAt: new Date().toISOString() },
  { name: 'TONE F', code: 'TF', price: 24, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Tone F Milk', createdAt: new Date().toISOString() },
  { name: 'SPL H', code: 'SH', price: 30, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Special H Milk', createdAt: new Date().toISOString() },
  { name: 'SPL F', code: 'SF', price: 28, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Special F Milk', createdAt: new Date().toISOString() },
  { name: 'SPL J', code: 'SJ', price: 32, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Special J Milk', createdAt: new Date().toISOString() },
  { name: 'AKSHARA', code: 'AK', price: 27, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Akshara Milk', createdAt: new Date().toISOString() },
  { name: 'SARTHI', code: 'SA', price: 29, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Sarthi Milk', createdAt: new Date().toISOString() },
  { name: 'WARNA SPL', code: 'WS', price: 31, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Warna Special Milk', createdAt: new Date().toISOString() },
  { name: 'WARNA COW', code: 'WC', price: 30, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Warna Cow Milk', createdAt: new Date().toISOString() },
  { name: 'WARNA TAZZA', code: 'WTZ', price: 28, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: 'Warna Tazza Milk', createdAt: new Date().toISOString() },
  { name: 'A. TAAK', code: 'AT', price: 20, unit: 'piece', category: 'Buttermilk', isActive: true, hasVariants: false, description: 'A. Taak Buttermilk', createdAt: new Date().toISOString() },
  { name: 'W.TAAK', code: 'WT', price: 18, unit: 'piece', category: 'Buttermilk', isActive: true, hasVariants: false, description: 'W.Taak Buttermilk', createdAt: new Date().toISOString() },
  { name: 'W.DAHI', code: 'WD', price: 22, unit: 'piece', category: 'Curd', isActive: true, hasVariants: false, description: 'W.Dahi Curd', createdAt: new Date().toISOString() },
  { name: '100 W', code: '100W', price: 25, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: '100 W Milk', createdAt: new Date().toISOString() },
  { name: '150 W', code: '150W', price: 30, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: '150 W Milk', createdAt: new Date().toISOString() },
  { name: '80 A', code: '80A', price: 20, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: '80 A Milk', createdAt: new Date().toISOString() },
  { name: '200 A', code: '200A', price: 35, unit: 'piece', category: 'Milk', isActive: true, hasVariants: false, description: '200 A Milk', createdAt: new Date().toISOString() }
];

export { generateProductCode };
