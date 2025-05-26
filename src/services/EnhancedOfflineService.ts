import { toast } from 'sonner';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'customer' | 'product' | 'order' | 'tracksheet';
  data: any;
  timestamp: number;
  retryCount: number;
}

export class EnhancedOfflineService {
  private static readonly STORAGE_KEY = 'offline_actions';
  private static readonly MAX_RETRIES = 3;
  private static syncInProgress = false;
  
  static initialize() {
    console.log('Enhanced offline service initialized');
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      toast.success('Back online! Syncing data...');
      this.syncPendingActions();
    });
    
    window.addEventListener('offline', () => {
      toast.warning('You are now offline. Changes will be saved locally.');
    });
  }
  
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  static queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) {
    const fullAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    const actions = this.getPendingActions();
    actions.push(fullAction);
    this.savePendingActions(actions);
    
    console.log('Action queued:', fullAction);
    
    if (this.isOnline()) {
      this.syncPendingActions();
    }
  }
  
  static getPendingActions(): OfflineAction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading pending actions:', error);
      return [];
    }
  }
  
  private static savePendingActions(actions: OfflineAction[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }
  
  static async syncPendingActions(): Promise<boolean> {
    if (this.syncInProgress || !this.isOnline()) {
      return false;
    }
    
    this.syncInProgress = true;
    const actions = this.getPendingActions();
    
    if (actions.length === 0) {
      this.syncInProgress = false;
      return true;
    }
    
    console.log(`Syncing ${actions.length} pending actions...`);
    
    const successfulActions: string[] = [];
    const failedActions: OfflineAction[] = [];
    
    for (const action of actions) {
      try {
        await this.executeAction(action);
        successfulActions.push(action.id);
        console.log('Successfully synced action:', action.id);
      } catch (error) {
        console.error('Failed to sync action:', action.id, error);
        
        action.retryCount++;
        if (action.retryCount < this.MAX_RETRIES) {
          failedActions.push(action);
        } else {
          console.warn('Max retries reached for action:', action.id);
        }
      }
    }
    
    // Update pending actions (remove successful, keep failed)
    this.savePendingActions(failedActions);
    
    if (successfulActions.length > 0) {
      toast.success(`Synced ${successfulActions.length} changes`);
    }
    
    if (failedActions.length > 0) {
      toast.error(`${failedActions.length} changes failed to sync`);
    }
    
    this.syncInProgress = false;
    return failedActions.length === 0;
  }
  
  private static async executeAction(action: OfflineAction): Promise<void> {
    // Simulate API call - in real app, this would make actual HTTP requests
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Here you would implement actual API calls based on action type and entity
    console.log('Executing action:', action);
  }
  
  static clearPendingActions() {
    localStorage.removeItem(this.STORAGE_KEY);
    toast.success('Pending actions cleared');
  }
  
  static getPendingActionsCount(): number {
    return this.getPendingActions().length;
  }
}
