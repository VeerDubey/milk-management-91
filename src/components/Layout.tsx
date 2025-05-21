
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import LoginLayout from '@/components/layout/LoginLayout';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Use login layout for auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  if (!isAuthenticated && isAuthPage) {
    return <LoginLayout>{children}</LoginLayout>;
  }
  
  // Use main app layout for authenticated pages
  return <AppLayout>{children}</AppLayout>;
};
