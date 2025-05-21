
import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DataProvider } from '@/contexts/data/DataContext';
import { UISettingsProvider } from '@/contexts/UISettingsContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import Payments from '@/pages/Payments';
import Suppliers from '@/pages/Suppliers';
import StockManagement from '@/pages/StockManagement';
import Expenses from '@/pages/Expenses';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import CustomerDetail from '@/pages/CustomerDetail';
import ProductDetail from '@/pages/ProductDetail';
// Import Authentication pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
// Import placeholder components for missing pages
import VehicleAssignment from '@/pages/VehicleAssignment';
import TrackSheet from '@/pages/TrackSheet';
import TaxSettings from '@/pages/TaxSettings';
import InvoiceHistory from '@/pages/InvoiceHistory';
import InvoiceDetail from '@/pages/InvoiceDetail';
import InvoiceGenerator from '@/pages/InvoiceGenerator';
import { OfflineStorageService } from '@/services/OfflineStorageService';
import CustomerDirectory from '@/pages/CustomerDirectory';
import SupplierDirectory from '@/pages/SupplierDirectory';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Master from '@/pages/Master';

// Create placeholder components for missing modules
const SupplierDetail = () => <div>Supplier Detail Page</div>;
const OrderDetail = () => <div>Order Detail Page</div>;
const PaymentDetail = () => <div>Payment Detail Page</div>;
const SupplierPaymentDetail = () => <div>Supplier Payment Detail Page</div>;
const StockEntryDetail = () => <div>Stock Entry Detail Page</div>;
const ExpenseDetail = () => <div>Expense Detail Page</div>;
const CustomerProductRates = () => <div>Customer Product Rates Page</div>;
const SupplierProductRates = () => <div>Supplier Product Rates Page</div>;
const Vehicles = () => <div>Vehicles Page</div>;
const Salesmen = () => <div>Salesmen Page</div>;

function AppContent() {
  const location = useLocation();
  const [previousLocation, setPreviousLocation] = useState(location);

  useEffect(() => {
    if (!(location.pathname === previousLocation.pathname && location.key !== previousLocation.key)) {
      window.scrollTo(0, 0);
    }
    setPreviousLocation(location);
  }, [location, previousLocation]);

  useEffect(() => {
    OfflineStorageService.initialize();
    return () => {
      OfflineStorageService.cleanup();
    };
  }, []);

  return (
    <Layout>
      <Routes>
        {/* Public routes (no authentication required) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes (requiring authentication) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        } />
        <Route path="/customers/:id" element={
          <ProtectedRoute>
            <CustomerDetail />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        } />
        <Route path="/payments/:id" element={
          <ProtectedRoute>
            <PaymentDetail />
          </ProtectedRoute>
        } />
        <Route path="/suppliers" element={
          <ProtectedRoute>
            <Suppliers />
          </ProtectedRoute>
        } />
        <Route path="/suppliers/:id" element={
          <ProtectedRoute>
            <SupplierDetail />
          </ProtectedRoute>
        } />
        <Route path="/supplier-payments/:id" element={
          <ProtectedRoute>
            <SupplierPaymentDetail />
          </ProtectedRoute>
        } />
        <Route path="/stock-management" element={
          <ProtectedRoute>
            <StockManagement />
          </ProtectedRoute>
        } />
        <Route path="/stock-entries/:id" element={
          <ProtectedRoute>
            <StockEntryDetail />
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        } />
        <Route path="/expenses/:id" element={
          <ProtectedRoute>
            <ExpenseDetail />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/customer-product-rates" element={
          <ProtectedRoute>
            <CustomerProductRates />
          </ProtectedRoute>
        } />
        <Route path="/supplier-product-rates" element={
          <ProtectedRoute>
            <SupplierProductRates />
          </ProtectedRoute>
        } />
        <Route path="/vehicles" element={
          <ProtectedRoute>
            <Vehicles />
          </ProtectedRoute>
        } />
        <Route path="/salesmen" element={
          <ProtectedRoute>
            <Salesmen />
          </ProtectedRoute>
        } />
        <Route path="/track-sheet" element={
          <ProtectedRoute>
            <TrackSheet />
          </ProtectedRoute>
        } />
        <Route path="/tax-settings" element={
          <ProtectedRoute>
            <TaxSettings />
          </ProtectedRoute>
        } />
        <Route path="/invoice-history" element={
          <ProtectedRoute>
            <InvoiceHistory />
          </ProtectedRoute>
        } />
        <Route path="/invoice-detail/:id" element={
          <ProtectedRoute>
            <InvoiceDetail />
          </ProtectedRoute>
        } />
        <Route path="/invoice-generator" element={
          <ProtectedRoute>
            <InvoiceGenerator />
          </ProtectedRoute>
        } />
        <Route path="/vehicle-assignment" element={
          <ProtectedRoute>
            <VehicleAssignment />
          </ProtectedRoute>
        } />
        <Route path="/customer-directory" element={
          <ProtectedRoute>
            <CustomerDirectory />
          </ProtectedRoute>
        } />
        <Route path="/supplier-directory" element={
          <ProtectedRoute>
            <SupplierDirectory />
          </ProtectedRoute>
        } />
        <Route path="/master" element={
          <ProtectedRoute>
            <Master />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UISettingsProvider>
          <InvoiceProvider>
            <DataProvider>
              <AppContent />
            </DataProvider>
          </InvoiceProvider>
        </UISettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
