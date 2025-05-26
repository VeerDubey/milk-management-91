
import { DownloadService } from './DownloadService';
import { toast } from 'sonner';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    customers: any[];
    products: any[];
    orders: any[];
    trackSheets: any[];
    settings: any;
  };
}

export class BackupService {
  private static readonly BACKUP_VERSION = '1.0.0';
  
  static async createBackup(): Promise<boolean> {
    try {
      // Get all data from localStorage
      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        data: {
          customers: JSON.parse(localStorage.getItem('customers') || '[]'),
          products: JSON.parse(localStorage.getItem('products') || '[]'),
          orders: JSON.parse(localStorage.getItem('orders') || '[]'),
          trackSheets: JSON.parse(localStorage.getItem('trackSheets') || '[]'),
          settings: JSON.parse(localStorage.getItem('settings') || '{}')
        }
      };
      
      const filename = `vikas-milk-backup-${new Date().toISOString().split('T')[0]}`;
      const success = await DownloadService.downloadJSON(backupData, filename);
      
      if (success) {
        toast.success('Backup created successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Backup creation failed:', error);
      toast.error('Failed to create backup');
      return false;
    }
  }
  
  static async restoreBackup(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // Validate backup format
      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file format');
      }
      
      // Confirm with user before restoring
      const confirmed = window.confirm(
        `This will replace all current data with backup from ${new Date(backupData.timestamp).toLocaleDateString()}. Continue?`
      );
      
      if (!confirmed) {
        return false;
      }
      
      // Restore data to localStorage
      localStorage.setItem('customers', JSON.stringify(backupData.data.customers));
      localStorage.setItem('products', JSON.stringify(backupData.data.products));
      localStorage.setItem('orders', JSON.stringify(backupData.data.orders));
      localStorage.setItem('trackSheets', JSON.stringify(backupData.data.trackSheets));
      localStorage.setItem('settings', JSON.stringify(backupData.data.settings));
      
      toast.success('Backup restored successfully. Please refresh the page.');
      
      // Refresh page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Backup restoration failed:', error);
      toast.error('Failed to restore backup');
      return false;
    }
  }
  
  static async autoBackup(): Promise<void> {
    const lastBackup = localStorage.getItem('lastAutoBackup');
    const now = Date.now();
    
    // Auto backup every 24 hours
    if (!lastBackup || now - parseInt(lastBackup) > 24 * 60 * 60 * 1000) {
      console.log('Creating automatic backup...');
      await this.createBackup();
      localStorage.setItem('lastAutoBackup', now.toString());
    }
  }
}
