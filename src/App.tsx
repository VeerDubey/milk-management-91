
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from "./contexts/DataContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import OutstandingDues from "./pages/OutstandingDues";
import TrackSheetHistory from "./pages/TrackSheetHistory";
import TruckSheet from "./pages/TruckSheet";
import SupplierDirectory from "./pages/SupplierDirectory";
import InvoiceGenerator from "./pages/InvoiceGenerator";
import InvoiceDetail from "./pages/InvoiceDetail";

function App() {
  return (
    <InvoiceProvider>
      <DataProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/outstanding-dues" element={<OutstandingDues />} />
          <Route path="/track-sheet-history" element={<TrackSheetHistory />} />
          <Route path="/truck-sheet" element={<TruckSheet />} />
          <Route path="/supplier-directory" element={<SupplierDirectory />} />
          <Route path="/invoice-generator" element={<InvoiceGenerator />} />
          <Route path="/invoice/:id" element={<InvoiceDetail />} />
        </Routes>
      </DataProvider>
    </InvoiceProvider>
  );
}

export default App;
