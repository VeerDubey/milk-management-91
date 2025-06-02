
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import { DataProvider } from '@/contexts/data/DataContext';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Suppliers from '@/pages/Suppliers';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import Payments from '@/pages/Payments';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import DeliverySheet from '@/pages/DeliverySheet';
import TrackDeliverySheet from '@/pages/TrackDeliverySheet';
import DeliveryChallan from '@/pages/DeliveryChallan';
import VehicleTracking from '@/pages/VehicleTracking';
import AppLayout from '@/components/layout/AppLayout';
import DeliveryManagement from '@/components/delivery/DeliveryManagement';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { EnhancedDashboard } from '@/components/dashboard/EnhancedDashboard';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<EnhancedDashboard />} />
                  <Route path="/analytics" element={<EnhancedDashboard />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  
                  {/* Core Management */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/users" element={<VehicleTracking />} />
                  
                  {/* Orders & Sales */}
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/order-calculator" element={<Orders />} />
                  
                  {/* Delivery Operations */}
                  <Route path="/vehicles" element={<VehicleTracking />} />
                  <Route path="/delivery-management" element={<DeliveryManagement />} />
                  <Route path="/delivery-challan" element={<DeliveryChallan />} />
                  <Route path="/delivery-sheet" element={<DeliverySheet />} />
                  <Route path="/track-delivery-sheet" element={<TrackDeliverySheet />} />
                  <Route path="/route-optimizer" element={<DeliveryManagement />} />
                  
                  {/* Reports & Export */}
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/data-export" element={<Reports />} />
                  <Route path="/delivery-reports" element={<Reports />} />
                  
                  {/* System */}
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
            <Toaster position="top-right" richColors />
          </Router>
        </DataProvider>
      </EnhancedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
