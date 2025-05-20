import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { DataProvider } from '@/contexts/DataContext';
import { UISettingsProvider, useUISettings } from '@/contexts/UISettingsContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
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
import SupplierDetail from '@/pages/SupplierDetail';
import OrderDetail from '@/pages/OrderDetail';
import PaymentDetail from '@/pages/PaymentDetail';
import SupplierPaymentDetail from '@/pages/SupplierPaymentDetail';
import StockEntryDetail from '@/pages/StockEntryDetail';
import ExpenseDetail from '@/pages/ExpenseDetail';
import CustomerProductRates from '@/pages/CustomerProductRates';
import SupplierProductRates from '@/pages/SupplierProductRates';
import Vehicles from '@/pages/Vehicles';
import Salesmen from '@/pages/Salesmen';
import TrackSheet from '@/pages/TrackSheet';
import TaxSettings from '@/pages/TaxSettings';
import InvoiceHistory from '@/pages/InvoiceHistory';
import InvoiceDetail from '@/pages/InvoiceDetail';
import InvoiceGenerator from '@/pages/InvoiceGenerator';
import VehicleAssignment from '@/pages/VehicleAssignment';
import { OfflineStorageService } from '@/services/OfflineStorageService';

function AppContent() {
  const { theme } = useUISettings();
  const location = useLocation();
  const [previousLocation, setPreviousLocation] = useState(location);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
    <Router>
      <UISettingsProvider>
        <DataProvider>
          <InvoiceProvider>
            <AppContent />
          </InvoiceProvider>
        </DataProvider>
      </UISettingsProvider>
    </Router>
  );
}

export default App;
