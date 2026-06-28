import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IntroLoader from './components/IntroLoader';
import PageTransition from './components/PageTransition';

// Lazy load pages for performance and code-splitting
const Home = lazy(() => import('./pages/Home'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Services = lazy(() => import('./pages/Services'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Elegant loading spinner fallback for page Suspense
const PageSuspenseFallback = () => (
  <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-stone-400 gap-4">
    <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
    <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-gold/80">Loading Page...</span>
  </div>
);

// Nested routes component to access useLocation hook for route transitions
const AppContent = ({ showIntro, setShowIntro }) => {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroLoader onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen bg-zinc-950 text-stone-300">
        {/* Header Navbar */}
        <Navbar />

        {/* Page content wrapper */}
        <main className="flex-grow">
          {/* Homepage reveal transition scale and fade on initial mount */}
          <AnimatePresence mode="wait">
            {!showIntro && (
              <Suspense fallback={<PageSuspenseFallback />}>
                <Routes location={location} key={location.pathname}>
                  {/* Customer Routes */}
                  <Route
                    path="/"
                    element={
                      <PageTransition>
                        <Home />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/portfolio"
                    element={
                      <PageTransition>
                        <Portfolio />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/services"
                    element={
                      <PageTransition>
                        <Services />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <PageTransition>
                        <Checkout />
                      </PageTransition>
                    }
                  />

                  {/* Administration Access */}
                  <Route
                    path="/admin/login"
                    element={
                      <PageTransition>
                        <AdminLogin />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <PageTransition>
                        <AdminDashboard />
                      </PageTransition>
                    }
                  />

                  {/* Catch-all 404 redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        {!showIntro && <Footer />}
      </div>
    </>
  );
};

export const App = () => {
  const [showIntro, setShowIntro] = useState(() => {
    // Check if the intro has already run in this browser session
    const hasRun = sessionStorage.getItem('pelligallery_intro_played');
    if (hasRun) return false;
    sessionStorage.setItem('pelligallery_intro_played', 'true');
    return true;
  });

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent showIntro={showIntro} setShowIntro={setShowIntro} />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

