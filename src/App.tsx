
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
import InvoiceCreate from "@/pages/InvoiceCreate";
import Invoices from "@/pages/Invoices";
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
              <Route path="/supplier-list" element={<SupplierList />} />
              <Route path="/supplier-directory" element={<SupplierList />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoice-create" element={<InvoiceCreate />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </InvoiceProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
