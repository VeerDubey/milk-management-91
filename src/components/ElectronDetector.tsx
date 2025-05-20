
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Remove memo to simplify the component and avoid potential issues with React context
export const ElectronDetector = function ElectronDetector() {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Check if we're running in Electron - only run once
    const detectElectron = async () => {
      try {
        console.log("Checking for Electron environment...");
        // Safely check if window.electron exists before accessing isElectron
        const isRunningInElectron = typeof window !== 'undefined' && 
          window.electron && Boolean(window.electron.isElectron);
        
        setIsElectron(isRunningInElectron);
        
        if (!isRunningInElectron) {
          console.log("Not running in Electron");
          return;
        }
        
        console.log("Running in Electron desktop environment");
        
        // Get app version if available - safely check each property
        if (window.electron?.appInfo?.getVersion) {
          try {
            console.log("Getting app version...");
            const version = await window.electron.appInfo.getVersion();
            console.log(`App version retrieved: ${version}`);
            setAppVersion(version);
          } catch (err) {
            console.error('Failed to get app version:', err);
            // Fallback to a default version
            setAppVersion('1.0.0');
          }
        } else {
          console.warn("getVersion method not available");
          setAppVersion('1.0.0');
        }
        
        // Show toast notification only once at startup
        toast.success("Desktop application ready", {
          description: "You are running the full desktop version",
          duration: 3000
        });
      } catch (err) {
        console.error('Error in detectElectron:', err);
        // Don't throw errors that would break rendering
      }
    };

    // Wrap in a try/catch to ensure the component doesn't crash
    try {
      detectElectron();
    } catch (error) {
      console.error("Failed to detect Electron:", error);
    }
  }, []);

  // Don't render anything if not in Electron
  if (!isElectron) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="outline" className="bg-background/90 text-foreground">
        Desktop v{appVersion || '1.0.0'}
      </Badge>
    </div>
  );
};

// Export without memo to ensure hooks work properly
export default ElectronDetector;
