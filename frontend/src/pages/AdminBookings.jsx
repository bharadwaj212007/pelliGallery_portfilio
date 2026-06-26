import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import {
  Loader2,
  Search,
  Filter,
  Eye,
  X,
  Calendar,
  MapPin,
  Mail,
  MessageSquare,
  AlertCircle,
  User
} from 'lucide-react';

export const AdminBookings = () => {
  const { token, apiUrl } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter controls state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Selected booking detail modal context
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [toast, setToast] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append('search', search.trim());
      if (status) queryParams.append('status', status);

      const res = await fetch(`${apiUrl}/bookings?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      const mapped = data.map(b => ({
        ...b,
        id: b._id || b.id
      }));
      setBookings(mapped);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [status, token, apiUrl]); // Trigger fetch on status dropdown filter changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking status.');
      }

      setToast({
        message: `Booking status updated to ${newStatus}.`,
        type: 'success'
      });

      // Update locally
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }

      // Refresh list from backend database
      await fetchBookings();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-8 text-left animate-fade-in font-sans text-stone-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-luxury-black uppercase tracking-wider font-bold">Bookings & Inquiries</h1>
        <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold font-sans">Review, filter, and confirm photography inquiries</p>
      </div>

      {/* Query Filter Controls Bar */}
      <div className="bg-white border border-stone-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-stretch justify-between shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or event spot..."
              className="w-full bg-luxury-bg border border-stone-200 rounded pl-10 pr-4 py-2.5 text-xs text-stone-800 focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-luxury-black text-white hover:bg-gold hover:text-luxury-black px-6 py-2.5 rounded text-xs font-semibold tracking-widest uppercase transition-colors shadow-sm cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-stone-200 rounded px-4 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none shadow-sm font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table catalog */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Retrieving inquiries...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-stone-400 gap-3 border border-dashed border-stone-200 rounded-xl bg-luxury-bg">
            <AlertCircle className="w-8 h-8 text-stone-300" />
            <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">No bookings found matching filters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs text-stone-600">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-widest text-[9px] pb-3">
                  <th className="pb-3 w-12">ID</th>
                  <th className="pb-3 pl-2">Customer Details</th>
                  <th className="pb-3 w-28">Event Date</th>
                  <th className="pb-3 w-32 text-center">Estimation</th>
                  <th className="pb-3 w-32 text-center">Status</th>
                  <th className="pb-3 w-16 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                    {/* Booking ID */}
                    <td className="py-4 font-bold text-stone-400 font-sans">#{b.id}</td>

                    {/* Customer Info */}
                    <td className="py-4 pl-2 space-y-1">
                      <p className="font-semibold text-stone-850">{b.customer_name}</p>
                      <p className="text-[10px] text-stone-500 font-light font-sans">{b.customer_email}</p>
                    </td>

                    {/* Event Date */}
                    <td className="py-4 text-stone-700 font-medium">
                      {new Date(b.event_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Total Price */}
                    <td className="py-4 text-center font-bold text-luxury-black font-sans">
                      INR {parseFloat(b.total_price).toLocaleString('en-IN')}
                    </td>

                    {/* Status selection trigger */}
                    <td className="py-4 text-center">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className={`text-[9px] font-bold tracking-widest uppercase border rounded-[3px] px-3 py-1 focus:outline-none bg-white cursor-pointer ${
                          b.status === 'Confirmed' ? 'border-emerald-200 text-emerald-600' :
                          b.status === 'Cancelled' ? 'border-rose-200 text-rose-500' :
                          'border-gold/30 text-gold bg-gold/5'
                        }`}
                      >
                        <option value="Pending" className="text-gold">Pending</option>
                        <option value="Confirmed" className="text-emerald-600">Confirmed</option>
                        <option value="Cancelled" className="text-rose-500">Cancelled</option>
                      </select>
                    </td>

                    {/* View Details modal launch */}
                    <td className="py-4 text-center">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-2 bg-luxury-bg hover:bg-gold/10 text-stone-500 hover:text-gold border border-stone-200 hover:border-gold/30 rounded transition-all cursor-pointer shadow-sm hover:scale-105"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Dialog Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 md:p-10 animate-fade-in">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-luxury-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedBooking(null)}
          />

          {/* Modal box */}
          <div className="w-full max-w-xl bg-white border border-stone-200 flex flex-col text-stone-700 shadow-2xl rounded-xl relative overflow-hidden text-left p-6 md:p-8 animate-slide-up my-auto">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gold" />

            {/* Header */}
            <div className="flex justify-between items-center border-b border-stone-150 pb-4 mb-4">
              <h3 className="font-serif text-lg text-luxury-black tracking-wider uppercase font-bold">Inquiry Details — #{selectedBooking.id}</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-stone-400 hover:text-luxury-black transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content info */}
            <div className="space-y-5 flex-1 overflow-y-auto max-h-[70vh] font-sans text-xs">

              {/* Contact info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-luxury-bg/85 p-4 rounded-lg border border-stone-200">
                <div className="space-y-2">
                  <span className="text-[9px] text-stone-400 uppercase block font-semibold tracking-wider">Client Name</span>
                  <div className="flex items-center gap-1.5 text-stone-850 font-semibold">
                    <User className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{selectedBooking.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500 font-light pt-0.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <a href={`mailto:${selectedBooking.customer_email}`} className="hover:text-gold transition-colors">{selectedBooking.customer_email}</a>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-stone-400 uppercase block font-semibold tracking-wider">Event Particulars</span>
                  <div className="flex items-center gap-1.5 text-stone-850 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{new Date(selectedBooking.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500 font-light pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{selectedBooking.event_location}</span>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {selectedBooking.special_requirements && (
                <div className="space-y-1.5">
                  <span className="text-[9px] text-stone-400 uppercase block font-semibold tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gold" /> Custom client Requests
                  </span>
                  <p className="bg-luxury-bg/50 border border-stone-200 p-3.5 rounded-lg text-stone-600 italic leading-relaxed font-light">
                    "{selectedBooking.special_requirements}"
                  </p>
                </div>
              )}

              {/* Selections packages */}
              <div className="space-y-2.5">
                <span className="text-[9px] text-stone-400 uppercase block font-semibold tracking-wider">Photography Selections</span>
                <div className="space-y-3">
                  {selectedBooking.items?.map((item, idx) => (
                    <div key={idx} className="bg-white border border-stone-200 p-4 rounded-lg text-xs shadow-sm">
                      <div className="flex justify-between text-stone-800">
                        <span className="font-semibold text-stone-850">{item.package_name}</span>
                        <span className="font-bold">INR {parseFloat(item.package_price).toLocaleString('en-IN')} (x{item.quantity})</span>
                      </div>

                      {item.selected_customizations?.length > 0 && (
                        <div className="border-t border-stone-100 mt-2.5 pt-2 text-[10px] text-stone-500 space-y-0.5 font-sans">
                          <span className="font-bold text-[9px] uppercase text-stone-400 block mb-1">Add-ons Selected:</span>
                          {item.selected_customizations.map((opt, i) => (
                            <div key={i} className="flex justify-between text-stone-500">
                              <span>• {opt.name}</span>
                              <span>+INR {parseFloat(opt.price).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Status bar */}
              <div className="border-t border-stone-150 pt-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] text-stone-400 uppercase block font-semibold tracking-wider">Booking Status</span>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
                    className={`text-[9px] font-bold tracking-widest uppercase border rounded-[3px] px-3 py-1 mt-1 focus:outline-none bg-white cursor-pointer ${
                      selectedBooking.status === 'Confirmed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50/20' :
                      selectedBooking.status === 'Cancelled' ? 'border-rose-200 text-rose-500 bg-rose-50/20' :
                      'border-gold/30 text-gold bg-gold/5'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-stone-400 uppercase block font-semibold text-right tracking-wider">Investment Total</span>
                  <span className="text-xl font-bold text-gold">
                    INR {parseFloat(selectedBooking.total_price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

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

export default AdminBookings;
