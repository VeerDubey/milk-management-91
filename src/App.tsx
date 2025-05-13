
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/data/DataContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import { ThemeProvider } from "./contexts/ThemeProvider";

// Layouts
import { Layout } from "./components/Layout";
import LoginLayout from "./components/layout/LoginLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import UISettings from "./pages/UISettings";
import ProductRates from "./pages/ProductRates";
import ProductCategories from "./pages/ProductCategories";
import OrderList from "./pages/OrderList";
import ProductList from "./pages/ProductList";
import CustomerList from "./pages/CustomerList";
import PaymentList from "./pages/PaymentList";
import CustomerDetail from "./pages/CustomerDetail";
import ProductDetail from "./pages/ProductDetail";
import InvoiceCreate from "./pages/InvoiceCreate";
import PaymentCreate from "./pages/PaymentCreate";
import CompanyProfile from "./pages/CompanyProfile";
import OrderEntry from "./pages/OrderEntry";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import TrackSheet from "./pages/TrackSheet";
import InvoiceHistory from "./pages/InvoiceHistory";
import Payments from "./pages/Payments";
import Products from "./pages/Products";
import Master from "./pages/Master";
import StockSettings from "./pages/StockSettings";
import Suppliers from "./pages/Suppliers";
import SupplierDirectory from "./pages/SupplierDirectory";
import UserAccess from "./pages/UserAccess";
import VehicleTracking from "./pages/VehicleTracking";
import AreaManagement from "./pages/AreaManagement";
import CustomerDirectory from "./pages/CustomerDirectory";
import Expenses from "./pages/Expenses";
import CustomerLedger from "./pages/CustomerLedger";
import SupplierLedger from "./pages/SupplierLedger";
import PurchaseHistory from "./pages/PurchaseHistory";
import SupplierPayments from "./pages/SupplierPayments";
import CustomerRates from "./pages/CustomerRates";
import FinancialYear from "./pages/FinancialYear";
import Communication from "./pages/Communication";
import StockManagement from "./pages/StockManagement";
import BulkRates from "./pages/BulkRates";
import Signup from "./pages/Signup";
import SalesReport from "./pages/Reports/SalesReport";
import CustomerReport from "./pages/Reports/CustomerReport";
import { OfflineIndicator } from "./components/OfflineIndicator";

function App() {
  const [createInvoiceFunc, setCreateInvoiceFunc] = useState<Function | null>(null);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <DataProvider createInvoiceFunc={createInvoiceFunc}>
            <InvoiceProvider>
              <Routes>
                <Route path="/login" element={
                  <LoginLayout>
                    <Login />
                  </LoginLayout>
                } />
                
                <Route path="/signup" element={
                  <LoginLayout>
                    <Signup />
                  </LoginLayout>
                } />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    {/* Dashboard and Main Routes */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Order Management */}
                    <Route path="order-entry" element={<OrderEntry />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="track-sheet" element={<TrackSheet />} />
                    <Route path="vehicle-tracking" element={<VehicleTracking />} />
                    <Route path="area-management" element={<AreaManagement />} />
                    
                    {/* Invoice Management */}
                    <Route path="invoice-create" element={<InvoiceCreate />} />
                    <Route path="invoice-history" element={<InvoiceHistory />} />
                    <Route path="invoice-generator" element={<InvoiceCreate />} />
                    
                    {/* Customer Management */}
                    <Route path="customers" element={<Customers />} />
                    <Route path="customer-list" element={<CustomerList />} />
                    <Route path="customer-directory" element={<CustomerDirectory />} />
                    <Route path="customer/:id" element={<CustomerDetail />} />
                    <Route path="customer-ledger" element={<CustomerLedger />} />
                    <Route path="customer-rates" element={<CustomerRates />} />
                    
                    {/* Payment Management */}
                    <Route path="payments" element={<Payments />} />
                    <Route path="payment-create" element={<PaymentCreate />} />
                    
                    {/* Product Management */}
                    <Route path="products" element={<Products />} />
                    <Route path="product-list" element={<ProductList />} />
                    <Route path="product/:id" element={<ProductDetail />} />
                    <Route path="product-rates" element={<ProductRates />} />
                    <Route path="product-categories" element={<ProductCategories />} />
                    <Route path="stock-management" element={<StockManagement />} />
                    <Route path="stock-settings" element={<StockSettings />} />
                    <Route path="bulk-rates" element={<BulkRates />} />
                    
                    {/* Supplier Management */}
                    <Route path="suppliers" element={<Suppliers />} />
                    <Route path="supplier-directory" element={<SupplierDirectory />} />
                    <Route path="supplier-ledger" element={<SupplierLedger />} />
                    <Route path="supplier-payments" element={<SupplierPayments />} />
                    <Route path="supplier-rates" element={<ProductRates />} />
                    <Route path="purchase-history" element={<PurchaseHistory />} />
                    
                    {/* Financial Management */}
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="outstanding" element={<CustomerLedger />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="reports/sales" element={<SalesReport />} />
                    <Route path="reports/customers" element={<CustomerReport />} />
                    
                    {/* Vehicle & Salesmen */}
                    <Route path="vehicle-salesman-create" element={<VehicleTracking />} />
                    
                    {/* Master Module */}
                    <Route path="master" element={<Master />} />
                    <Route path="user-access" element={<UserAccess />} />
                    <Route path="financial-year" element={<FinancialYear />} />
                    <Route path="communication" element={<Communication />} />
                    
                    {/* Settings */}
                    <Route path="settings" element={<Settings />} />
                    <Route path="ui-settings" element={<UISettings />} />
                    <Route path="company-profile" element={<CompanyProfile />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <OfflineIndicator />
            </InvoiceProvider>
          </DataProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
