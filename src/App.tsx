import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
import { DataProvider } from '@/contexts/data/DataContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// Import all pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import OrderEntry from '@/pages/OrderEntry';
import OrderEntryCards from '@/pages/OrderEntryCards';
import TruckSheet from '@/pages/TruckSheet';
import TrackSheet from '@/pages/TrackSheet';
import TrackSheetHistory from '@/pages/TrackSheetHistory';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import Payments from '@/pages/Payments';
import CreatePayment from '@/pages/CreatePayment';
import TaxSettings from '@/pages/TaxSettings';
import SMSTemplates from '@/pages/SMSTemplates';
import Settings from '@/pages/Settings';
import CustomerList from '@/pages/CustomerList';
import ProductList from '@/pages/ProductList';
import OrderList from '@/pages/OrderList';
import PaymentList from '@/pages/PaymentList';
import Suppliers from '@/pages/Suppliers';
import Stock from '@/pages/Stock';
import Expenses from './pages/Expenses';
import Vehicles from './pages/Vehicles';
import Salesmen from './pages/Salesmen';
import VehicleTrips from './pages/VehicleTrips';
import ProductRates from './pages/ProductRates';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import ViewInvoice from './pages/ViewInvoice';
import EditInvoice from './pages/EditInvoice';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <InvoiceProvider>
            <DataProvider>
              <MessagingProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/" element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="order-entry" element={<OrderEntry />} />
                      <Route path="order-entry-cards" element={<OrderEntryCards />} />
                      <Route path="truck-sheet" element={<TruckSheet />} />
                      <Route path="track-sheet" element={<TrackSheet />} />
                      <Route path="track-sheet-history" element={<TrackSheetHistory />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="customer-list" element={<CustomerList />} />
                      <Route path="products" element={<Products />} />
                      <Route path="product-list" element={<ProductList />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="order-list" element={<OrderList />} />
                      <Route path="payments" element={<Payments />} />
                      <Route path="payment-list" element={<PaymentList />} />
                      <Route path="create-payment" element={<CreatePayment />} />
                      <Route path="tax-settings" element={<TaxSettings />} />
                      <Route path="sms-templates" element={<SMSTemplates />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="suppliers" element={<Suppliers />} />
                      <Route path="stock" element={<Stock />} />
                      <Route path="expenses" element={<Expenses />} />
                      <Route path="vehicles" element={<Vehicles />} />
                      <Route path="salesmen" element={<Salesmen />} />
                      <Route path="vehicle-trips" element={<VehicleTrips />} />
                      <Route path="product-rates" element={<ProductRates />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="invoices" element={<Invoices />} />
                      <Route path="create-invoice" element={<CreateInvoice />} />
                      <Route path="view-invoice/:id" element={<ViewInvoice />} />
                      <Route path="edit-invoice/:id" element={<EditInvoice />} />
                    </Route>
                  </Route>
                </Routes>
                <Toaster />
              </MessagingProvider>
            </DataProvider>
          </InvoiceProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
