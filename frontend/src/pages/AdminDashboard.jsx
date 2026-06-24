import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, Image, Sparkles, LogOut, ChevronRight, User, ShieldAlert, Loader2, ArrowUpRight } from 'lucide-react';

// Import management views
import AdminBookings from './AdminBookings';
import AdminGallery from './AdminGallery';
import AdminPackages from './AdminPackages';

export const AdminDashboard = () => {
  const { admin, token, logout, apiUrl } = useAuth();
  const navigate = useNavigate();

  // Active dashboard tab state: 'overview' | 'bookings' | 'gallery' | 'packages'
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Security check: Route unauthorized users back to login
  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.recentImages) {
          data.recentImages = data.recentImages.map(item => ({
            ...item,
            imageUrl: item.imageUrl || item.image || item.url || item.image_url || ''
          }));
        }
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to retrieve dashboard aggregation stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab, token, apiUrl]);

  if (!admin) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'overview', name: 'Overview', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'bookings', name: 'Bookings List', icon: <Calendar className="w-4 h-4" /> },
    { id: 'gallery', name: 'Gallery Catalog', icon: <Image className="w-4 h-4" /> },
    { id: 'packages', name: 'Pricing Packages', icon: <Package className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-luxury-bg flex flex-col md:flex-row pt-20 text-stone-700">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-luxury-black border-b md:border-b-0 md:border-r border-white/5 py-8 px-6 flex flex-col justify-between shrink-0 text-white font-sans">
        <div className="space-y-8">
          {/* User profile */}
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
            <div className="p-2.5 bg-gold/10 text-gold border border-gold/20 rounded-full shrink-0 shadow-inner">
              <User className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div className="text-left font-sans">
              <span className="text-[9px] text-stone-500 uppercase tracking-widest block font-bold">Active Session</span>
              <span className="font-serif text-xs font-semibold text-stone-200 tracking-wide block">{admin.username}</span>
            </div>
          </div>

          {/* Navigation link triggers */}
          <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-thin">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-[10px] tracking-widest uppercase font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-gold text-luxury-black shadow-md shadow-gold/20'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout bottom */}
        <button 
          onClick={handleLogout}
          className="hidden md:flex items-center justify-center gap-2 border border-white/5 hover:border-rose-500/30 text-stone-400 hover:text-rose-400 py-3 rounded-sm text-[10px] tracking-widest uppercase font-semibold transition-all mt-8 cursor-pointer bg-white/5"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-fade-in">
            {/* Overview Header */}
            <div className="text-left space-y-1 border-b border-stone-200 pb-4">
              <h1 className="text-3xl font-serif text-luxury-black uppercase tracking-wider font-bold">ADMIN OVERVIEW</h1>
              <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold font-sans">Real-time studio engagement logs</p>
            </div>

            {loading ? (
              <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Analyzing analytics...</span>
              </div>
            ) : (
              <>
                {/* 3 Metrics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Total Bookings */}
                  <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between aspect-[1.8/1] text-left">
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gold" />
                    <div className="flex justify-between items-start pl-2">
                      <span className="text-[9px] tracking-widest text-stone-500 uppercase font-semibold">Total Inquiries</span>
                      <Calendar className="w-5 h-5 text-gold opacity-80" />
                    </div>
                    <span className="text-4xl font-serif text-luxury-black block mt-2 font-bold pl-2">{stats?.totalBookings}</span>
                  </div>

                  {/* Total Packages */}
                  <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between aspect-[1.8/1] text-left">
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gold" />
                    <div className="flex justify-between items-start pl-2">
                      <span className="text-[9px] tracking-widest text-stone-500 uppercase font-semibold">Active Services</span>
                      <Package className="w-5 h-5 text-gold opacity-80" />
                    </div>
                    <span className="text-4xl font-serif text-luxury-black block mt-2 font-bold pl-2">{stats?.totalPackages}</span>
                  </div>

                  {/* Total Images */}
                  <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between aspect-[1.8/1] text-left">
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gold" />
                    <div className="flex justify-between items-start pl-2">
                      <span className="text-[9px] tracking-widest text-stone-500 uppercase font-semibold">Gallery Frames</span>
                      <Image className="w-5 h-5 text-gold opacity-80" />
                    </div>
                    <span className="text-4xl font-serif text-luxury-black block mt-2 font-bold pl-2">{stats?.totalImages}</span>
                  </div>
                </div>

                {/* Recent Items split lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  {/* Recent Bookings Panel */}
                  <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 text-left shadow-md">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                      <h3 className="font-serif text-base text-luxury-black tracking-wider uppercase font-bold">Recent Inquiries</h3>
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="text-gold text-[9px] tracking-widest uppercase font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        All Bookings <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!stats?.recentBookings || stats.recentBookings.length === 0 ? (
                      <p className="text-stone-400 text-xs font-light py-4">No bookings registered yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats?.recentBookings?.map((b) => (
                          <div key={b.id} className="flex justify-between items-center border-b border-stone-100 pb-2 text-xs font-sans">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-stone-800">{b.customer_name}</p>
                              <p className="text-[9px] text-stone-400 font-light">{new Date(b.event_date).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded-sm text-[8px] font-bold tracking-wider uppercase ${
                                b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                b.status === 'Cancelled' ? 'bg-rose-55/10 text-rose-500 border border-rose-100' :
                                'bg-gold/10 text-gold border border-gold/20'
                              }`}>
                                {b.status}
                              </span>
                              <p className="font-semibold text-stone-700">INR {parseFloat(b.total_price).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Image uploads Panel */}
                  <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 text-left shadow-md">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                      <h3 className="font-serif text-base text-luxury-black tracking-wider uppercase font-bold">Recent Uploads</h3>
                      <button 
                        onClick={() => setActiveTab('gallery')}
                        className="text-gold text-[9px] tracking-widest uppercase font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Open Gallery <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!stats?.recentImages || stats.recentImages.length === 0 ? (
                      <p className="text-stone-400 text-xs font-light py-4">No portfolio images uploaded yet.</p>
                    ) : (
                      <div className="grid grid-cols-5 gap-3">
                        {stats?.recentImages?.map((img) => (
                          <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-stone-200 group bg-luxury-bg" title={img.title || 'Portfolio'}>
                            <img 
                              src={img.imageUrl || "/placeholder.jpg"} 
                              alt="Recent upload" 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/placeholder.jpg";
                              }}
                            />
                            <div className="absolute inset-0 bg-luxury-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                              <span className="text-[8px] text-stone-300 leading-tight font-sans truncate block font-medium uppercase tracking-wider">{img.category_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Load Sub-Management components conditionally */}
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'gallery' && <AdminGallery />}
        {activeTab === 'packages' && <AdminPackages />}
      </main>
    </div>
  );
};

export default AdminDashboard;
