import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { 
  Calendar, 
  Mail, 
  MapPin, 
  MessageSquare, 
  User, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  Phone, 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  Sparkle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Checkout = () => {
  const { cart, getCartTotal, clearCart, removeFromCart, updateQuantity } = useCart();
  const { apiUrl } = useAuth();
  const navigate = useNavigate();

  // Wizard steps: 1 = Cart Page, 2 = Booking Details Form
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    event_date: '',
    event_location: '',
    event_type: 'Wedding',
    special_requirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [successData, setSuccessData] = useState(null); // Holds details after success

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!form.customer_name.trim()) tempErrors.customer_name = 'Full name is required.';
    
    if (!form.customer_email.trim()) {
      tempErrors.customer_email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.customer_email)) {
      tempErrors.customer_email = 'Please provide a valid email address.';
    }

    if (!form.customer_phone.trim()) {
      tempErrors.customer_phone = 'Phone number is required.';
    } else if (!/^[0-9+\s-]{8,15}$/.test(form.customer_phone.trim())) {
      tempErrors.customer_phone = 'Please provide a valid phone number.';
    }

    if (!form.event_date) {
      tempErrors.event_date = 'Event date is required.';
    } else {
      const selectedDate = new Date(form.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const year = selectedDate.getFullYear();
      if (selectedDate < today) {
        tempErrors.event_date = 'Event date must be in the future.';
      } else if (year < 2020 || year > 2099) {
        tempErrors.event_date = 'Please provide a valid year (2020-2099).';
      }
    }

    if (!form.event_location.trim()) tempErrors.event_location = 'Event location is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setToast({ message: 'Your shopping cart is empty.', type: 'error' });
      return;
    }

    if (!validate()) {
      setToast({ message: 'Please fix validation errors before submitting.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      // Pack phone and event type into special_requirements so backend saves them safely
      const combinedRequirements = `[Phone: ${form.customer_phone.trim()}] [Event Type: ${form.event_type}] ${form.special_requirements.trim()}`;

      const payload = {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        event_date: form.event_date,
        event_location: form.event_location.trim(),
        special_requirements: combinedRequirements,
        items: cart.map(item => ({
          package_id: item.package_id,
          quantity: item.quantity,
          selected_customizations: item.selected_customizations
        }))
      };

      const response = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit booking inquiry.');
      }

      // Record success state
      setSuccessData({
        booking: resData.booking,
        total: getCartTotal(),
        items: [...cart]
      });

      // Clear Cart
      clearCart();
      
      setToast({
        message: 'Inquiry submitted! We will email details shortly.',
        type: 'success'
      });
    } catch (err) {
      console.error('Checkout failed:', err.message);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VIEW 1: SUCCESS VIEW (Step 3)
  // ============================================
  if (successData) {
    return (
      <div className="bg-luxury-bg min-h-screen pt-36 pb-24 flex items-center justify-center">
        <div className="max-w-3xl w-full px-6 text-center space-y-8 animate-fade-in">
          <div className="bg-white border border-stone-200/80 p-8 md:p-12 rounded-xl space-y-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gold" />
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mb-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-serif text-luxury-black tracking-wide uppercase">
                INQUIRY REGISTERED!
              </h1>
              <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold font-sans">
                Thank you for choosing Pellipusthakam Photography
              </p>
            </div>

            <p className="text-stone-500 leading-relaxed max-w-md mx-auto text-xs md:text-sm font-light">
              We have successfully registered your inquiry. A confirmation receipt has been emailed to <strong className="text-luxury-black font-semibold">{successData.booking.customer_email}</strong>. Our booking manager will connect with you within 24 hours to schedule a consultation.
            </p>

            {/* Booking Summary Card */}
            <div className="w-full bg-luxury-bg rounded-lg border border-stone-200 p-6 text-left space-y-5 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <h3 className="font-serif text-base text-luxury-black tracking-wider uppercase font-semibold">Booking Reference #{successData.booking.id}</h3>
                <span className="bg-gold/10 text-gold border border-gold/30 px-2.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider">Pending Approval</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-stone-400 uppercase block font-semibold text-[9px] tracking-wider">Client Details</span>
                  <p className="text-stone-800 font-medium text-sm">{successData.booking.customer_name}</p>
                  <p className="text-stone-500 font-light">{successData.booking.customer_email}</p>
                  <p className="text-stone-500 font-light">Ph: {form.customer_phone}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-stone-400 uppercase block font-semibold text-[9px] tracking-wider">Schedule & Spot</span>
                  <p className="text-stone-800 font-medium text-sm">
                    {new Date(successData.booking.event_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-stone-500 font-light">{successData.booking.event_location}</p>
                  <p className="text-gold font-semibold uppercase text-[10px] tracking-wider pt-0.5">{form.event_type} Shoot</p>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 space-y-2.5">
                <span className="text-stone-400 uppercase block font-semibold text-[9px] tracking-wider">Selected Packages</span>
                {successData.items.map(item => (
                  <div key={item.cartItemId} className="flex justify-between text-stone-750">
                    <span className="font-medium">{item.name} <span className="text-stone-400 font-light text-[10px]">x{item.quantity}</span></span>
                    <span className="font-semibold text-stone-800">
                      INR {((item.base_price + item.selected_customizations.reduce((sum,o)=>sum+o.price, 0))*item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm font-bold text-gold border-t border-stone-200 pt-3">
                  <span>ESTIMATED INVESTMENT TOTAL:</span>
                  <span className="text-base text-luxury-black font-extrabold">INR {successData.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center">
              <Link 
                to="/" 
                className="bg-luxury-black text-white px-8 py-3.5 rounded-sm text-[10px] tracking-widest font-semibold uppercase hover:bg-gold hover:text-luxury-black transition-all shadow-md flex items-center justify-center gap-2"
              >
                Back to Home
              </Link>
              <Link 
                to="/portfolio" 
                className="border border-stone-200 text-stone-700 bg-white hover:border-gold hover:text-gold px-8 py-3.5 rounded-sm text-[10px] tracking-widest font-semibold uppercase transition-all flex items-center justify-center gap-2"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW 2: CART PAGE (Step 1)
  // ============================================
  if (step === 1) {
    return (
      <div className="bg-luxury-bg min-h-screen pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          {/* Header */}
          <div className="text-left space-y-3">
            <span className="text-xs tracking-[0.3em] text-gold uppercase font-semibold block">
              YOUR SELECTED PACKAGES
            </span>
            <h1 className="text-3xl md:text-5xl font-serif text-luxury-black tracking-wide uppercase">
              SHOPPING CART
            </h1>
            <div className="w-16 h-0.5 bg-gold mt-2" />
          </div>

          {cart.length === 0 ? (
            <div className="bg-white border border-stone-200/80 p-16 rounded-xl text-center space-y-6 shadow-md max-w-xl mx-auto">
              <div className="w-16 h-16 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-xl text-luxury-black uppercase tracking-wider">Your cart is empty</h2>
              <p className="text-xs text-stone-550 leading-relaxed font-light">
                Browse our premium photography packages to select services for your special day.
              </p>
              <Link 
                to="/services" 
                className="inline-block bg-luxury-black text-white px-8 py-3.5 rounded-sm text-[10px] tracking-widest font-semibold uppercase hover:bg-gold hover:text-luxury-black transition-all shadow-md font-sans"
              >
                Browse Packages
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const customsSum = item.selected_customizations.reduce((sum, o) => sum + o.price, 0);
                  const subTotal = (item.base_price + customsSum) * item.quantity;
                  return (
                    <div 
                      key={item.cartItemId} 
                      className="bg-white border border-stone-200/80 p-6 rounded-xl flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center shadow-sm relative group"
                    >
                      <div className="flex-1 text-left space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-serif text-lg text-luxury-black tracking-wide font-semibold">{item.name}</h3>
                            <p className="text-xs text-gold font-semibold mt-1">
                              INR {item.base_price.toLocaleString('en-IN')} (Base)
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="sm:hidden text-stone-400 hover:text-rose-500 transition-colors p-1"
                            title="Remove Selection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Custom Options Display */}
                        {item.selected_customizations.length > 0 && (
                          <div className="bg-luxury-bg/80 rounded p-2.5 text-[10px] text-stone-500 space-y-1 font-sans border border-stone-100/60 max-w-md">
                            <span className="font-bold text-[9px] uppercase text-stone-400 block mb-1">Selected Add-ons:</span>
                            {item.selected_customizations.map(opt => (
                              <div key={opt.id} className="flex justify-between">
                                <span className="font-medium">• {opt.name}</span>
                                <span>+INR {opt.price.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Summary block */}
                      <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                        {/* Qty Controls */}
                        <div className="flex items-center border border-stone-200 rounded-sm bg-white shadow-sm overflow-hidden h-9">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="px-2.5 h-full hover:bg-stone-50 text-stone-500 hover:text-luxury-black transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3.5 text-xs font-semibold font-sans text-stone-850 select-none">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="px-2.5 h-full hover:bg-stone-50 text-stone-500 hover:text-luxury-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right min-w-[120px]">
                          <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Subtotal</span>
                          <span className="text-sm font-bold text-luxury-black font-sans">
                            INR {subTotal.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Remove Desktop */}
                        <button 
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="hidden sm:block text-stone-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full"
                          title="Remove Selection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary side card */}
              <div className="bg-white border border-stone-200/80 p-6 rounded-xl space-y-6 shadow-md text-left font-sans">
                <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-3 uppercase tracking-wide font-bold">Order Summary</h2>
                
                <div className="space-y-3.5 text-xs text-stone-600 font-light">
                  <div className="flex justify-between">
                    <span>Package Count:</span>
                    <span>{cart.reduce((s,o)=>s+o.quantity, 0)} items</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>GST / Base Tax:</span>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-luxury-black border-t border-stone-150 pt-4">
                    <span className="tracking-wider uppercase">Estimated Total:</span>
                    <span className="text-lg font-bold text-gold font-sans">INR {getCartTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-luxury-black text-white hover:bg-gold hover:text-luxury-black font-semibold py-3.5 text-[10px] tracking-[0.25em] uppercase hover:bg-gold transition-colors duration-300 rounded-sm shadow-md flex items-center justify-center gap-1.5"
                >
                  Proceed to Booking <ChevronRight className="w-4 h-4" />
                </button>

                <div className="bg-luxury-bg p-3.5 rounded text-[10px] text-stone-500 leading-relaxed border border-stone-200/60 font-light">
                  <span className="font-semibold text-stone-600 uppercase tracking-wide block mb-1">Pricing Notice:</span>
                  The subtotal shown represents standard coverage rates. Travel expenses, specific location fees, and customized terms will be verified during consultation.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW 3: WIZARD FORM VIEW (Step 2)
  // ============================================
  return (
    <div className="bg-luxury-bg min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header */}
        <div className="text-left space-y-3">
          <button 
            onClick={() => setStep(1)}
            className="text-stone-500 hover:text-gold transition-colors text-xs tracking-widest uppercase flex items-center gap-1.5 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <h1 className="text-3xl md:text-5xl font-serif text-luxury-black tracking-wide uppercase">
            SECURE BOOKING REQUEST
          </h1>
          <div className="w-16 h-0.5 bg-gold mt-2" />
        </div>

        {/* Progress wizard bar */}
        <div className="max-w-xl mx-auto bg-white border border-stone-200 p-3 sm:p-4 rounded-full shadow-sm flex justify-between items-center text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-stone-400 px-3 sm:px-10 gap-1 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 text-stone-500">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-stone-100 flex items-center justify-center text-[8px] sm:text-[9px]">1</span>
            <span>Cart</span>
          </div>
          <div className="w-4 sm:w-8 h-px bg-stone-200" />
          <div className="flex items-center gap-1 sm:gap-2 text-gold font-bold">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gold/10 text-gold flex items-center justify-center text-[8px] sm:text-[9px] border border-gold/30">2</span>
            <span>Details</span>
          </div>
          <div className="w-4 sm:w-8 h-px bg-stone-200" />
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-stone-100 flex items-center justify-center text-[8px] sm:text-[9px]">3</span>
            <span>
              <span className="hidden sm:inline">Confirmation</span>
              <span className="sm:hidden">Confirm</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Checkout Form */}
          <form 
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white border border-stone-200/80 p-6 md:p-8 rounded-xl space-y-8 shadow-md text-left font-sans"
          >
            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-2.5 uppercase tracking-wider font-semibold flex items-center gap-2">
                <span className="text-xs bg-luxury-black text-white w-5 h-5 rounded-full flex items-center justify-center font-sans font-bold">1</span> Client Identification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. Diviti Bharadwaj"
                    className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-3.5 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors shadow-inner"
                  />
                  {errors.customer_name && <p className="text-[9px] text-rose-500 font-semibold">{errors.customer_name}</p>}
                </div>

                {/* Customer Email */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleChange}
                    placeholder="e.g. name@domain.com"
                    className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-3.5 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors shadow-inner"
                  />
                  {errors.customer_email && <p className="text-[9px] text-rose-500 font-semibold">{errors.customer_email}</p>}
                </div>

                {/* Customer Phone */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold" /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-3.5 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors shadow-inner"
                  />
                  {errors.customer_phone && <p className="text-[9px] text-rose-500 font-semibold">{errors.customer_phone}</p>}
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-2.5 uppercase tracking-wider font-semibold flex items-center gap-2">
                <span className="text-xs bg-luxury-black text-white w-5 h-5 rounded-full flex items-center justify-center font-sans font-bold">2</span> Event Particulars
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Event Date */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold" /> Event Date
                  </label>
                  <input 
                    type="date" 
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                    className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-3.5 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors shadow-inner"
                  />
                  {errors.event_date && <p className="text-[9px] text-rose-500 font-semibold">{errors.event_date}</p>}
                </div>

                {/* Event Location */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" /> Location (Hyderabad)
                  </label>
                  <input 
                    type="text" 
                    name="event_location"
                    value={form.event_location}
                    onChange={handleChange}
                    placeholder="e.g. Taj Falaknuma Palace"
                    className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-3.5 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors shadow-inner"
                  />
                  {errors.event_location && <p className="text-[9px] text-rose-500 font-semibold">{errors.event_location}</p>}
                </div>

                {/* Event Type selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" /> Event Type
                  </label>
                  <select 
                    name="event_type"
                    value={form.event_type}
                    onChange={handleChange}
                    className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-3.5 py-3.5 text-xs text-stone-850 focus:border-gold focus:outline-none transition-colors shadow-inner"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Pre Wedding">Pre Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Reception">Reception</option>
                    <option value="Haldi">Haldi</option>
                    <option value="Candid">Candid</option>
                    <option value="Other">Other Event</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-2.5 uppercase tracking-wider font-semibold flex items-center gap-2">
                <span className="text-xs bg-luxury-black text-white w-5 h-5 rounded-full flex items-center justify-center font-sans font-bold">3</span> Special Requirements
              </h2>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gold" /> Theme desires, schedules, notes
                </label>
                <textarea 
                  name="special_requirements"
                  value={form.special_requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about your wedding vibes, color palettes, lighting expectations, or custom layout desires..."
                  className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-4 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Submit block */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-black text-white hover:bg-gold hover:text-luxury-black font-semibold py-4 text-xs tracking-widest uppercase hover:bg-gold transition-colors duration-300 rounded shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Processing Booking...
                </>
              ) : (
                <>
                  Submit Booking Inquiry
                </>
              )}
            </button>
          </form>

          {/* Selections Summary side panel */}
          <div className="bg-white border border-stone-200/80 p-6 rounded-xl space-y-6 shadow-md text-left font-sans">
            <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-3 uppercase tracking-wide font-bold">Summary</h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {cart.map(item => {
                const customsSum = item.selected_customizations.reduce((sum,o)=>sum+o.price, 0);
                const subTotal = (item.base_price + customsSum) * item.quantity;
                return (
                  <div key={item.cartItemId} className="border-b border-stone-100 pb-3 space-y-1 text-xs">
                    <div className="flex justify-between text-stone-850 font-medium">
                      <span>{item.name}</span>
                      <span className="font-semibold">INR {subTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 block">Qty: {item.quantity} | Base: INR {item.base_price.toLocaleString('en-IN')}</span>
                    {item.selected_customizations.length > 0 && (
                      <div className="text-[9px] text-stone-500 pl-2 border-l border-gold/40 space-y-0.5">
                        {item.selected_customizations.map(opt => (
                          <div key={opt.id} className="flex justify-between text-stone-400">
                            <span>• {opt.name}</span>
                            <span>+INR {opt.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 text-xs text-stone-600 font-light">
              <div className="flex justify-between font-medium">
                <span>Total Items Count:</span>
                <span>{cart.reduce((s,o)=>s+o.quantity, 0)} packages</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-luxury-black border-t border-stone-100 pt-4 font-sans">
                <span className="tracking-wider uppercase">Grand Total:</span>
                <span className="text-base text-gold font-extrabold font-sans">INR {getCartTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="bg-luxury-bg p-3.5 rounded text-[10px] text-stone-500 leading-relaxed border border-stone-200/60 font-light">
              <span className="font-semibold text-stone-600 uppercase tracking-wide block mb-1">Contract Disclaimer:</span>
              Rates are estimates based on standard portfolios. Travel/outstation logging arrangements, site permissions, and booking terms are reviewed in the client consultation.
            </div>
          </div>

        </div>
      </div>

      {/* Toast popup */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Checkout;
