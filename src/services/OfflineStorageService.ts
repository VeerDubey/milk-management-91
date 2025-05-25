
// Define the OfflineStorageService class for offline functionality
class OfflineStorageService {
  private static offlineQueue: any[] = [];
  private static syncInProgress = false;

  /**
   * Initialize the offline storage service
   */
  static initialize(): void {
    console.log('OfflineStorageService initialized');
    
    // Load offline queue from localStorage if exists
    const savedQueue = localStorage.getItem('offlineQueue');
    if (savedQueue) {
      try {
        this.offlineQueue = JSON.parse(savedQueue);
        console.log(`Loaded ${this.offlineQueue.length} pending offline actions`);
      } catch (error) {
        console.error('Error loading offline queue:', error);
        this.offlineQueue = [];
      }
    }
    
    // Attempt to sync when coming online
    window.addEventListener('online', () => {
      console.log('Device is online, attempting to sync');
      this.synchronize();
    });
  }

  /**
   * Check if device is online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Queue an action for offline sync
   */
  static queueOfflineAction(action: any): void {
    this.offlineQueue.push(action);
    localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    console.log('Action queued for offline sync:', action);
  }

  /**
   * Get the offline queue
   */
  static getOfflineQueue(): any[] {
    return this.offlineQueue;
  }

  /**
   * Synchronize offline data with server when online
   */
  static async synchronize(): Promise<boolean> {
    if (!navigator.onLine) {
      console.log('Cannot synchronize while offline');
      return false;
    }

    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return false;
    }

    try {
      this.syncInProgress = true;
      console.log('Starting synchronization...');

      if (this.offlineQueue.length === 0) {
        console.log('No pending actions to synchronize');
        return true;
      }

      // Process each action in the queue
      const successfulActions = [];
      const failedActions = [];

      for (const action of this.offlineQueue) {
        try {
          // Here you would implement the actual synchronization with your backend
          // For this example, we'll just simulate a successful sync
          console.log('Processing action:', action);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Assume success for now
          successfulActions.push(action);
        } catch (error) {
          console.error('Error processing action:', action, error);
          failedActions.push(action);
        }
      }

      // Remove successful actions from queue
      if (successfulActions.length > 0) {
        this.offlineQueue = this.offlineQueue.filter(
          action => !successfulActions.includes(action)
        );
        localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
        console.log(`${successfulActions.length} actions synchronized successfully`);
      }

      // Update last sync time
      const currentTime = new Date().toISOString();
      localStorage.setItem('lastSuccessfulSync', currentTime);

      return failedActions.length === 0;
    } catch (error) {
      console.error('Synchronization error:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    // Nothing to clean up for now
    console.log('OfflineStorageService cleaned up');
  }
}

// Export the OfflineStorageService class
export { OfflineStorageService };
