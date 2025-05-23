
import { ElectronService } from './ElectronService';
import { toast } from 'sonner';

/**
 * StorageService - Handles application data storage operations
 * with fallbacks for web-only mode
 */
export const StorageService = {
  /**
   * Get estimated localStorage usage in KB
   * @returns Storage usage in KB
   */
  getStorageUsage: (): number => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Get the size of the key + value
          const value = localStorage.getItem(key) || '';
          total += (key.length + value.length) * 2; // Approximate size in bytes (UTF-16 = 2 bytes per char)
        }
      }
      // Convert bytes to KB and round to 2 decimal places
      return Math.round((total / 1024) * 100) / 100;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  },
  
  /**
   * Save data to localStorage
   * @param key Storage key
   * @param data Data to save
   * @returns Success status
   */
  saveToStorage: (key: string, data: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      toast.error(`Failed to save ${key} data`);
      return false;
    }
  },
  
  /**
   * Load data from localStorage
   * @param key Storage key
   * @param defaultValue Default value if key doesn't exist
   * @returns Retrieved data or default value
   */
  loadFromStorage: <T>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      toast.error(`Failed to load ${key} data`);
      return defaultValue;
    }
  },
  
  /**
   * Remove data from localStorage
   * @param key Storage key
   * @returns Success status
   */
  removeFromStorage: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },
  
  /**
   * Export all application data to a JSON file
   * @returns Promise resolving to success status
   */
  exportAllData: async (): Promise<boolean> => {
    try {
      // Gather all data from localStorage
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch (e) {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      
      // Create a JSON string
      const jsonData = JSON.stringify(data, null, 2);
      const filename = `milk-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Use ElectronService to export data
      const result = await ElectronService.exportData(jsonData, filename);
      
      if (result.success) {
        toast.success('Data exported successfully');
        return true;
      } else {
        toast.error(`Export failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
      return false;
    }
  },
  
  /**
   * Import data from a JSON file
   * @returns Promise resolving to success status
   */
  importData: async (): Promise<boolean> => {
    try {
      // Use ElectronService to import data
      const result = await ElectronService.importData();
      
      if (result && typeof result === 'object' && 'success' in result && result.success && 'data' in result && result.data) {
        try {
          const data = JSON.parse(result.data as string);
          
          // Clear current localStorage
          localStorage.clear();
          
          // Set all imported data to localStorage
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          });
          
          toast.success('Data imported successfully');
          toast.info('Please restart the application to apply changes', {
            duration: 5000
          });
          return true;
        } catch (e) {
          console.error('Error parsing imported data:', e);
          toast.error('The selected file contains invalid data');
          return false;
        }
      } else {
        toast.error(`Import failed: ${result && typeof result === 'object' && 'error' in result ? result.error : 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
      return false;
    }
  },
  
  /**
   * Clear all application data
   * @returns Success status
   */
  clearAllData: (): boolean => {
    try {
      localStorage.clear();
      toast.success('All data cleared');
      toast.info('Please restart the application to apply changes', {
        duration: 5000
      });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
      return false;
    }
  },
  
  /**
   * Save application logs
   * @param logs Log data to save
   * @returns Promise resolving to success status
   */
  saveLogs: async (logs: string): Promise<boolean> => {
    try {
      const filename = `milk-center-logs-${new Date().toISOString().slice(0, 10)}.txt`;
      
      // Use ElectronService to save logs
      const result = await ElectronService.saveLog(logs, filename);
      
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          toast.success('Logs saved successfully');
          return true;
        } else {
          toast.error(`Failed to save logs: ${result && 'error' in result ? result.error : 'Unknown error'}`);
          return false;
        }
      } else {
        toast.error('Failed to save logs: Invalid response');
        return false;
      }
    } catch (error) {
      console.error('Error saving logs:', error);
      toast.error('Failed to save logs');
      return false;
    }
  }
};
