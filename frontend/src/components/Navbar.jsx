import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, LogOut, Trash2, Plus, Minus, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const { admin, logout } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [isCartOpen, setIsCartOpen] = useState(false); // Cart Drawer state
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinkClass = (path) => {
    const active = location.pathname === path;
    return `relative py-1.5 transition-all duration-300 text-xs font-semibold uppercase tracking-[0.2em] ${
      active ? 'text-gold' : 'text-stone-300 hover:text-gold-400'
    }`;
  };

  const renderLink = (path, label) => {
    const active = location.pathname === path;
    return (
      <Link to={path} className={getLinkClass(path)}>
        {label}
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Main Header */}
      <nav className={`fixed top-0 left-0 right-0 z-40 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-500 border-b ${
        isScrolled || location.pathname !== '/'
          ? 'bg-luxury-black/95 backdrop-blur-md border-white/5 py-3 shadow-lg shadow-black/20 text-luxury-cream' 
          : 'bg-transparent border-transparent text-white'
      }`}>
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-center">
          <span className="font-serif text-xl sm:text-2xl tracking-widest text-luxury-cream">
            PELLIPUSTHAKAM
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] text-gold-400 -mt-1 font-sans uppercase">
            Photography · Hyderabad
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest">
          {renderLink('/', 'Home')}
          {renderLink('/portfolio', 'Portfolio')}
          {renderLink('/services', 'Services')}
          
          {admin ? (
            <div className="flex items-center space-x-6 border-l border-white/10 pl-6">
              <Link to="/admin/dashboard" className={`text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] relative py-1.5 ${location.pathname === '/admin/dashboard' ? 'text-gold' : ''}`}>
                <ShieldAlert className="w-4 h-4 text-gold" /> Dashboard
                {location.pathname === '/admin/dashboard' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
                )}
              </Link>
              <button 
                onClick={handleLogout}
                className="text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className={`text-[10px] text-stone-400 hover:text-gold hover:border-gold/50 transition-all border border-white/15 px-3 py-1 rounded-sm tracking-[0.15em] font-semibold uppercase ${location.pathname === '/admin/login' ? 'border-gold text-gold' : ''}`}>
              Admin
            </Link>
          )}

          {/* Cart Icon trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white hover:text-gold transition-colors ml-4"
          >
            <ShoppingBag className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-luxury-black font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse-subtle">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center space-x-4 md:hidden">
          {/* Mobile Cart Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white hover:text-gold transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-luxury-black font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </button>

          {/* Hamburger Menu Trigger */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-stone-300 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-luxury-black/95 backdrop-blur-lg flex flex-col justify-center items-center space-y-8 text-lg uppercase tracking-[0.25em] md:hidden animate-fade-in text-stone-300 overflow-y-auto max-h-screen py-20">
          <Link to="/" onClick={() => setIsOpen(false)} className={`transition-colors py-2 ${location.pathname === '/' ? 'text-gold font-semibold' : 'text-stone-300'}`}>Home</Link>
          <Link to="/portfolio" onClick={() => setIsOpen(false)} className={`transition-colors py-2 ${location.pathname === '/portfolio' ? 'text-gold font-semibold' : 'text-stone-300'}`}>Portfolio</Link>
          <Link to="/services" onClick={() => setIsOpen(false)} className={`transition-colors py-2 ${location.pathname === '/services' ? 'text-gold font-semibold' : 'text-stone-300'}`}>Services</Link>
          
          {admin ? (
            <>
              <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className={`text-gold transition-colors py-2 ${location.pathname === '/admin/dashboard' ? 'font-semibold' : ''}`}>Admin Dashboard</Link>
              <button 
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="text-rose-400 flex items-center gap-2 mt-4 text-sm font-semibold tracking-widest uppercase border border-rose-500/20 px-4 py-2 rounded-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <Link to="/admin/login" onClick={() => setIsOpen(false)} className={`transition-colors py-2 ${location.pathname === '/admin/login' ? 'text-gold font-semibold' : 'text-stone-300'}`}>Admin Login</Link>
          )}
        </div>
      )}

      {/* Cart Drawer Overlay & Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay background */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 pl-0 sm:pl-10 max-w-full flex">
            {/* Drawer Panel */}
            <div className="w-screen max-w-md bg-luxury-black border-l border-white/5 flex flex-col text-white shadow-2xl animate-fade-in">
              <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-serif tracking-[0.2em] text-gold flex items-center gap-2 uppercase">
                  <ShoppingBag className="w-5 h-5" /> Selections
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-stone-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-64 flex flex-col justify-center items-center text-center space-y-6 text-stone-550">
                    <ShoppingBag className="w-12 h-12 stroke-[1] text-stone-600" />
                    <p className="font-sans text-xs tracking-wider">Your booking list is currently empty.</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); navigate('/services'); }}
                      className="text-gold border border-gold/20 px-5 py-2.5 rounded-sm text-[10px] tracking-widest uppercase hover:bg-gold/10 transition-all font-semibold"
                    >
                      Browse Packages
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const customsSum = item.selected_customizations.reduce((sum, opt) => sum + opt.price, 0);
                    const singleTotal = item.base_price + customsSum;

                    return (
                      <div key={item.cartItemId} className="border-b border-white/5 pb-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-serif text-base text-stone-200 tracking-wide">{item.name}</h3>
                            <p className="text-xs text-gold font-semibold mt-1 font-sans">
                              INR {singleTotal.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-stone-500 hover:text-rose-400 transition-colors p-1"
                            title="Remove Selection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Custom Options Display */}
                        {item.selected_customizations.length > 0 && (
                          <div className="bg-white/5 rounded p-2 text-[10px] text-stone-400 space-y-1 font-sans">
                            <span className="font-bold text-[9px] uppercase text-stone-500 block mb-1">Custom Add-ons:</span>
                            {item.selected_customizations.map(opt => (
                              <div key={opt.id} className="flex justify-between">
                                <span>• {opt.name}</span>
                                <span>+INR {opt.price.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-stone-450 font-sans">Quantity:</span>
                          <div className="flex items-center border border-white/10 rounded overflow-hidden bg-white/5">
                            <button 
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="p-1.5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3.5 py-0.5 text-xs font-sans text-stone-200 select-none">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="p-1.5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Total & Action Footer */}
              {cart.length > 0 && (
                <div className="border-t border-white/5 px-6 py-6 space-y-4 bg-luxury-black">
                  <div className="flex justify-between items-center text-xs font-sans tracking-widest uppercase">
                    <span className="text-stone-400">Total Estimate:</span>
                    <span className="text-base font-bold text-gold">
                      INR {getCartTotal().toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full bg-gold text-luxury-black font-semibold py-3.5 text-[10px] tracking-[0.2em] uppercase hover:bg-gold-600 transition-colors duration-300 rounded-sm"
                  >
                    Proceed to Booking Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
