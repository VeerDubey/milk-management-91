import Dexie, { Table } from 'dexie';
import { Customer, Product, Order, Payment, Supplier, Expense } from '@/types';

export interface StoredData {
  id?: number;
  type: string;
  data: any;
  timestamp: number;
}

class OfflineDatabase extends Dexie {
  customers!: Table<Customer>;
  products!: Table<Product>;
  orders!: Table<Order>;
  payments!: Table<Payment>;
  suppliers!: Table<Supplier>;
  expenses!: Table<Expense>;
  backups!: Table<StoredData>;

  constructor() {
    super('MilkCenterDB');
    
    this.version(1).stores({
      customers: '++id, name, phone, isActive',
      products: '++id, name, price, isActive, category',
      orders: '++id, customerId, date, status, total',
      payments: '++id, customerId, date, amount',
      suppliers: '++id, name, phone, isActive',
      expenses: '++id, date, category, amount',
      backups: '++id, type, timestamp'
    });
  }
}

export const db = new OfflineDatabase();

export class OfflineStorageService {
  // Generic CRUD operations
  static async saveData<T>(table: string, data: T[]): Promise<void> {
    try {
      const dbTable = (db as any)[table];
      await dbTable.clear();
      await dbTable.bulkAdd(data);
      console.log(`Saved ${data.length} ${table} records`);
    } catch (error) {
      console.error(`Error saving ${table}:`, error);
      throw error;
    }
  }

  static async loadData<T>(table: string): Promise<T[]> {
    try {
      const dbTable = (db as any)[table];
      const data = await dbTable.toArray();
      console.log(`Loaded ${data.length} ${table} records`);
      return data;
    } catch (error) {
      console.error(`Error loading ${table}:`, error);
      return [];
    }
  }

  static async addRecord<T>(table: string, record: T): Promise<void> {
    try {
      const dbTable = (db as any)[table];
      await dbTable.add(record);
    } catch (error) {
      console.error(`Error adding ${table} record:`, error);
      throw error;
    }
  }

  static async updateRecord<T>(table: string, id: string, updates: Partial<T>): Promise<void> {
    try {
      const dbTable = (db as any)[table];
      await dbTable.update(id, updates);
    } catch (error) {
      console.error(`Error updating ${table} record:`, error);
      throw error;
    }
  }

  static async deleteRecord(table: string, id: string): Promise<void> {
    try {
      const dbTable = (db as any)[table];
      await dbTable.delete(id);
    } catch (error) {
      console.error(`Error deleting ${table} record:`, error);
      throw error;
    }
  }

  // Backup and restore
  static async exportAllData(): Promise<string> {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          customers: await this.loadData('customers'),
          products: await this.loadData('products'),
          orders: await this.loadData('orders'),
          payments: await this.loadData('payments'),
          suppliers: await this.loadData('suppliers'),
          expenses: await this.loadData('expenses')
        }
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  static async importAllData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.data) {
        throw new Error('Invalid backup format');
      }

      // Import each table
      for (const [table, records] of Object.entries(importData.data)) {
        if (Array.isArray(records)) {
          await this.saveData(table, records);
        }
      }
      
      console.log('Data import completed successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  static async createAutoBackup(): Promise<void> {
    try {
      const backupData = await this.exportAllData();
      await db.backups.add({
        type: 'auto-backup',
        data: backupData,
        timestamp: Date.now()
      });
      
      // Keep only last 5 auto-backups
      const backups = await db.backups.where('type').equals('auto-backup').toArray();
      if (backups.length > 5) {
        const oldBackups = backups.slice(0, -5);
        await Promise.all(oldBackups.map(backup => 
          backup.id ? db.backups.delete(backup.id) : Promise.resolve()
        ));
      }
    } catch (error) {
      console.error('Error creating auto-backup:', error);
    }
  }

  // Sync with localStorage (for compatibility)
  static async syncWithLocalStorage(): Promise<void> {
    try {
      // Load from localStorage and save to IndexedDB
      const tables = ['customers', 'products', 'orders', 'payments', 'suppliers', 'expenses'];
      
      for (const table of tables) {
        const localData = localStorage.getItem(table);
        if (localData) {
          const parsedData = JSON.parse(localData);
          await this.saveData(table, parsedData);
        }
      }
    } catch (error) {
      console.error('Error syncing with localStorage:', error);
    }
  }
}
