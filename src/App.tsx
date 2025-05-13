
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Invoices from "@/pages/Invoices";
import Outstanding from "@/pages/Outstanding";
import FinancialYear from "@/pages/FinancialYear";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import { Layout } from "@/components/Layout";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <InvoiceProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/outstanding" element={<Outstanding />} />
                <Route path="/financial-year" element={<FinancialYear />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </InvoiceProvider>
        </DataProvider>
      </AuthProvider>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
