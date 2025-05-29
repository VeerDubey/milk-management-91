
import { toast } from 'sonner';

class AdvancedAPIService {
  private baseUrl = '/api/v2';
  private cache = new Map();
  private retryCount = 3;
  private timeout = 10000;

  // Generic API call with retry logic and caching
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache = true,
    cacheKey?: string
  ): Promise<T> {
    const key = cacheKey || `${endpoint}-${JSON.stringify(options)}`;
    
    // Check cache first
    if (useCache && this.cache.has(key)) {
      return this.cache.get(key);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.retryRequest(
        endpoint,
        { ...options, signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      if (useCache) {
        this.cache.set(key, data);
        // Auto-expire cache after 5 minutes
        setTimeout(() => this.cache.delete(key), 5 * 60 * 1000);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      this.handleError(error);
      throw error;
    }
  }

  private async retryRequest(endpoint: string, options: RequestInit): Promise<Response> {
    let lastError: Error;

    for (let i = 0; i < this.retryCount; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`,
            ...options.headers,
          },
        });
        
        if (response.ok || response.status < 500) {
          return response;
        }
        
        throw new Error(`Server error: ${response.status}`);
      } catch (error) {
        lastError = error as Error;
        if (i < this.retryCount - 1) {
          await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private handleError(error: any): void {
    console.error('API Error:', error);
    
    if (error.name === 'AbortError') {
      toast.error('Request timed out. Please try again.');
    } else if (error.message.includes('Network')) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An error occurred. Please try again.');
    }
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear();
  }

  // Track Sheets API
  public async getTrackSheets(filters?: any) {
    return this.apiCall('/track-sheets', {
      method: 'GET',
      headers: filters ? { 'X-Filters': JSON.stringify(filters) } : {},
    });
  }

  public async createTrackSheet(data: any) {
    return this.apiCall('/track-sheets', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  public async updateTrackSheet(id: string, data: any) {
    return this.apiCall(`/track-sheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, false);
  }

  public async deleteTrackSheet(id: string) {
    return this.apiCall(`/track-sheets/${id}`, {
      method: 'DELETE',
    }, false);
  }

  // Analytics API
  public async getAnalytics(timeRange?: string) {
    return this.apiCall(`/analytics?range=${timeRange || '7d'}`);
  }

  public async getRealtimeMetrics() {
    return this.apiCall('/analytics/realtime', {}, false);
  }

  // Advanced Search API
  public async search(query: string, filters?: any) {
    return this.apiCall('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  }

  // Customers API
  public async getCustomers(pagination?: { page: number; limit: number }) {
    const params = pagination ? `?page=${pagination.page}&limit=${pagination.limit}` : '';
    return this.apiCall(`/customers${params}`);
  }

  public async createCustomer(data: any) {
    return this.apiCall('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  public async updateCustomer(id: string, data: any) {
    return this.apiCall(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, false);
  }

  // Products API
  public async getProducts() {
    return this.apiCall('/products');
  }

  public async createProduct(data: any) {
    return this.apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Orders API
  public async getOrders(filters?: any) {
    return this.apiCall('/orders', {
      method: 'GET',
      headers: filters ? { 'X-Filters': JSON.stringify(filters) } : {},
    });
  }

  public async createOrder(data: any) {
    return this.apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Payments API
  public async getPayments() {
    return this.apiCall('/payments');
  }

  public async createPayment(data: any) {
    return this.apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Backup and Sync API
  public async createBackup() {
    return this.apiCall('/backup', {
      method: 'POST',
    }, false);
  }

  public async restoreBackup(backupId: string) {
    return this.apiCall(`/backup/${backupId}/restore`, {
      method: 'POST',
    }, false);
  }

  public async syncData() {
    return this.apiCall('/sync', {
      method: 'POST',
    }, false);
  }

  // Notifications API
  public async getNotifications() {
    return this.apiCall('/notifications');
  }

  public async markNotificationAsRead(id: string) {
    return this.apiCall(`/notifications/${id}/read`, {
      method: 'PUT',
    }, false);
  }

  // Reports API
  public async generateReport(type: string, params?: any) {
    return this.apiCall(`/reports/${type}`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }, false);
  }

  public async downloadReport(reportId: string, format: 'pdf' | 'excel' | 'csv') {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}/download?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    return response.blob();
  }
}

export const advancedAPIService = new AdvancedAPIService();
