
import { db } from '../database/OfflineDatabase';
import { ConfigManager } from '@/config/AppConfig';
import { toast } from 'sonner';

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  conflicts: number;
}

export class SyncService {
  private static isOnline = navigator.onLine;
  private static syncInProgress = false;

  static initialize() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      toast.success('Back online! Starting sync...');
      this.performSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      toast.warning('You are now offline. Changes will be saved locally.');
    });

    // Auto-sync when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performSync();
      }
    }, ConfigManager.getConfig().sync.syncInterval * 60 * 1000);
  }

  static async performSync(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline) {
      return { success: false, processed: 0, failed: 0, conflicts: 0 };
    }

    this.syncInProgress = true;
    console.log('Starting sync process...');

    try {
      const pendingItems = await db.getPendingSyncItems();
      let processed = 0;
      let failed = 0;
      let conflicts = 0;

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          processed++;
        } catch (error) {
          console.error('Sync failed for item:', item, error);
          failed++;
        }
      }

      if (processed > 0) {
        await db.clearSyncQueue();
        toast.success(`Synced ${processed} items successfully`);
      }

      return { success: true, processed, failed, conflicts };
    } catch (error) {
      console.error('Sync process failed:', error);
      return { success: false, processed: 0, failed: 0, conflicts: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  private static async syncItem(item: any): Promise<void> {
    // Simulate API call - replace with actual backend integration
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Here you would implement actual HTTP requests to your backend
    console.log('Syncing item:', item);
  }

  static async resolveConflict(localData: any, serverData: any, resolution: 'client' | 'server' | 'merge'): Promise<any> {
    switch (resolution) {
      case 'client':
        return localData;
      case 'server':
        return serverData;
      case 'merge':
        return { ...serverData, ...localData, lastModified: Date.now() };
      default:
        throw new Error('Invalid conflict resolution strategy');
    }
  }

  static getOnlineStatus(): boolean {
    return this.isOnline;
  }
}
