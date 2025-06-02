
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from '@/components/ui/sonner';

// Layout Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import Products from './pages/Products';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrderList from './pages/OrderList';
import OrderEntry from './pages/OrderEntry';
import OrderHistory from './pages/OrderHistory';
import Payments from './pages/Payments';
import PaymentList from './pages/PaymentList';
import PaymentCreate from './pages/PaymentCreate';
import PaymentListView from './pages/PaymentListView';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import DeliverySheet from './pages/DeliverySheet';
import TrackSheet from './pages/TrackSheet';
import Invoices from './pages/Invoices';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceHistory from './pages/InvoiceHistory';
import InvoiceDetail from './pages/InvoiceDetail';
import Outstanding from './pages/Outstanding';
import OutstandingDues from './pages/OutstandingDues';
import OutstandingAmounts from './pages/OutstandingAmounts';
import Expenses from './pages/Expenses';
import ExpensesRevamped from './pages/ExpensesRevamped';
import Inventory from './pages/Inventory';
import InventoryDashboard from './pages/InventoryDashboard';
import StockManagement from './pages/StockManagement';
import SupplierPayments from './pages/SupplierPayments';
import CustomerRates from './pages/CustomerRates';
import SupplierRates from './pages/SupplierRates';
import BulkRates from './pages/BulkRates';
import BulkRateUpdate from './pages/BulkRateUpdate';
import ProductRates from './pages/ProductRates';
import CustomerLedger from './pages/CustomerLedger';
import SupplierLedger from './pages/SupplierLedger';
import TrackSheetHistory from './pages/TrackSheetHistory';
import TrackSheetManager from './pages/TrackSheetManager';
import TrackSheetAdvanced from './pages/TrackSheetAdvanced';
import DeliverySheetCreate from './pages/DeliverySheetCreate';
import EnhancedDeliverySheet from './pages/EnhancedDeliverySheet';
import TrackDeliverySheet from './pages/TrackDeliverySheet';
import DeliveryChallan from './pages/DeliveryChallan';
import PurchaseManagement from './pages/PurchaseManagement';
import PurchaseHistory from './pages/PurchaseHistory';
import VehicleTracking from './pages/VehicleTracking';
import VehicleSalesmanCreate from './pages/VehicleSalesmanCreate';
import Analytics from './pages/Analytics';
import SalesAnalytics from './pages/SalesAnalytics';
import BusinessIntelligence from './pages/BusinessIntelligence';
import Advanced from './pages/Advanced';
import AdvancedFeatures from './pages/AdvancedFeatures';
import Master from './pages/Master';
import CustomerDirectory from './pages/CustomerDirectory';
import SupplierDirectory from './pages/SupplierDirectory';
import ProductCategories from './pages/ProductCategories';
import AreaManagement from './pages/AreaManagement';
import RouteManagement from './pages/RouteManagement';
import TaxSettings from './pages/TaxSettings';
import FinancialYear from './pages/FinancialYear';
import StockSettings from './pages/StockSettings';
import UISettings from './pages/UISettings';
import UserAccess from './pages/UserAccess';
import RoleManagementPage from './pages/RoleManagementPage';
import CompanyProfile from './pages/CompanyProfile';
import Messaging from './pages/Messaging';
import BulkCommunication from './pages/BulkCommunication';
import SmsTemplates from './pages/SmsTemplates';
import EmailTemplates from './pages/EmailTemplates';
import NotificationsPage from './pages/NotificationsPage';
import TestingReport from './pages/TestingReport';
import InvoiceGenerator from './pages/InvoiceGenerator';
import InvoiceTemplates from './pages/InvoiceTemplates';
import Communication from './pages/Communication';
import CustomerStatement from './pages/CustomerStatement';
import CustomerReport from './pages/CustomerReport';
import CustomerLedgerReport from './pages/CustomerLedgerReport';
import CustomerPaymentManagement from './pages/CustomerPaymentManagement';
import SalesReport from './pages/SalesReport';
import LoadSheetManagement from './pages/LoadSheetManagement';
import DeliveryScheduling from './pages/DeliveryScheduling';
import DeliveryNotifications from './pages/DeliveryNotifications';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                  
                  {/* Customer Management */}
                  <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
                  <Route path="/customer-list" element={<ProtectedRoute><Layout><CustomerList /></Layout></ProtectedRoute>} />
                  <Route path="/customer/:id" element={<ProtectedRoute><Layout><CustomerDetail /></Layout></ProtectedRoute>} />
                  <Route path="/customer-directory" element={<ProtectedRoute><Layout><CustomerDirectory /></Layout></ProtectedRoute>} />
                  <Route path="/customer-ledger" element={<ProtectedRoute><Layout><CustomerLedger /></Layout></ProtectedRoute>} />
                  <Route path="/customer-statement" element={<ProtectedRoute><Layout><CustomerStatement /></Layout></ProtectedRoute>} />
                  <Route path="/customer-report" element={<ProtectedRoute><Layout><CustomerReport /></Layout></ProtectedRoute>} />
                  <Route path="/customer-ledger-report" element={<ProtectedRoute><Layout><CustomerLedgerReport /></Layout></ProtectedRoute>} />
                  <Route path="/customer-payment-management" element={<ProtectedRoute><Layout><CustomerPaymentManagement /></Layout></ProtectedRoute>} />
                  
                  {/* Product Management */}
                  <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
                  <Route path="/product-list" element={<ProtectedRoute><Layout><ProductList /></Layout></ProtectedRoute>} />
                  <Route path="/product/:id" element={<ProtectedRoute><Layout><ProductDetail /></Layout></ProtectedRoute>} />
                  <Route path="/product-categories" element={<ProtectedRoute><Layout><ProductCategories /></Layout></ProtectedRoute>} />
                  
                  {/* Order Management */}
                  <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
                  <Route path="/order-list" element={<ProtectedRoute><Layout><OrderList /></Layout></ProtectedRoute>} />
                  <Route path="/order-entry" element={<ProtectedRoute><Layout><OrderEntry /></Layout></ProtectedRoute>} />
                  <Route path="/order-history" element={<ProtectedRoute><Layout><OrderHistory /></Layout></ProtectedRoute>} />
                  
                  {/* Payment Management */}
                  <Route path="/payments" element={<ProtectedRoute><Layout><Payments /></Layout></ProtectedRoute>} />
                  <Route path="/payment-list" element={<ProtectedRoute><Layout><PaymentList /></Layout></ProtectedRoute>} />
                  <Route path="/payment-create" element={<ProtectedRoute><Layout><PaymentCreate /></Layout></ProtectedRoute>} />
                  <Route path="/payment-list-view" element={<ProtectedRoute><Layout><PaymentListView /></Layout></ProtectedRoute>} />
                  
                  {/* Outstanding Management */}
                  <Route path="/outstanding" element={<ProtectedRoute><Layout><Outstanding /></Layout></ProtectedRoute>} />
                  <Route path="/outstanding-dues" element={<ProtectedRoute><Layout><OutstandingDues /></Layout></ProtectedRoute>} />
                  <Route path="/outstanding-amounts" element={<ProtectedRoute><Layout><OutstandingAmounts /></Layout></ProtectedRoute>} />
                  
                  {/* Supplier Management */}
                  <Route path="/suppliers" element={<ProtectedRoute><Layout><Suppliers /></Layout></ProtectedRoute>} />
                  <Route path="/supplier-directory" element={<ProtectedRoute><Layout><SupplierDirectory /></Layout></ProtectedRoute>} />
                  <Route path="/supplier-payments" element={<ProtectedRoute><Layout><SupplierPayments /></Layout></ProtectedRoute>} />
                  <Route path="/supplier-ledger" element={<ProtectedRoute><Layout><SupplierLedger /></Layout></ProtectedRoute>} />
                  <Route path="/supplier-rates" element={<ProtectedRoute><Layout><SupplierRates /></Layout></ProtectedRoute>} />
                  
                  {/* Delivery & Distribution */}
                  <Route path="/load-sheet" element={<ProtectedRoute><Layout><LoadSheetManagement /></Layout></ProtectedRoute>} />
                  <Route path="/delivery-sheet" element={<ProtectedRoute><Layout><DeliverySheet /></Layout></ProtectedRoute>} />
                  <Route path="/delivery-scheduling" element={<ProtectedRoute><Layout><DeliveryScheduling /></Layout></ProtectedRoute>} />
                  <Route path="/route-management" element={<ProtectedRoute><Layout><RouteManagement /></Layout></ProtectedRoute>} />
                  <Route path="/delivery-notifications" element={<ProtectedRoute><Layout><DeliveryNotifications /></Layout></ProtectedRoute>} />
                  <Route path="/delivery-sheet-create" element={<ProtectedRoute><Layout><DeliverySheetCreate /></Layout></ProtectedRoute>} />
                  <Route path="/enhanced-delivery-sheet" element={<ProtectedRoute><Layout><EnhancedDeliverySheet /></Layout></ProtectedRoute>} />
                  <Route path="/track-delivery-sheet" element={<ProtectedRoute><Layout><TrackDeliverySheet /></Layout></ProtectedRoute>} />
                  <Route path="/delivery-challan" element={<ProtectedRoute><Layout><DeliveryChallan /></Layout></ProtectedRoute>} />
                  
                  {/* Track Sheet Management */}
                  <Route path="/track-sheet" element={<ProtectedRoute><Layout><TrackSheet /></Layout></ProtectedRoute>} />
                  <Route path="/track-sheet-history" element={<ProtectedRoute><Layout><TrackSheetHistory /></Layout></ProtectedRoute>} />
                  <Route path="/track-sheet-manager" element={<ProtectedRoute><Layout><TrackSheetManager /></Layout></ProtectedRoute>} />
                  <Route path="/track-sheet-advanced" element={<ProtectedRoute><Layout><TrackSheetAdvanced /></Layout></ProtectedRoute>} />
                  
                  {/* Inventory Management */}
                  <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
                  <Route path="/inventory-dashboard" element={<ProtectedRoute><Layout><InventoryDashboard /></Layout></ProtectedRoute>} />
                  <Route path="/stock-management" element={<ProtectedRoute><Layout><StockManagement /></Layout></ProtectedRoute>} />
                  <Route path="/stock-settings" element={<ProtectedRoute><Layout><StockSettings /></Layout></ProtectedRoute>} />
                  
                  {/* Purchase Management */}
                  <Route path="/purchase-management" element={<ProtectedRoute><Layout><PurchaseManagement /></Layout></ProtectedRoute>} />
                  <Route path="/purchase-history" element={<ProtectedRoute><Layout><PurchaseHistory /></Layout></ProtectedRoute>} />
                  
                  {/* Invoice Management */}
                  <Route path="/invoices" element={<ProtectedRoute><Layout><Invoices /></Layout></ProtectedRoute>} />
                  <Route path="/invoice-create" element={<ProtectedRoute><Layout><InvoiceCreate /></Layout></ProtectedRoute>} />
                  <Route path="/invoice-history" element={<ProtectedRoute><Layout><InvoiceHistory /></Layout></ProtectedRoute>} />
                  <Route path="/invoice/:id" element={<ProtectedRoute><Layout><InvoiceDetail /></Layout></ProtectedRoute>} />
                  <Route path="/invoice-generator" element={<ProtectedRoute><Layout><InvoiceGenerator /></Layout></ProtectedRoute>} />
                  <Route path="/invoice-templates" element={<ProtectedRoute><Layout><InvoiceTemplates /></Layout></ProtectedRoute>} />
                  
                  {/* Rate Management */}
                  <Route path="/customer-rates" element={<ProtectedRoute><Layout><CustomerRates /></Layout></ProtectedRoute>} />
                  <Route path="/bulk-rates" element={<ProtectedRoute><Layout><BulkRates /></Layout></ProtectedRoute>} />
                  <Route path="/bulk-rate-update" element={<ProtectedRoute><Layout><BulkRateUpdate /></Layout></ProtectedRoute>} />
                  <Route path="/product-rates" element={<ProtectedRoute><Layout><ProductRates /></Layout></ProtectedRoute>} />
                  
                  {/* Vehicle & Route Management */}
                  <Route path="/vehicle-tracking" element={<ProtectedRoute><Layout><VehicleTracking /></Layout></ProtectedRoute>} />
                  <Route path="/vehicle-salesman-create" element={<ProtectedRoute><Layout><VehicleSalesmanCreate /></Layout></ProtectedRoute>} />
                  <Route path="/area-management" element={<ProtectedRoute><Layout><AreaManagement /></Layout></ProtectedRoute>} />
                  
                  {/* Analytics & Reports */}
                  <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
                  <Route path="/sales-analytics" element={<ProtectedRoute><Layout><SalesAnalytics /></Layout></ProtectedRoute>} />
                  <Route path="/business-intelligence" element={<ProtectedRoute><Layout><BusinessIntelligence /></Layout></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
                  <Route path="/sales-report" element={<ProtectedRoute><Layout><SalesReport /></Layout></ProtectedRoute>} />
                  
                  {/* Expenses */}
                  <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
                  <Route path="/expenses-revamped" element={<ProtectedRoute><Layout><ExpensesRevamped /></Layout></ProtectedRoute>} />
                  
                  {/* Communication */}
                  <Route path="/messaging" element={<ProtectedRoute><Layout><Messaging /></Layout></ProtectedRoute>} />
                  <Route path="/communication" element={<ProtectedRoute><Layout><Communication /></Layout></ProtectedRoute>} />
                  <Route path="/bulk-communication" element={<ProtectedRoute><Layout><BulkCommunication /></Layout></ProtectedRoute>} />
                  <Route path="/sms-templates" element={<ProtectedRoute><Layout><SmsTemplates /></Layout></ProtectedRoute>} />
                  <Route path="/email-templates" element={<ProtectedRoute><Layout><EmailTemplates /></Layout></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
                  
                  {/* Advanced Features */}
                  <Route path="/advanced" element={<ProtectedRoute><Layout><Advanced /></Layout></ProtectedRoute>} />
                  <Route path="/advanced-features" element={<ProtectedRoute><Layout><AdvancedFeatures /></Layout></ProtectedRoute>} />
                  
                  {/* Master Data */}
                  <Route path="/master" element={<ProtectedRoute><Layout><Master /></Layout></ProtectedRoute>} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                  <Route path="/tax-settings" element={<ProtectedRoute><Layout><TaxSettings /></Layout></ProtectedRoute>} />
                  <Route path="/financial-year" element={<ProtectedRoute><Layout><FinancialYear /></Layout></ProtectedRoute>} />
                  <Route path="/ui-settings" element={<ProtectedRoute><Layout><UISettings /></Layout></ProtectedRoute>} />
                  <Route path="/user-access" element={<ProtectedRoute><Layout><UserAccess /></Layout></ProtectedRoute>} />
                  <Route path="/role-management" element={<ProtectedRoute><Layout><RoleManagementPage /></Layout></ProtectedRoute>} />
                  <Route path="/company-profile" element={<ProtectedRoute><Layout><CompanyProfile /></Layout></ProtectedRoute>} />
                  
                  {/* Testing */}
                  <Route path="/testing-report" element={<ProtectedRoute><Layout><TestingReport /></Layout></ProtectedRoute>} />
                </Routes>
              </div>
            </ThemeProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
