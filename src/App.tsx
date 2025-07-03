
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import { DataProvider } from '@/contexts/data/DataContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
import ModernAuthForm from '@/components/auth/ModernAuthForm';
import { Toaster } from 'sonner';

// Import all pages
import Customers from './pages/Customers';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Outstanding from './pages/Outstanding';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Master from './pages/Master';
import Advanced from './pages/Advanced';
import Analytics from './pages/Analytics';
import Communication from './pages/Communication';
import Messaging from './pages/Messaging';
import TrackSheet from './pages/TrackSheet';
import DeliverySheet from './pages/DeliverySheet';
import Inventory from './pages/Inventory';
import RoleManagementPage from './pages/RoleManagementPage';

function App() {
  return (
    <EnhancedAuthProvider>
      <DataProvider>
        <InvoiceProvider>
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
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/outstanding" element={<Outstanding />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/master" element={<Master />} />
                  <Route path="/advanced" element={<Advanced />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/communication" element={<Communication />} />
                  <Route path="/messaging" element={<Messaging />} />
                  <Route path="/track-sheet" element={<TrackSheet />} />
                  <Route path="/delivery-sheet" element={<DeliverySheet />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/role-management" element={<RoleManagementPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ui-settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </InvoiceProvider>
      </DataProvider>
    </EnhancedAuthProvider>
  );
}

export default App;
