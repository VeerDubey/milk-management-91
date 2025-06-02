
import { Navigate, Outlet } from 'react-router-dom';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated } = useEnhancedAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive loading effect
    let interval: number | undefined;
    let timer: number | undefined;
    
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingProgress(prev => {
          // Slow down near the end to wait for auth check
          const increment = prev < 70 ? 15 : 5;
          return Math.min(prev + increment, 90);
        });
      }, 200);
      
      // Simulate a small delay to check auth status
      timer = window.setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 300); // Small delay for final animation
      }, 800);
    }
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background/80 animate-fade-in">
        <div className="flex flex-col items-center gap-6 p-8 bg-card/50 backdrop-blur-sm rounded-lg border border-border/40 shadow-xl max-w-md w-full">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Verifying authentication...</span>
              <span className="text-sm font-medium">{loadingProgress}%</span>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-muted-foreground text-center text-sm">
            Securely verifying your credentials
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
