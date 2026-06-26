import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { ShieldAlert, User, Lock, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const { admin, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setToast({ message: 'Please enter both username and password.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await login(form.username.trim(), form.password.trim());
      
      if (res.success) {
        setToast({ message: 'Welcome back, Administrator!', type: 'success' });
        navigate('/admin/dashboard');
      } else {
        throw new Error(res.error || 'Invalid username or password.');
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-24 sm:pt-40 pb-24 flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white border border-stone-200 p-8 rounded-xl shadow-xl relative text-left">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gold" />
        
        {/* Header Icon */}
        <div className="flex flex-col items-center space-y-3.5 mb-8 text-center">
          <div className="p-3.5 bg-gold/10 text-gold border border-gold/20 rounded-full shadow-sm">
            <ShieldAlert className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-luxury-black uppercase tracking-widest font-bold">Studio Entrance</h1>
            <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold mt-1">Authorized Access Only</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold" /> Username
            </label>
            <input 
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. admin"
              className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-4 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gold" /> Password
            </label>
            <input 
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full bg-luxury-bg border border-stone-200 rounded-sm px-4 py-3 text-xs text-stone-800 focus:border-gold focus:outline-none transition-colors shadow-inner"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-luxury-black text-white font-semibold py-3.5 text-[10px] tracking-widest uppercase hover:bg-gold hover:text-luxury-black transition-colors rounded-sm shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>
      </div>

      {/* Toast */}
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

export default AdminLogin;
