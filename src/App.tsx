
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import { DataProvider } from '@/contexts/data/DataContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
import ModernAuthForm from '@/components/auth/ModernAuthForm';
import { Toaster } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

// Import all pages
import Customers from './pages/Customers';
import OrderDetail from './pages/OrderDetail';
import OrderEdit from './pages/OrderEdit';
import InvoiceCreate from './pages/InvoiceCreate';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Outstanding from './pages/Outstanding';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Master from './pages/Master';
import Advanced from './pages/Advanced';
import Analytics from './pages/Analytics';
import Communication from './pages/Communication';
import Messaging from './pages/Messaging';
import TrackSheet from './pages/TrackSheet';
import DeliverySheet from './pages/DeliverySheet';
import LoadSheetManagement from './pages/LoadSheetManagement';
import Inventory from './pages/Inventory';
import RoleManagementPage from './pages/RoleManagementPage';
import OrderEntry from './pages/OrderEntry';
import Expenses from './pages/Expenses';
import CustomerReport from './pages/CustomerReport';
import SalesReport from './pages/SalesReport';
import InvoiceHistory from './pages/InvoiceHistory';
import OrderHistory from './pages/OrderHistory';
import EmailTemplates from './pages/EmailTemplates';
import SmsTemplates from './pages/SmsTemplates';
import BulkCommunication from './pages/BulkCommunication';
import AreaManagement from './pages/AreaManagement';
import VehicleTracking from './pages/VehicleTracking';
import CompanyProfile from './pages/CompanyProfile';
import PurchaseManagement from './pages/PurchaseManagement';
import RouteManagement from './pages/RouteManagement';
import ProductCategories from './pages/ProductCategories';
import NotificationsPage from './pages/NotificationsPage';
import SalesAnalytics from './pages/SalesAnalytics';
import OutstandingDues from './pages/OutstandingDues';
import CustomerDirectory from './pages/CustomerDirectory';
import PurchaseHistory from './pages/PurchaseHistory';
import StockManagement from './pages/StockManagement';
import StockSettings from './pages/StockSettings';
import TaxSettings from './pages/TaxSettings';
import FinancialYear from './pages/FinancialYear';
import UserAccess from './pages/UserAccess';
import BulkRates from './pages/BulkRates';
import BusinessIntelligencePage from './pages/BusinessIntelligence';

function App() {
  return (
    <EnhancedAuthProvider>
      <DataProvider>
        <InvoiceProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster />
            <Router>
              <Routes>
                <Route path="/login" element={<ModernAuthForm />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/invoices" element={<AppLayout><Invoices /></AppLayout>} />
                  <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
                  <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
                  <Route path="/orders" element={<AppLayout><Orders /></AppLayout>} />
                  <Route path="/orders/:id" element={<AppLayout><OrderDetail /></AppLayout>} />
                  <Route path="/orders/edit/:id" element={<AppLayout><OrderEdit /></AppLayout>} />
                  <Route path="/invoices/create/:orderId" element={<AppLayout><InvoiceCreate /></AppLayout>} />
                  <Route path="/payments" element={<AppLayout><Payments /></AppLayout>} />
                  <Route path="/outstanding" element={<AppLayout><Outstanding /></AppLayout>} />
                  <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
                  <Route path="/customer-report" element={<AppLayout><CustomerReport /></AppLayout>} />
                  <Route path="/sales-report" element={<AppLayout><SalesReport /></AppLayout>} />
                  <Route path="/invoice-history" element={<AppLayout><InvoiceHistory /></AppLayout>} />
                  <Route path="/order-history" element={<AppLayout><OrderHistory /></AppLayout>} />
                  <Route path="/suppliers" element={<AppLayout><Suppliers /></AppLayout>} />
                  <Route path="/master" element={<AppLayout><Master /></AppLayout>} />
                  <Route path="/advanced" element={<AppLayout><Advanced /></AppLayout>} />
                  <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
                  <Route path="/business-intelligence" element={<AppLayout><BusinessIntelligencePage /></AppLayout>} />
                  <Route path="/communication" element={<AppLayout><Communication /></AppLayout>} />
                  <Route path="/messaging" element={<AppLayout><Messaging /></AppLayout>} />
                  <Route path="/email-templates" element={<AppLayout><EmailTemplates /></AppLayout>} />
                  <Route path="/sms-templates" element={<AppLayout><SmsTemplates /></AppLayout>} />
                  <Route path="/bulk-communication" element={<AppLayout><BulkCommunication /></AppLayout>} />
                  <Route path="/track-sheet" element={<AppLayout><TrackSheet /></AppLayout>} />
                  <Route path="/delivery-sheet" element={<AppLayout><DeliverySheet /></AppLayout>} />
                  <Route path="/load-sheet" element={<AppLayout><LoadSheetManagement /></AppLayout>} />
                  <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
                  <Route path="/order-entry" element={<AppLayout><OrderEntry /></AppLayout>} />
                  <Route path="/expenses" element={<AppLayout><Expenses /></AppLayout>} />
                  <Route path="/purchase-management" element={<AppLayout><PurchaseManagement /></AppLayout>} />
                  <Route path="/product-categories" element={<AppLayout><ProductCategories /></AppLayout>} />
                  <Route path="/purchase-history" element={<AppLayout><PurchaseHistory /></AppLayout>} />
                  <Route path="/sales-analytics" element={<AppLayout><SalesAnalytics /></AppLayout>} />
                  <Route path="/outstanding-dues" element={<AppLayout><OutstandingDues /></AppLayout>} />
                  <Route path="/customer-directory" element={<AppLayout><CustomerDirectory /></AppLayout>} />
                  <Route path="/route-management" element={<AppLayout><RouteManagement /></AppLayout>} />
                  <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
                  <Route path="/role-management" element={<AppLayout><RoleManagementPage /></AppLayout>} />
                  <Route path="/area-management" element={<AppLayout><AreaManagement /></AppLayout>} />
                  <Route path="/vehicle-tracking" element={<AppLayout><VehicleTracking /></AppLayout>} />
                  <Route path="/company-profile" element={<AppLayout><CompanyProfile /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                  <Route path="/ui-settings" element={<AppLayout><Settings /></AppLayout>} />
                  <Route path="/stock-management" element={<AppLayout><StockManagement /></AppLayout>} />
                  <Route path="/stock-settings" element={<AppLayout><StockSettings /></AppLayout>} />
                  <Route path="/tax-settings" element={<AppLayout><TaxSettings /></AppLayout>} />
                  <Route path="/financial-year" element={<AppLayout><FinancialYear /></AppLayout>} />
                  <Route path="/user-access" element={<AppLayout><UserAccess /></AppLayout>} />
                  <Route path="/bulk-rates" element={<AppLayout><BulkRates /></AppLayout>} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </InvoiceProvider>
      </DataProvider>
    </EnhancedAuthProvider>
  );
}

export default App;
