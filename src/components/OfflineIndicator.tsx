
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsAnimating(true);
      // Show the "back online" message briefly
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial visibility
    setIsVisible(isOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // When animation ends, reset state if we're online
  const handleAnimationEnd = () => {
    if (!isOffline) {
      setIsAnimating(false);
    }
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center gap-1.5 py-2 px-4 text-sm font-medium shadow-lg border",
          isOffline 
            ? "bg-destructive/10 text-destructive border-destructive/20" 
            : "bg-green-500/10 text-green-500 border-green-500/20"
        )}
      >
        {isOffline ? (
          <>
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
            <span>You are currently offline</span>
          </>
        ) : (
          <>
            <Wifi className="h-3.5 w-3.5" />
            <span>Back online</span>
          </>
        )}
      </Badge>
    </div>
  );
}
