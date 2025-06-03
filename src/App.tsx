import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Dashboard } from './pages/Dashboard';
import { Invoices } from './pages/Invoices';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { Signup } from './pages/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ModernInvoice } from './pages/ModernInvoice';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import ModernAuthForm from '@/components/auth/ModernAuthForm';

function App() {
  return (
    <EnhancedAuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <Router>
          <Routes>
            <Route path="/login" element={<ModernAuthForm />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ui-settings" element={<Settings />} />
              <Route path="/modern-invoice" element={<ModernInvoice />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </EnhancedAuthProvider>
  );
}

export default App;
