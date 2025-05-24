
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export const ElectronDetector = function ElectronDetector() {
  const [isPWA, setIsPWA] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>('1.0.0');

  useEffect(() => {
    // Check if we're running as a PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      setIsPWA(isStandalone || isFullscreen || isMinimalUI);
    };

    checkPWA();
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWA);
    
    return () => {
      mediaQuery.removeEventListener('change', checkPWA);
    };
  }, []);

  // Don't render anything if not in PWA mode
  if (!isPWA) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="outline" className="bg-background/90 text-foreground">
        PWA v{appVersion}
      </Badge>
    </div>
  );
};

export default ElectronDetector;
