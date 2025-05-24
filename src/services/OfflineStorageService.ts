import Dexie, { Table } from 'dexie';

export interface Customer {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  unit: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id?: number;
  customerId: number;
  customerName: string;
  products: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id?: number;
  customerId: number;
  customerName: string;
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'check';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class OfflineDatabase extends Dexie {
  customers!: Table<Customer>;
  products!: Table<Product>;
  orders!: Table<Order>;
  payments!: Table<Payment>;

  constructor() {
    super('MilkCenterDB');
    this.version(1).stores({
      customers: '++id, name, phone, email, createdAt',
      products: '++id, name, category, createdAt',
      orders: '++id, customerId, customerName, date, status, createdAt',
      payments: '++id, customerId, customerName, date, method, createdAt'
    });
  }
}

export const db = new OfflineDatabase();

export class OfflineStorageService {
  static async exportAllData(): Promise<string> {
    try {
      const customers = await db.customers.toArray();
      const products = await db.products.toArray();
      const orders = await db.orders.toArray();
      const payments = await db.payments.toArray();

      const exportData = {
        customers,
        products,
        orders,
        payments,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  static async importAllData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.customers || !data.products || !data.orders || !data.payments) {
        throw new Error('Invalid data format');
      }

      // Clear existing data
      await db.transaction('rw', db.customers, db.products, db.orders, db.payments, async () => {
        await db.customers.clear();
        await db.products.clear();
        await db.orders.clear();
        await db.payments.clear();

        // Import new data
        await db.customers.bulkAdd(data.customers);
        await db.products.bulkAdd(data.products);
        await db.orders.bulkAdd(data.orders);
        await db.payments.bulkAdd(data.payments);
      });
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import data');
    }
  }

  static async createAutoBackup(): Promise<void> {
    try {
      const backupData = await this.exportAllData();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `milk-center-auto-backup-${timestamp}.json`;
      
      // Store in localStorage as backup
      localStorage.setItem('auto_backup_' + timestamp, backupData);
      
      // Keep only last 7 auto-backups
      const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('auto_backup_'));
      if (backupKeys.length > 7) {
        backupKeys.sort();
        backupKeys.slice(0, -7).forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Auto-backup failed:', error);
      throw new Error('Failed to create auto-backup');
    }
  }
}
