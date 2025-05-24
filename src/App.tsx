
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OrderEntry from './pages/OrderEntry';
import TrackSheet from './pages/TrackSheet';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Analytics from './pages/Analytics';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import SupplierDirectory from './pages/SupplierDirectory';
import Expenses from './pages/Expenses';
import ElectronDetector from './components/ElectronDetector';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/order-entry" element={<OrderEntry />} />
              <Route path="/track-sheet" element={<TrackSheet />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/suppliers" element={<SupplierDirectory />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <ElectronDetector />
          <InstallPrompt />
          <OfflineIndicator />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
