
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from "./contexts/DataContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import OutstandingDues from "./pages/OutstandingDues";
import TrackSheetHistory from "./pages/TrackSheetHistory";
import TruckSheet from "./pages/TruckSheet";

function App() {
  return (
    <InvoiceProvider>
      <DataProvider>
        <Routes>
          <Route path="/outstanding-dues" element={<OutstandingDues />} />
          <Route path="/track-sheet-history" element={<TrackSheetHistory />} />
          <Route path="/truck-sheet" element={<TruckSheet />} />
          {/* Add any other routes here */}
        </Routes>
      </DataProvider>
    </InvoiceProvider>
  );
}

export default App;
