
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { DataProvider } from "@/contexts/data/DataContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerList from "@/pages/CustomerList";
import CustomerDetail from "@/pages/CustomerDetail";
import CustomerLedger from "@/pages/CustomerLedger";
import Orders from "@/pages/Orders";
import OrderList from "@/pages/OrderList";
import OrderEntry from "@/pages/OrderEntry";
import Inventory from "@/pages/Inventory";
import ProductList from "@/pages/ProductList";
import ProductDetail from "@/pages/ProductDetail";
import Invoices from "@/pages/Invoices";
import InvoiceCreate from "@/pages/InvoiceCreate";
import InvoiceDetail from "@/pages/InvoiceDetail";
import InvoiceHistory from "@/pages/InvoiceHistory"; 
import Outstanding from "@/pages/Outstanding";
import OutstandingDues from "@/pages/OutstandingDues";
import OutstandingAmounts from "@/pages/OutstandingAmounts";
import FinancialYear from "@/pages/FinancialYear";
import Reports from "@/pages/Reports";
import CustomerReport from "@/pages/Reports/CustomerReport";
import SalesReport from "@/pages/Reports/SalesReport";
import Settings from "@/pages/Settings";
import UISettings from "@/pages/UISettings";
import UserAccess from "@/pages/UserAccess";
import CompanyProfile from "@/pages/CompanyProfile";
import Master from "@/pages/Master";
import ProductRates from "@/pages/ProductRates";
import CustomerRates from "@/pages/CustomerRates";
import StockManagement from "@/pages/StockManagement";
import StockSettings from "@/pages/StockSettings";
import Suppliers from "@/pages/Suppliers";
import SupplierDirectory from "@/pages/SupplierDirectory";
import SupplierLedger from "@/pages/SupplierLedger";
import SupplierPayments from "@/pages/SupplierPayments";
import SupplierRates from "@/pages/SupplierRates";
import VehicleSalesmanCreate from "@/pages/VehicleSalesmanCreate";
import VehicleTracking from "@/pages/VehicleTracking";
import TrackSheet from "@/pages/TrackSheet";
import TrackSheetHistory from "@/pages/TrackSheetHistory";
import Expenses from "@/pages/Expenses";
import PaymentList from "@/pages/PaymentList";
import PaymentCreate from "@/pages/PaymentCreate";
import ProductCategories from "@/pages/ProductCategories";
import TaxSettings from "@/pages/TaxSettings";
import InvoiceTemplates from "@/pages/InvoiceTemplates";
import Messaging from "./pages/Messaging";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InvoiceProvider>
          <DataProvider>
            <MessagingProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Customer routes */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customer-directory" element={<CustomerList />} />
                  <Route path="/customer-detail/:id" element={<CustomerDetail />} />
                  <Route path="/customer-ledger" element={<CustomerLedger />} />
                  <Route path="/customer-rates" element={<CustomerRates />} />
                  
                  {/* Order routes */}
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/order-list" element={<OrderList />} />
                  <Route path="/order-entry" element={<OrderEntry />} />
                  
                  {/* Inventory routes */}
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/product-list" element={<ProductList />} />
                  <Route path="/product-detail/:id" element={<ProductDetail />} />
                  <Route path="/product-rates" element={<ProductRates />} />
                  <Route path="/stock-management" element={<StockManagement />} />
                  <Route path="/stock-settings" element={<StockSettings />} />
                  
                  {/* Invoice routes */}
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/invoice-create" element={<InvoiceCreate />} />
                  <Route path="/invoice-detail/:id" element={<InvoiceDetail />} />
                  <Route path="/invoice-history" element={<InvoiceHistory />} />
                  <Route path="/invoice-templates" element={<InvoiceTemplates />} />
                  
                  {/* Payment routes */}
                  <Route path="/payments" element={<PaymentList />} />
                  <Route path="/payment-create" element={<PaymentCreate />} />
                  
                  {/* Supplier routes */}
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/supplier-directory" element={<SupplierDirectory />} />
                  <Route path="/supplier-ledger" element={<SupplierLedger />} />
                  <Route path="/supplier-payments" element={<SupplierPayments />} />
                  <Route path="/supplier-rates" element={<SupplierRates />} />
                  
                  {/* Outstanding routes */}
                  <Route path="/outstanding" element={<Outstanding />} />
                  <Route path="/outstanding-dues" element={<OutstandingDues />} />
                  <Route path="/outstanding-amounts" element={<OutstandingAmounts />} />
                  
                  {/* Reports routes */}
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/customer-report" element={<CustomerReport />} />
                  <Route path="/sales-report" element={<SalesReport />} />
                  
                  {/* Vehicle/Logistics routes */}
                  <Route path="/vehicle-salesman-create" element={<VehicleSalesmanCreate />} />
                  <Route path="/vehicle-tracking" element={<VehicleTracking />} />
                  <Route path="/track-sheet" element={<TrackSheet />} />
                  <Route path="/track-sheet-history" element={<TrackSheetHistory />} />
                  
                  {/* Financial routes */}
                  <Route path="/financial-year" element={<FinancialYear />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/tax-settings" element={<TaxSettings />} />
                  
                  {/* Settings routes */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ui-settings" element={<UISettings />} />
                  <Route path="/user-access" element={<UserAccess />} />
                  <Route path="/company-profile" element={<CompanyProfile />} />
                  
                  {/* Master data */}
                  <Route path="/master" element={<Master />} />
                  <Route path="/product-categories" element={<ProductCategories />} />
                  <Route path="/areas" element={<Master />} />
                  <Route path="/bulk-rates" element={<Master />} />
                  
                  {/* Messaging */}
                  <Route path="/messaging" element={<Messaging />} />
                  
                  {/* Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <Toaster position="top-right" />
            </MessagingProvider>
          </DataProvider>
        </InvoiceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
