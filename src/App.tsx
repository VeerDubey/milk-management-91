
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/data/DataContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Layout } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import OrderEntry from '@/pages/OrderEntry';
import OrderHistory from '@/pages/OrderHistory';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import DeliverySheetGenerator from '@/components/delivery/DeliverySheetGenerator';
import DeliveryEntryPage from '@/components/delivery/DeliveryEntryPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/inventory" element={<InventoryDashboard />} />
                            <Route path="/order-entry" element={<OrderEntry />} />
                            <Route path="/order-history" element={<OrderHistory />} />
                            <Route path="/delivery-sheet" element={<DeliverySheetGenerator />} />
                            <Route path="/delivery-entry" element={<DeliveryEntryPage />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
