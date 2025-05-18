
// Add imports for new pages
import OutstandingDues from "./pages/OutstandingDues";
import TrackSheetHistory from "./pages/TrackSheetHistory";
import TruckSheet from "./pages/TruckSheet";

// Define routes to include the new pages
<Route path="/outstanding-dues" element={<OutstandingDues />} />
<Route path="/track-sheet-history" element={<TrackSheetHistory />} />
<Route path="/truck-sheet" element={<TruckSheet />} />
