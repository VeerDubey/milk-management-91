
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
import AppLayout from '@/components/layout/AppLayout';

// Import all pages
import Customers from './pages/Customers';
import OrderDetail from './pages/OrderDetail';
import OrderEdit from './pages/OrderEdit';
import InvoiceCreate from './pages/InvoiceCreate';
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
                  <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/invoices" element={<AppLayout><Invoices /></AppLayout>} />
                  <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
                  <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
                  <Route path="/orders" element={<AppLayout><Orders /></AppLayout>} />
                  <Route path="/orders/:id" element={<AppLayout><OrderDetail /></AppLayout>} />
                  <Route path="/orders/edit/:id" element={<AppLayout><OrderEdit /></AppLayout>} />
                  <Route path="/invoices/create/:orderId" element={<AppLayout><InvoiceCreate /></AppLayout>} />
                  <Route path="/payments" element={<AppLayout><Payments /></AppLayout>} />
                  <Route path="/outstanding" element={<AppLayout><Outstanding /></AppLayout>} />
                  <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
                  <Route path="/suppliers" element={<AppLayout><Suppliers /></AppLayout>} />
                  <Route path="/master" element={<AppLayout><Master /></AppLayout>} />
                  <Route path="/advanced" element={<AppLayout><Advanced /></AppLayout>} />
                  <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
                  <Route path="/communication" element={<AppLayout><Communication /></AppLayout>} />
                  <Route path="/messaging" element={<AppLayout><Messaging /></AppLayout>} />
                  <Route path="/track-sheet" element={<AppLayout><TrackSheet /></AppLayout>} />
                  <Route path="/delivery-sheet" element={<AppLayout><DeliverySheet /></AppLayout>} />
                  <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
                  <Route path="/role-management" element={<AppLayout><RoleManagementPage /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                  <Route path="/ui-settings" element={<AppLayout><Settings /></AppLayout>} />
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
