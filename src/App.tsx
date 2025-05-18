
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OutstandingDues from "./pages/OutstandingDues";
import TrackSheetHistory from "./pages/TrackSheetHistory";
import TruckSheet from "./pages/TruckSheet";

function App() {
  return (
    <Routes>
      <Route path="/outstanding-dues" element={<OutstandingDues />} />
      <Route path="/track-sheet-history" element={<TrackSheetHistory />} />
      <Route path="/truck-sheet" element={<TruckSheet />} />
      {/* Add any other routes here */}
    </Routes>
  );
}

export default App;
