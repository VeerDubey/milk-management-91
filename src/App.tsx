
import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DataProvider } from '@/contexts/data/DataContext';
import { UISettingsProvider } from '@/contexts/UISettingsContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
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
// Import placeholder components for missing pages
import VehicleAssignment from '@/pages/VehicleAssignment';
import TrackSheet from '@/pages/TrackSheet';
import TaxSettings from '@/pages/TaxSettings';
import InvoiceHistory from '@/pages/InvoiceHistory';
import InvoiceDetail from '@/pages/InvoiceDetail';
import InvoiceGenerator from '@/pages/InvoiceGenerator';
import { OfflineStorageService } from '@/services/OfflineStorageService';

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

  const routes = [
    { path: '/', element: <Dashboard /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/customers', element: <Customers /> },
    { path: '/customers/:id', element: <CustomerDetail /> },
    { path: '/products', element: <Products /> },
    { path: '/products/:id', element: <ProductDetail /> },
    { path: '/orders', element: <Orders /> },
    { path: '/orders/:id', element: <OrderDetail /> },
    { path: '/payments', element: <Payments /> },
    { path: '/payments/:id', element: <PaymentDetail /> },
    { path: '/suppliers', element: <Suppliers /> },
    { path: '/suppliers/:id', element: <SupplierDetail /> },
    { path: '/supplier-payments/:id', element: <SupplierPaymentDetail /> },
    { path: '/stock-management', element: <StockManagement /> },
    { path: '/stock-entries/:id', element: <StockEntryDetail /> },
    { path: '/expenses', element: <Expenses /> },
    { path: '/expenses/:id', element: <ExpenseDetail /> },
    { path: '/reports', element: <Reports /> },
    { path: '/settings', element: <Settings /> },
    { path: '/customer-product-rates', element: <CustomerProductRates /> },
    { path: '/supplier-product-rates', element: <SupplierProductRates /> },
    { path: '/vehicles', element: <Vehicles /> },
    { path: '/salesmen', element: <Salesmen /> },
    { path: '/track-sheet', element: <TrackSheet /> },
    { path: '/tax-settings', element: <TaxSettings /> },
    { path: '/invoice-history', element: <InvoiceHistory /> },
    { path: '/invoice-detail/:id', element: <InvoiceDetail /> },
    { path: '/invoice-generator', element: <InvoiceGenerator /> },
    { path: '/vehicle-assignment', element: <VehicleAssignment /> },
  ];

  return (
    <Layout>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UISettingsProvider>
        <InvoiceProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </InvoiceProvider>
      </UISettingsProvider>
    </ThemeProvider>
  );
}

export default App;
