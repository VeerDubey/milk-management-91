
import { OfflineStorageService } from './OfflineStorageService';
import { DownloadService } from './DownloadService';
import { toast } from 'sonner';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
}

export class APIService {
  private static baseURL = '/api';
  private static cachePrefix = 'api_cache_';
  
  /**
   * Generic API request handler with offline support
   */
  static async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    useCache: boolean = true
  ): Promise<APIResponse<T>> {
    const cacheKey = `${this.cachePrefix}${endpoint}`;
    
    try {
      // If offline, try to get from cache
      if (!OfflineStorageService.isOnline() && useCache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          console.log(`Serving ${endpoint} from cache (offline)`);
          return { success: true, data, fromCache: true };
        }
        
        // Queue for later sync if it's a mutation
        if (options.method && options.method !== 'GET') {
          OfflineStorageService.queueOfflineAction({
            endpoint,
            options,
            timestamp: Date.now()
          });
          toast.info('Request queued for when online');
        }
        
        return { success: false, error: 'No cached data available offline' };
      }
      
      // Online request
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache GET requests
      if ((!options.method || options.method === 'GET') && useCache) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
      
      return { success: true, data };
      
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Try cache as fallback
      if (useCache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          console.log(`Serving ${endpoint} from cache (fallback)`);
          return { success: true, data, fromCache: true };
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Specific API methods
  static async getCustomers() {
    return this.request('/customers');
  }
  
  static async getProducts() {
    return this.request('/products');
  }
  
  static async getOrders() {
    return this.request('/orders');
  }
  
  static async getTrackSheets() {
    return this.request('/tracksheets');
  }
  
  static async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }, false);
  }
  
  static async createTrackSheet(trackSheetData: any) {
    return this.request('/tracksheets', {
      method: 'POST',
      body: JSON.stringify(trackSheetData)
    }, false);
  }
  
  static async updateTrackSheet(id: string, data: any) {
    return this.request(`/tracksheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, false);
  }
  
  static async deleteTrackSheet(id: string) {
    return this.request(`/tracksheets/${id}`, {
      method: 'DELETE'
    }, false);
  }
  
  static async syncOfflineData() {
    if (!OfflineStorageService.isOnline()) {
      return { success: false, error: 'Still offline' };
    }
    
    return await OfflineStorageService.synchronize();
  }
  
  /**
   * Clear all cached data
   */
  static clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.cachePrefix)) {
        localStorage.removeItem(key);
      }
    });
    toast.success('Cache cleared');
  }
  
  /**
   * Export data for backup
   */
  static async exportAllData() {
    const data = {
      customers: await this.getCustomers(),
      products: await this.getProducts(),
      orders: await this.getOrders(),
      trackSheets: await this.getTrackSheets(),
      exportDate: new Date().toISOString()
    };
    
    return DownloadService.downloadJSON(data, `backup-${new Date().toISOString().split('T')[0]}`);
  }
}
