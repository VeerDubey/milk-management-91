import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from '@/components/ui/sonner';

// Layout Components
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

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
            <ThemeProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Dashboard /></Layout>} />
                  </Route>
                  <Route path="/dashboard" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Dashboard /></Layout>} />
                  </Route>
                  
                  {/* Customer Management */}
                  <Route path="/customers" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Customers /></Layout>} />
                  </Route>
                  <Route path="/customer-list" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerList /></Layout>} />
                  </Route>
                  <Route path="/customer/:id" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerDetail /></Layout>} />
                  </Route>
                  <Route path="/customer-directory" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerDirectory /></Layout>} />
                  </Route>
                  <Route path="/customer-ledger" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerLedger /></Layout>} />
                  </Route>
                  <Route path="/customer-statement" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerStatement /></Layout>} />
                  </Route>
                  <Route path="/customer-report" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerReport /></Layout>} />
                  </Route>
                  <Route path="/customer-ledger-report" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerLedgerReport /></Layout>} />
                  </Route>
                  <Route path="/customer-payment-management" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerPaymentManagement /></Layout>} />
                  </Route>
                  
                  {/* Product Management */}
                  <Route path="/products" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Products /></Layout>} />
                  </Route>
                  <Route path="/product-list" element={<ProtectedRoute />}>
                    <Route index element={<Layout><ProductList /></Layout>} />
                  </Route>
                  <Route path="/product/:id" element={<ProtectedRoute />}>
                    <Route index element={<Layout><ProductDetail /></Layout>} />
                  </Route>
                  <Route path="/product-categories" element={<ProtectedRoute />}>
                    <Route index element={<Layout><ProductCategories /></Layout>} />
                  </Route>
                  
                  {/* Order Management */}
                  <Route path="/orders" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Orders /></Layout>} />
                  </Route>
                  <Route path="/order-list" element={<ProtectedRoute />}>
                    <Route index element={<Layout><OrderList /></Layout>} />
                  </Route>
                  <Route path="/order-entry" element={<ProtectedRoute />}>
                    <Route index element={<Layout><OrderEntry /></Layout>} />
                  </Route>
                  <Route path="/order-history" element={<ProtectedRoute />}>
                    <Route index element={<Layout><OrderHistory /></Layout>} />
                  </Route>
                  
                  {/* Payment Management */}
                  <Route path="/payments" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Payments /></Layout>} />
                  </Route>
                  <Route path="/payment-list" element={<ProtectedRoute />}>
                    <Route index element={<Layout><PaymentList /></Layout>} />
                  </Route>
                  <Route path="/payment-create" element={<ProtectedRoute />}>
                    <Route index element={<Layout><PaymentCreate /></Layout>} />
                  </Route>
                  <Route path="/payment-list-view" element={<ProtectedRoute />}>
                    <Route index element={<Layout><PaymentListView /></Layout>} />
                  </Route>
                  
                  {/* Outstanding Management */}
                  <Route path="/outstanding" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Outstanding /></Layout>} />
                  </Route>
                  <Route path="/outstanding-dues" element={<ProtectedRoute />}>
                    <Route index element={<Layout><OutstandingDues /></Layout>} />
                  </Route>
                  <Route path="/outstanding-amounts" element={<ProtectedRoute />}>
                    <Route index element={<Layout><OutstandingAmounts /></Layout>} />
                  </Route>
                  
                  {/* Supplier Management */}
                  <Route path="/suppliers" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Suppliers /></Layout>} />
                  </Route>
                  <Route path="/supplier-directory" element={<ProtectedRoute />}>
                    <Route index element={<Layout><SupplierDirectory /></Layout>} />
                  </Route>
                  <Route path="/supplier-payments" element={<ProtectedRoute />}>
                    <Route index element={<Layout><SupplierPayments /></Layout>} />
                  </Route>
                  <Route path="/supplier-ledger" element={<ProtectedRoute />}>
                    <Route index element={<Layout><SupplierLedger /></Layout>} />
                  </Route>
                  <Route path="/supplier-rates" element={<ProtectedRoute />}>
                    <Route index element={<Layout><SupplierRates /></Layout>} />
                  </Route>
                  
                  {/* Delivery & Distribution */}
                  <Route path="/load-sheet" element={<ProtectedRoute />}>
                    <Route index element={<Layout><LoadSheetManagement /></Layout>} />
                  </Route>
                  <Route path="/delivery-sheet" element={<ProtectedRoute />}>
                    <Route index element={<Layout><DeliverySheet /></Layout>} />
                  </Route>
                  <Route path="/delivery-scheduling" element={<ProtectedRoute />}>
                    <Route index element={<Layout><DeliveryScheduling /></Layout>} />
                  </Route>
                  <Route path="/route-management" element={<ProtectedRoute />}>
                    <Route index element={<Layout><RouteManagement /></Layout>} />
                  </Route>
                  <Route path="/delivery-notifications" element={<ProtectedRoute />}>
                    <Route index element={<Layout><DeliveryNotifications /></Layout>} />
                  </Route>
                  <Route path="/delivery-sheet-create" element={<ProtectedRoute />}>
                    <Route index element={<Layout><DeliverySheetCreate /></Layout>} />
                  </Route>
                  <Route path="/enhanced-delivery-sheet" element={<ProtectedRoute />}>
                    <Route index element={<Layout><EnhancedDeliverySheet /></Layout>} />
                  </Route>
                  <Route path="/track-delivery-sheet" element={<ProtectedRoute />}>
                    <Route index element={<Layout><TrackDeliverySheet /></Layout>} />
                  </Route>
                  <Route path="/delivery-challan" element={<ProtectedRoute />}>
                    <Route index element={<Layout><DeliveryChallan /></Layout>} />
                  </Route>
                  
                  {/* Track Sheet Management */}
                  <Route path="/track-sheet" element={<ProtectedRoute />}>
                    <Route index element={<Layout><TrackSheet /></Layout>} />
                  </Route>
                  <Route path="/track-sheet-history" element={<ProtectedRoute />}>
                    <Route index element={<Layout><TrackSheetHistory /></Layout>} />
                  </Route>
                  <Route path="/track-sheet-manager" element={<ProtectedRoute />}>
                    <Route index element={<Layout><TrackSheetManager /></Layout>} />
                  </Route>
                  <Route path="/track-sheet-advanced" element={<ProtectedRoute />}>
                    <Route index element={<Layout><TrackSheetAdvanced /></Layout>} />
                  </Route>
                  
                  {/* Inventory Management */}
                  <Route path="/inventory" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Inventory /></Layout>} />
                  </Route>
                  <Route path="/inventory-dashboard" element={<ProtectedRoute />}>
                    <Route index element={<Layout><InventoryDashboard /></Layout>} />
                  </Route>
                  <Route path="/stock-management" element={<ProtectedRoute />}>
                    <Route index element={<Layout><StockManagement /></Layout>} />
                  </Route>
                  <Route path="/stock-settings" element={<ProtectedRoute />}>
                    <Route index element={<Layout><StockSettings /></Layout>} />
                  </Route>
                  
                  {/* Purchase Management */}
                  <Route path="/purchase-management" element={<ProtectedRoute />}>
                    <Route index element={<Layout><PurchaseManagement /></Layout>} />
                  </Route>
                  <Route path="/purchase-history" element={<ProtectedRoute />}>
                    <Route index element={<Layout><PurchaseHistory /></Layout>} />
                  </Route>
                  
                  {/* Invoice Management */}
                  <Route path="/invoices" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Invoices /></Layout>} />
                  </Route>
                  <Route path="/invoice-create" element={<ProtectedRoute />}>
                    <Route index element={<Layout><InvoiceCreate /></Layout>} />
                  </Route>
                  <Route path="/invoice-history" element={<ProtectedRoute />}>
                    <Route index element={<Layout><InvoiceHistory /></Layout>} />
                  </Route>
                  <Route path="/invoice/:id" element={<ProtectedRoute />}>
                    <Route index element={<Layout><InvoiceDetail /></Layout>} />
                  </Route>
                  <Route path="/invoice-generator" element={<ProtectedRoute />}>
                    <Route index element={<Layout><InvoiceGenerator /></Layout>} />
                  </Route>
                  <Route path="/invoice-templates" element={<ProtectedRoute />}>
                    <Route index element={<Layout><InvoiceTemplates /></Layout>} />
                  </Route>
                  
                  {/* Rate Management */}
                  <Route path="/customer-rates" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CustomerRates /></Layout>} />
                  </Route>
                  <Route path="/bulk-rates" element={<ProtectedRoute />}>
                    <Route index element={<Layout><BulkRates /></Layout>} />
                  </Route>
                  <Route path="/bulk-rate-update" element={<ProtectedRoute />}>
                    <Route index element={<Layout><BulkRateUpdate /></Layout>} />
                  </Route>
                  <Route path="/product-rates" element={<ProtectedRoute />}>
                    <Route index element={<Layout><ProductRates /></Layout>} />
                  </Route>
                  
                  {/* Vehicle & Route Management */}
                  <Route path="/vehicle-tracking" element={<ProtectedRoute />}>
                    <Route index element={<Layout><VehicleTracking /></Layout>} />
                  </Route>
                  <Route path="/vehicle-salesman-create" element={<ProtectedRoute />}>
                    <Route index element={<Layout><VehicleSalesmanCreate /></Layout>} />
                  </Route>
                  <Route path="/area-management" element={<ProtectedRoute />}>
                    <Route index element={<Layout><AreaManagement /></Layout>} />
                  </Route>
                  
                  {/* Analytics & Reports */}
                  <Route path="/analytics" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Analytics /></Layout>} />
                  </Route>
                  <Route path="/sales-analytics" element={<ProtectedRoute />}>
                    <Route index element={<Layout><SalesAnalytics /></Layout>} />
                  </Route>
                  <Route path="/business-intelligence" element={<ProtectedRoute />}>
                    <Route index element={<Layout><BusinessIntelligence /></Layout>} />
                  </Route>
                  <Route path="/reports" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Reports /></Layout>} />
                  </Route>
                  <Route path="/sales-report" element={<ProtectedRoute />}>
                    <Route index element={<Layout><SalesReport /></Layout>} />
                  </Route>
                  
                  {/* Expenses */}
                  <Route path="/expenses" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Expenses /></Layout>} />
                  </Route>
                  <Route path="/expenses-revamped" element={<ProtectedRoute />}>
                    <Route index element={<Layout><ExpensesRevamped /></Layout>} />
                  </Route>
                  
                  {/* Communication */}
                  <Route path="/messaging" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Messaging /></Layout>} />
                  </Route>
                  <Route path="/communication" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Communication /></Layout>} />
                  </Route>
                  <Route path="/bulk-communication" element={<ProtectedRoute />}>
                    <Route index element={<Layout><BulkCommunication /></Layout>} />
                  </Route>
                  <Route path="/sms-templates" element={<ProtectedRoute />}>
                    <Route index element={<Layout><SmsTemplates /></Layout>} />
                  </Route>
                  <Route path="/email-templates" element={<ProtectedRoute />}>
                    <Route index element={<Layout><EmailTemplates /></Layout>} />
                  </Route>
                  <Route path="/notifications" element={<ProtectedRoute />}>
                    <Route index element={<Layout><NotificationsPage /></Layout>} />
                  </Route>
                  
                  {/* Advanced Features */}
                  <Route path="/advanced" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Advanced /></Layout>} />
                  </Route>
                  <Route path="/advanced-features" element={<ProtectedRoute />}>
                    <Route index element={<Layout><AdvancedFeatures /></Layout>} />
                  </Route>
                  
                  {/* Master Data */}
                  <Route path="/master" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Master /></Layout>} />
                  </Route>
                  
                  {/* Settings */}
                  <Route path="/settings" element={<ProtectedRoute />}>
                    <Route index element={<Layout><Settings /></Layout>} />
                  </Route>
                  <Route path="/tax-settings" element={<ProtectedRoute />}>
                    <Route index element={<Layout><TaxSettings /></Layout>} />
                  </Route>
                  <Route path="/financial-year" element={<ProtectedRoute />}>
                    <Route index element={<Layout><FinancialYear /></Layout>} />
                  </Route>
                  <Route path="/ui-settings" element={<ProtectedRoute />}>
                    <Route index element={<Layout><UISettings /></Layout>} />
                  </Route>
                  <Route path="/user-access" element={<ProtectedRoute />}>
                    <Route index element={<Layout><UserAccess /></Layout>} />
                  </Route>
                  <Route path="/role-management" element={<ProtectedRoute />}>
                    <Route index element={<Layout><RoleManagementPage /></Layout>} />
                  </Route>
                  <Route path="/company-profile" element={<ProtectedRoute />}>
                    <Route index element={<Layout><CompanyProfile /></Layout>} />
                  </Route>
                  
                  {/* Testing */}
                  <Route path="/testing-report" element={<ProtectedRoute />}>
                    <Route index element={<Layout><TestingReport /></Layout>} />
                  </Route>
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
