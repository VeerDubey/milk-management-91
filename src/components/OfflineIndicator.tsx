import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { OfflineStorageService } from "@/services/OfflineStorageService";
import { Button } from "./ui/button";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Function to update online status
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (online) {
        toast.success("You are back online");
      } else {
        toast.warning("You are offline. Changes will be saved locally.");
      }
    };

    // Function to update queue length
    const updateQueueLength = () => {
      const queue = OfflineStorageService.getOfflineQueue();
      setQueueLength(queue.length);
    };

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Set up interval to check queue length
    const interval = setInterval(updateQueueLength, 5000);

    // Initial check
    updateQueueLength();

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!isOnline) {
      toast.error("Cannot synchronize while offline");
      return;
    }
    
    setSyncing(true);
    try {
      const success = await OfflineStorageService.synchronize();
      if (success) {
        toast.success("Synchronization completed successfully");
        setQueueLength(0);
      } else {
        toast.error("Synchronization failed");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("An error occurred during synchronization");
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && queueLength === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-black/90 text-white px-4 py-2 rounded-full shadow-lg">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium">Online</span>
          {queueLength > 0 && (
            <>
              <span className="mx-2 text-xs text-gray-400">|</span>
              <span className="text-sm">{queueLength} pending {queueLength === 1 ? 'change' : 'changes'}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-7 rounded-full bg-blue-600/50 hover:bg-blue-600/75"
                onClick={handleSyncNow}
                disabled={syncing}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                <span className="text-xs">Sync now</span>
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-400" />
          <span className="text-sm font-medium">Offline Mode</span>
          {queueLength > 0 && (
            <>
              <span className="mx-2 text-xs text-gray-400">|</span>
              <span className="text-sm">{queueLength} pending {queueLength === 1 ? 'change' : 'changes'}</span>
            </>
          )}
        </>
      )}
    </div>
  );
};
