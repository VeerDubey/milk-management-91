
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { DataProvider } from "@/contexts/data/DataContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import Dashboard from "@/pages/Dashboard";
import TrackSheet from "@/pages/TrackSheet";
import ProductList from "@/pages/ProductList";
import ProductView from "@/pages/ProductView";
import CustomerLedger from "@/pages/CustomerLedger";
import SupplierList from "@/pages/SupplierList";
import SupplierDirectory from "@/pages/SupplierDirectory";
import InvoiceCreate from "@/pages/InvoiceCreate";
import Invoices from "@/pages/Invoices";
import OutstandingAmounts from "@/pages/OutstandingAmounts";
import CustomerStatement from "@/pages/CustomerStatement";
import Settings from "@/pages/Settings";
import StockSettings from "@/pages/StockSettings";
import PaymentCreate from "@/pages/PaymentCreate";
import Layout from "@/components/Layout";

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <InvoiceProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/track-sheet" element={<TrackSheet />} />
              <Route path="/product-list" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductView />} />
              <Route path="/customer-ledger" element={<CustomerLedger />} />
              <Route path="/customer-statement/:customerId" element={<CustomerStatement />} />
              <Route path="/supplier-list" element={<SupplierList />} />
              <Route path="/supplier-directory" element={<SupplierDirectory />} />
              <Route path="/outstanding-amounts" element={<OutstandingAmounts />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoice-create" element={<InvoiceCreate />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/stock-settings" element={<StockSettings />} />
              <Route path="/payment-create" element={<PaymentCreate />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </InvoiceProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
