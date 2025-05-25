
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from '@/contexts/DataContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Payments from './pages/Payments';
import CreatePayment from './pages/CreatePayment';
import SupplierPayments from './pages/SupplierPayments';

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-16 p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/create-payment" element={<CreatePayment />} />
              <Route path="/supplier-payments" element={<SupplierPayments />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
