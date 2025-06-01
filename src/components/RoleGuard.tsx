
import React from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'employee')[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { user, isAuthenticated } = useEnhancedAuth();

  if (!isAuthenticated || !user) {
    return (
      <Alert className="border-destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Please log in to access this content.
        </AlertDescription>
      </Alert>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || (
      <Alert className="border-warning">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this content. Required role: {allowedRoles.join(' or ')}.
          Your role: {user.role}.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
