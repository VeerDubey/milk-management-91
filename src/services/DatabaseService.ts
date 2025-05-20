
import { ElectronService } from './ElectronService';

// Define the types for database operations
type TableName = 'customers' | 'products' | 'orders' | 'invoices' | 'settings';

interface QueryParams {
  where?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export class DatabaseService {
  private static db: any = null;
  private static isInitialized: boolean = false;
  
  // Initialize the database connection
  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      if (ElectronService.isElectron()) {
        // In Electron, use better-sqlite3 through IPC
        console.log('Running in Electron, initializing SQLite database');
        const result = await window.electron?.db?.initialize();
        this.isInitialized = result?.success || false;
      } else {
        // In browser, use IndexedDB through OfflineStorageService
        console.log('Running in browser, using IndexedDB for offline storage');
        this.isInitialized = true;
      }
      
      return this.isInitialized;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }
  
  // Create or update records
  static async save(table: TableName, data: Record<string, any> | Record<string, any>[]): Promise<any> {
    await this.ensureInitialized();
    
    try {
      if (ElectronService.isElectron()) {
        // In Electron, use better-sqlite3 through IPC
        return await window.electron?.db?.save(table, data);
      } else {
        // In browser, use local storage
        const key = `${table}_data`;
        const existingData = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (Array.isArray(data)) {
          // Handle array of records
          const updatedData = [...existingData];
          
          for (const item of data) {
            const index = updatedData.findIndex(record => record.id === item.id);
            
            if (index >= 0) {
              // Update existing record
              updatedData[index] = { ...updatedData[index], ...item };
            } else {
              // Add new record
              updatedData.push({
                id: item.id || crypto.randomUUID(),
                ...item
              });
            }
          }
          
          localStorage.setItem(key, JSON.stringify(updatedData));
          return { success: true, data: updatedData };
        } else {
          // Handle single record
          const singleItem = data as Record<string, any>;
          const updatedData = [...existingData];
          const index = updatedData.findIndex(record => record.id === singleItem.id);
          
          if (index >= 0) {
            // Update existing record
            updatedData[index] = { ...updatedData[index], ...singleItem };
          } else {
            // Add new record
            updatedData.push({
              id: singleItem.id || crypto.randomUUID(),
              ...singleItem
            });
          }
          
          localStorage.setItem(key, JSON.stringify(updatedData));
          return { success: true, data: singleItem };
        }
      }
    } catch (error) {
      console.error(`Error saving data to ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Query records
  static async query(table: TableName, params: QueryParams = {}): Promise<any> {
    await this.ensureInitialized();
    
    try {
      if (ElectronService.isElectron()) {
        // In Electron, use better-sqlite3 through IPC
        return await window.electron?.db?.query(table, params);
      } else {
        // In browser, use local storage
        const key = `${table}_data`;
        const allData = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Filter data based on where clause if provided
        let filteredData = allData;
        if (params.where) {
          filteredData = allData.filter((record: any) => {
            return Object.entries(params.where || {}).every(([key, value]) => {
              return record[key] === value;
            });
          });
        }
        
        // Order data if orderBy is provided
        if (params.orderBy) {
          const [field, direction] = params.orderBy.split(' ');
          filteredData.sort((a: any, b: any) => {
            if (direction?.toLowerCase() === 'desc') {
              return a[field] > b[field] ? -1 : a[field] < b[field] ? 1 : 0;
            } else {
              return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
            }
          });
        }
        
        // Apply pagination if limit is provided
        if (typeof params.limit === 'number') {
          const start = params.offset || 0;
          const end = start + params.limit;
          filteredData = filteredData.slice(start, end);
        }
        
        return { success: true, data: filteredData };
      }
    } catch (error) {
      console.error(`Error querying data from ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Get a single record by ID
  static async getById(table: TableName, id: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      if (ElectronService.isElectron()) {
        // In Electron, use better-sqlite3 through IPC
        return await window.electron?.db?.getById(table, id);
      } else {
        // In browser, use local storage
        const key = `${table}_data`;
        const allData = JSON.parse(localStorage.getItem(key) || '[]');
        const record = allData.find((item: any) => item.id === id);
        
        return { 
          success: true, 
          data: record || null 
        };
      }
    } catch (error) {
      console.error(`Error getting record ${id} from ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Delete records
  static async delete(table: TableName, id: string | string[]): Promise<any> {
    await this.ensureInitialized();
    
    try {
      if (ElectronService.isElectron()) {
        // In Electron, use better-sqlite3 through IPC
        return await window.electron?.db?.delete(table, id);
      } else {
        // In browser, use local storage
        const key = `${table}_data`;
        const allData = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (Array.isArray(id)) {
          // Delete multiple records
          const updatedData = allData.filter((item: any) => !id.includes(item.id));
          localStorage.setItem(key, JSON.stringify(updatedData));
        } else {
          // Delete single record
          const updatedData = allData.filter((item: any) => item.id !== id);
          localStorage.setItem(key, JSON.stringify(updatedData));
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error(`Error deleting data from ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Export all data as JSON
  static async exportData(): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const tables: TableName[] = ['customers', 'products', 'orders', 'invoices', 'settings'];
      const exportData: Record<string, any> = {};
      
      for (const table of tables) {
        if (ElectronService.isElectron()) {
          // In Electron, use better-sqlite3 through IPC
          const result = await window.electron?.db?.query(table);
          if (result?.success) {
            exportData[table] = result.data;
          }
        } else {
          // In browser, use local storage
          const key = `${table}_data`;
          exportData[table] = JSON.parse(localStorage.getItem(key) || '[]');
        }
      }
      
      return { 
        success: true, 
        data: exportData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Import data from JSON
  static async importData(data: Record<string, any>): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const tables: TableName[] = ['customers', 'products', 'orders', 'invoices', 'settings'];
      
      for (const table of tables) {
        if (data[table]) {
          if (ElectronService.isElectron()) {
            // In Electron, use better-sqlite3 through IPC
            await window.electron?.db?.importTable(table, data[table]);
          } else {
            // In browser, use local storage
            const key = `${table}_data`;
            localStorage.setItem(key, JSON.stringify(data[table]));
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Helper method to ensure database is initialized
  private static async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error('Database initialization failed');
      }
    }
  }
}
