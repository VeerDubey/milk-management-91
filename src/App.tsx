
import React from 'react';
import { Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { DataProvider } from '@/contexts/data/DataContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import LoginLayout from '@/components/layout/LoginLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Import services for initialization
import { OfflineStorageService } from '@/services/OfflineStorageService';
import { EnhancedOfflineService } from '@/services/EnhancedOfflineService';
import { BackupService } from '@/services/BackupService';

// Import all pages
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Master from '@/pages/Master';

// Customer pages
import CustomerList from '@/pages/CustomerList';
import CustomerDirectory from '@/pages/CustomerDirectory';
import CustomerLedger from '@/pages/CustomerLedger';
import CustomerRates from '@/pages/CustomerRates';
import CustomerReport from '@/pages/CustomerReport';
import OutstandingDues from '@/pages/OutstandingDues';
import OutstandingAmounts from '@/pages/OutstandingAmounts';
import CustomerDetail from '@/pages/CustomerDetail';

// Product pages
import ProductList from '@/pages/ProductList';
import ProductRates from '@/pages/ProductRates';
import StockManagement from '@/pages/StockManagement';
import StockSettings from '@/pages/StockSettings';
import ProductCategories from '@/pages/ProductCategories';
import BulkRates from '@/pages/BulkRates';
import ProductDetail from '@/pages/ProductDetail';
import InventoryDashboard from '@/pages/InventoryDashboard';

// Order pages
import OrderList from '@/pages/OrderList';
import OrderEntry from '@/pages/OrderEntry';
import OrderHistory from '@/pages/OrderHistory';

// Payment pages
import PaymentList from '@/pages/PaymentList';
import PaymentCreate from '@/pages/PaymentCreate';

// Invoice pages
import InvoiceHistory from '@/pages/InvoiceHistory';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceTemplates from '@/pages/InvoiceTemplates';

// Communication pages
import Messaging from '@/pages/Messaging';
import EmailTemplates from '@/pages/EmailTemplates';
import SmsTemplates from '@/pages/SmsTemplates';
import BulkCommunication from '@/pages/BulkCommunication';

// Delivery pages
import DeliveryChallan from '@/pages/DeliveryChallan';
import DeliverySheet from '@/pages/DeliverySheet';
import TrackSheetAdvanced from '@/pages/TrackSheetAdvanced';
import TrackSheet from '@/pages/TrackSheet';
import TrackSheetHistory from '@/pages/TrackSheetHistory';
import TrackSheetManager from '@/pages/TrackSheetManager';
import VehicleTracking from '@/pages/VehicleTracking';
import VehicleSalesmanCreate from '@/pages/VehicleSalesmanCreate';

// Supplier pages
import SupplierDirectory from '@/pages/SupplierDirectory';
import SupplierLedger from '@/pages/SupplierLedger';
import SupplierPayments from '@/pages/SupplierPayments';
import SupplierRates from '@/pages/SupplierRates';

// Report pages
import SalesAnalytics from '@/pages/SalesAnalytics';
import SalesReport from '@/pages/SalesReport';
import Analytics from '@/pages/Analytics';

// Settings pages
import CompanyProfile from '@/pages/CompanyProfile';
import AreaManagement from '@/pages/AreaManagement';
import FinancialYear from '@/pages/FinancialYear';
import TaxSettings from '@/pages/TaxSettings';
import UISettings from '@/pages/UISettings';
import UserAccess from '@/pages/UserAccess';
import Expenses from '@/pages/Expenses';

// Import the new testing page
import TestingReportPage from '@/pages/TestingReport';

// Import the new settings provider
import { SettingsProvider } from '@/components/ui-settings/SettingsProvider';

const queryClient = new QueryClient();

function App() {
  // Initialize services
  React.useEffect(() => {
    OfflineStorageService.initialize();
    EnhancedOfflineService.initialize();
    BackupService.autoBackup();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SettingsProvider>
            <AuthProvider>
              <DataProvider>
                <InvoiceProvider>
                  <MessagingProvider>
                    <div className="min-h-screen w-full neo-noir-bg">
                      <Routes>
                        <Route path="/login" element={<LoginLayout><Login /></LoginLayout>} />
                        
                        <Route path="/" element={<ProtectedRoute />}>
                          <Route path="/" element={<AppLayout><Outlet /></AppLayout>}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="master" element={<Master />} />
                            
                            {/* Testing Route */}
                            <Route path="testing-report" element={<TestingReportPage />} />
                            
                            {/* Customer Routes */}
                            <Route path="customer-list" element={<CustomerList />} />
                            <Route path="customer-directory" element={<CustomerDirectory />} />
                            <Route path="customer-ledger" element={<CustomerLedger />} />
                            <Route path="customer-rates" element={<CustomerRates />} />
                            <Route path="customer-report" element={<CustomerReport />} />
                            <Route path="outstanding-dues" element={<OutstandingDues />} />
                            <Route path="outstanding-amounts" element={<OutstandingAmounts />} />
                            <Route path="customer/:id" element={<CustomerDetail />} />
                            
                            {/* Product Routes */}
                            <Route path="inventory-dashboard" element={<InventoryDashboard />} />
                            <Route path="product-list" element={<ProductList />} />
                            <Route path="product-rates" element={<ProductRates />} />
                            <Route path="stock-management" element={<StockManagement />} />
                            <Route path="stock-settings" element={<StockSettings />} />
                            <Route path="product-categories" element={<ProductCategories />} />
                            <Route path="bulk-rates" element={<BulkRates />} />
                            <Route path="product/:id" element={<ProductDetail />} />
                            
                            {/* Order Routes */}
                            <Route path="order-list" element={<OrderList />} />
                            <Route path="order-entry" element={<OrderEntry />} />
                            <Route path="order-history" element={<OrderHistory />} />
                            
                            {/* Payment Routes */}
                            <Route path="payment-list" element={<PaymentList />} />
                            <Route path="payment-create" element={<PaymentCreate />} />
                            
                            {/* Invoice Routes */}
                            <Route path="invoice-history" element={<InvoiceHistory />} />
                            <Route path="invoice-create" element={<InvoiceCreate />} />
                            <Route path="invoice-templates" element={<InvoiceTemplates />} />
                            
                            {/* Communication Routes */}
                            <Route path="messaging" element={<Messaging />} />
                            <Route path="email-templates" element={<EmailTemplates />} />
                            <Route path="sms-templates" element={<SmsTemplates />} />
                            <Route path="bulk-communication" element={<BulkCommunication />} />
                            
                            {/* Delivery Routes */}
                            <Route path="delivery-challan" element={<DeliveryChallan />} />
                            <Route path="delivery-sheet" element={<DeliverySheet />} />
                            <Route path="track-sheet-advanced" element={<TrackSheetAdvanced />} />
                            <Route path="track-sheet" element={<TrackSheet />} />
                            <Route path="track-sheet-history" element={<TrackSheetHistory />} />
                            <Route path="track-sheet-manager" element={<TrackSheetManager />} />
                            <Route path="vehicle-tracking" element={<VehicleTracking />} />
                            <Route path="vehicle-salesman-create" element={<VehicleSalesmanCreate />} />
                            
                            {/* Supplier Routes */}
                            <Route path="supplier-directory" element={<SupplierDirectory />} />
                            <Route path="supplier-ledger" element={<SupplierLedger />} />
                            <Route path="supplier-payments" element={<SupplierPayments />} />
                            <Route path="supplier-rates" element={<SupplierRates />} />
                            
                            {/* Report Routes */}
                            <Route path="sales-analytics" element={<SalesAnalytics />} />
                            <Route path="sales-report" element={<SalesReport />} />
                            <Route path="analytics" element={<Analytics />} />
                            
                            {/* Settings Routes */}
                            <Route path="company-profile" element={<CompanyProfile />} />
                            <Route path="area-management" element={<AreaManagement />} />
                            <Route path="financial-year" element={<FinancialYear />} />
                            <Route path="tax-settings" element={<TaxSettings />} />
                            <Route path="ui-settings" element={<UISettings />} />
                            <Route path="user-access" element={<UserAccess />} />
                            <Route path="expenses" element={<Expenses />} />
                          </Route>
                        </Route>
                      </Routes>
                    </div>
                  </MessagingProvider>
                </InvoiceProvider>
              </DataProvider>
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
