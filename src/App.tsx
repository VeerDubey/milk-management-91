
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

function App() {
  // React hooks can be added here for state management or side effects
  useEffect(() => {
    // Example: Load initial data from local storage or an API
    // You can dispatch actions to update the state in your contexts
  }, []);

  return (
    <AuthProvider>
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
            
            {/* Order Routes */}
            <Route path="/order-list" element={<OrderList />} />
            <Route path="/order-entry" element={<OrderEntry />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/order-history" element={<OrderHistory />} />
            
            {/* Payment Routes */}
            <Route path="/payments" element={<PaymentListView />} />
            <Route path="/payment-list" element={<PaymentListView />} />
            
            {/* Invoice Routes */}
            <Route path="/invoices" element={<InvoiceHistory />} />
            <Route path="/invoice-create" element={<InvoiceCreate />} />
            <Route path="/invoice-templates" element={<InvoiceTemplates />} />
            <Route path="/invoice/:id" element={<InvoiceDetail />} />
            
            {/* Communication Routes */}
            <Route path="/communication" element={<Communication />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/email-templates" element={<EmailTemplates />} />
            <Route path="/bulk-communication" element={<BulkCommunication />} />
            
            {/* Settings Routes */}
            <Route path="/area-management" element={<AreaManagement />} />
            <Route path="/expenses" element={<ExpensesRevamped />} />
            <Route path="/bulk-rates" element={<BulkRateUpdate />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/financial-year" element={<FinancialYear />} />
            
            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
