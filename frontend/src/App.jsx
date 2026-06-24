import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-zinc-950 text-stone-300">
            {/* Header Navbar */}
            <Navbar />

            {/* Page content wrapper */}
            <main className="flex-grow">
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/services" element={<Services />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* Administration Access */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Catch-all 404 redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
