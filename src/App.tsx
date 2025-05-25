
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Layout } from './components/Layout';
import Master from './pages/Master';
import Customers from './pages/Customers';
import CustomerList from './pages/CustomerList';
import CustomerDirectory from './pages/CustomerDirectory';
import CustomerDetail from './pages/CustomerDetail';
import CustomerStatement from './pages/CustomerStatement';
import CustomerLedger from './pages/CustomerLedger';
import CustomerRates from './pages/CustomerRates';
import CustomerLedgerReport from './pages/CustomerLedgerReport';
import Inventory from './pages/Inventory';
import ProductList from './pages/ProductList';
import ProductRates from './pages/ProductRates';
import StockManagement from './pages/StockManagement';
import StockSettings from './pages/StockSettings';
import ProductCategories from './pages/ProductCategories';
import Communication from './pages/Communication';
import Messaging from './pages/Messaging';
import EmailTemplates from './pages/EmailTemplates';
import BulkCommunication from './pages/BulkCommunication';
import AreaManagement from './pages/AreaManagement';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import OrderList from './pages/OrderList';
import OrderEntry from './pages/OrderEntry';
import { ProtectedRoute } from './components/ProtectedRoute';
import ExpensesRevamped from './pages/ExpensesRevamped';
import PaymentListView from './pages/PaymentListView';
import InvoiceDetail from './pages/InvoiceDetail';
import OrderHistory from './pages/OrderHistory';
import BulkRateUpdate from './pages/BulkRateUpdate';
import CompanyProfile from './pages/CompanyProfile';
import InvoiceHistory from './pages/InvoiceHistory';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceTemplates from './pages/InvoiceTemplates';
import FinancialYear from './pages/FinancialYear';
import { AuthProvider } from './contexts/AuthContext';
import Signup from './pages/Signup';
import { InvoiceProvider } from './contexts/InvoiceContext';
import { DataProvider } from './contexts/data/DataContext';
import TrackSheet from './pages/TrackSheet';
import TrackSheetHistory from './pages/TrackSheetHistory';
import VehicleSalesmanCreate from './pages/VehicleSalesmanCreate';
import VehicleTracking from './pages/VehicleTracking';
import PaymentCreate from './pages/PaymentCreate';
import SMSTemplates from './pages/SMSTemplates';
import SupplierDirectory from './pages/SupplierDirectory';
import SupplierLedger from './pages/SupplierLedger';
import SupplierPayments from './pages/SupplierPayments';
import SupplierRates from './pages/SupplierRates';
import OutstandingDues from './pages/OutstandingDues';
import OutstandingAmounts from './pages/OutstandingAmounts';
import SalesReport from './pages/SalesReport';
import CustomerReport from './pages/CustomerReport';
import TaxSettings from './pages/TaxSettings';
import UISettings from './pages/UISettings';
import UserAccess from './pages/UserAccess';
import { MessagingProvider } from './contexts/MessagingContext';

function App() {
  useEffect(() => {
    console.log("Web app initialized");
  }, []);

  return (
    <AuthProvider>
      <InvoiceProvider>
        <DataProvider>
          <MessagingProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/master" element={<Master />} />
                  
                  {/* Customer Routes */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customer-list" element={<CustomerList />} />
                  <Route path="/customer-directory" element={<CustomerDirectory />} />
                  <Route path="/customer-detail/:id" element={<CustomerDetail />} />
                  <Route path="/customer-statement/:id" element={<CustomerStatement />} />
                  <Route path="/customer-ledger" element={<CustomerLedger />} />
                  <Route path="/customer-rates" element={<CustomerRates />} />
                  <Route path="/customer-ledger-report" element={<CustomerLedgerReport />} />
                  
                  {/* Inventory Routes */}
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/product-list" element={<ProductList />} />
                  <Route path="/product-rates" element={<ProductRates />} />
                  <Route path="/stock-management" element={<StockManagement />} />
                  <Route path="/stock-settings" element={<StockSettings />} />
                  <Route path="/product-categories" element={<ProductCategories />} />
                  
                  {/* Order Routes */}
                  <Route path="/order-list" element={<OrderList />} />
                  <Route path="/order-entry" element={<OrderEntry />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/order-history" element={<OrderHistory />} />
                  
                  {/* Payment Routes */}
                  <Route path="/payments" element={<PaymentListView />} />
                  <Route path="/payment-list" element={<PaymentListView />} />
                  <Route path="/payment-create" element={<PaymentCreate />} />
                  
                  {/* Invoice Routes */}
                  <Route path="/invoices" element={<InvoiceHistory />} />
                  <Route path="/invoice-create" element={<InvoiceCreate />} />
                  <Route path="/invoice-templates" element={<InvoiceTemplates />} />
                  <Route path="/invoice-history" element={<InvoiceHistory />} />
                  <Route path="/invoice/:id" element={<InvoiceDetail />} />
                  
                  {/* Bulk Update Routes */}
                  <Route path="/bulk-rates" element={<BulkRateUpdate />} />
                  
                  {/* Communication Routes */}
                  <Route path="/communication" element={<Communication />} />
                  <Route path="/messaging" element={<Messaging />} />
                  <Route path="/email-templates" element={<EmailTemplates />} />
                  <Route path="/bulk-communication" element={<BulkCommunication />} />
                  <Route path="/sms-templates" element={<SMSTemplates />} />
                  
                  {/* Delivery Routes */}
                  <Route path="/vehicle-salesman-create" element={<VehicleSalesmanCreate />} />
                  <Route path="/vehicle-tracking" element={<VehicleTracking />} />
                  <Route path="/track-sheet" element={<TrackSheet />} />
                  <Route path="/track-sheet-history" element={<TrackSheetHistory />} />
                  
                  {/* Supplier Routes */}
                  <Route path="/supplier-directory" element={<SupplierDirectory />} />
                  <Route path="/supplier-ledger" element={<SupplierLedger />} />
                  <Route path="/supplier-payments" element={<SupplierPayments />} />
                  <Route path="/supplier-rates" element={<SupplierRates />} />
                  
                  {/* Outstanding Routes */}
                  <Route path="/outstanding-dues" element={<OutstandingDues />} />
                  <Route path="/outstanding-amounts" element={<OutstandingAmounts />} />
                  
                  {/* Reports Routes */}
                  <Route path="/sales-report" element={<SalesReport />} />
                  <Route path="/customer-report" element={<CustomerReport />} />
                  <Route path="/analytics" element={<Analytics />} />
                  
                  {/* Settings Routes */}
                  <Route path="/area-management" element={<AreaManagement />} />
                  <Route path="/expenses" element={<ExpensesRevamped />} />
                  <Route path="/company-profile" element={<CompanyProfile />} />
                  <Route path="/financial-year" element={<FinancialYear />} />
                  <Route path="/tax-settings" element={<TaxSettings />} />
                  <Route path="/ui-settings" element={<UISettings />} />
                  <Route path="/user-access" element={<UserAccess />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MessagingProvider>
        </DataProvider>
      </InvoiceProvider>
    </AuthProvider>
  );
}

export default App;
