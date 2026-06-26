import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Loader2, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export const AdminPackages = () => {
  const { token, apiUrl } = useAuth();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form edit ID context
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // Inclusions builder state (array of strings)
  const [inclusions, setInclusions] = useState([]);
  const [newInclusion, setNewInclusion] = useState('');

  // Customizations/Add-ons builder state (array of { id, name, price })
  const [customs, setCustoms] = useState([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/packages`);
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [apiUrl]);

  // Inclusions additions/removals
  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      setInclusions(prev => [...prev, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const handleRemoveInclusion = (idx) => {
    setInclusions(prev => prev.filter((_, i) => i !== idx));
  };

  // Customizations additions/removals
  const handleAddCustom = () => {
    if (newCustomName.trim() && newCustomPrice.trim()) {
      const customId = `opt_${Date.now()}`;
      setCustoms(prev => [
        ...prev,
        { id: customId, name: newCustomName.trim(), price: parseFloat(newCustomPrice) }
      ]);
      setNewCustomName('');
      setNewCustomPrice('');
    }
  };

  const handleRemoveCustom = (idx) => {
    setCustoms(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEditInit = (pkg) => {
    setEditingId(pkg.id);
    setName(pkg.name);
    setDescription(pkg.description);
    setPrice(pkg.price);
    
    // Inclusions formatting
    const parsedInclusions = Array.isArray(pkg.inclusions) 
      ? pkg.inclusions 
      : JSON.parse(pkg.inclusions || '[]');
    setInclusions(parsedInclusions);

    // Customizations formatting
    const parsedCustoms = Array.isArray(pkg.customization_options)
      ? pkg.customization_options
      : JSON.parse(pkg.customization_options || '[]');
    setCustoms(parsedCustoms);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setInclusions([]);
    setNewInclusion('');
    setCustoms([]);
    setNewCustomName('');
    setNewCustomPrice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !price || inclusions.length === 0) {
      setToast({ message: 'Please provide name, description, pricing and at least one inclusion.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        inclusions,
        customization_options: customs
      };

      const url = editingId ? `${apiUrl}/packages/${editingId}` : `${apiUrl}/packages`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save package.');
      }

      setToast({
        message: editingId ? 'Package updated successfully!' : 'New Package created successfully!',
        type: 'success'
      });

      resetForm();
      fetchPackages();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package from catalog listings?')) return;

    try {
      const response = await fetch(`${apiUrl}/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete package.');
      }

      setToast({ message: 'Package deleted successfully.', type: 'success' });
      setPackages(prev => prev.filter(p => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-8 text-left animate-fade-in font-sans text-stone-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-luxury-black uppercase tracking-wider font-bold">Packages Manager</h1>
        <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold font-sans">Manage portfolio package details and features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form setup */}
        <form 
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 p-6 rounded-xl space-y-5 shadow-md text-xs text-stone-700"
        >
          <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-2 uppercase tracking-wide font-bold">
            {editingId ? 'Edit Package Details' : 'Create Package'}
          </h2>
          
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Package Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Traditional Wedding"
              className="w-full bg-luxury-bg border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none shadow-inner animate-fade-in"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide compelling details of this photography package..."
              className="w-full bg-luxury-bg border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none resize-none shadow-inner"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Base Price (INR)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full bg-luxury-bg border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none shadow-inner"
            />
          </div>

          {/* Inclusions tag builder */}
          <div className="space-y-2 border-t border-stone-150 pt-3">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Inclusions Builder</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                placeholder="e.g. 1 Lead Photographer"
                className="flex-1 bg-luxury-bg border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none shadow-inner"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="bg-white border border-stone-250 hover:border-gold hover:text-gold px-4 py-2.5 rounded text-xs transition-colors cursor-pointer font-semibold uppercase tracking-wider"
              >
                Add
              </button>
            </div>
            {/* List tags */}
            {inclusions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {inclusions.map((inc, i) => (
                  <span key={i} className="bg-stone-50 border border-stone-200 text-stone-700 px-2 py-1 rounded-sm text-[10px] flex items-center gap-1">
                    {inc}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveInclusion(i)} 
                      className="text-stone-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Custom options add-ons builder */}
          <div className="space-y-2 border-t border-stone-150 pt-3">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Custom Add-on Options</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                placeholder="Add-on (e.g. Drone)"
                className="flex-1 bg-luxury-bg border border-stone-200 rounded px-2.5 py-2.5 text-[11px] text-stone-850 focus:border-gold focus:outline-none shadow-inner"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="number" 
                  value={newCustomPrice}
                  onChange={(e) => setNewCustomPrice(e.target.value)}
                  placeholder="Price (INR)"
                  className="flex-1 sm:w-24 bg-luxury-bg border border-stone-200 rounded px-2.5 py-2.5 text-[11px] text-stone-850 focus:border-gold focus:outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="bg-white border border-stone-250 hover:border-gold hover:text-gold px-4 py-2.5 rounded text-xs transition-colors cursor-pointer font-semibold uppercase tracking-wider whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>
            {/* List options */}
            {customs.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {customs.map((opt, i) => (
                  <div key={i} className="flex justify-between items-center bg-stone-50 border border-stone-200 p-2.5 rounded text-[10px]">
                    <span className="text-stone-750 font-medium">{opt.name} (+INR {parseFloat(opt.price).toLocaleString('en-IN')})</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCustom(i)} 
                      className="text-stone-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-stone-150 pt-4">
            <button 
              type="submit"
              disabled={submitting}
              className="flex-grow bg-luxury-black text-white font-semibold py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-luxury-black transition-colors rounded shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Details'
              )}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={resetForm}
                className="bg-white border border-stone-250 hover:border-stone-450 hover:text-stone-850 text-stone-500 px-4 py-3 rounded text-xs tracking-widest uppercase transition-all cursor-pointer font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Packages List catalog */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-2 uppercase tracking-wide font-bold">Packages Catalog</h2>

          {loading ? (
            <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
              <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Scanning services...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="h-64 flex flex-col justify-center items-center text-stone-400 gap-3 border border-dashed border-stone-200 bg-luxury-bg rounded-lg">
              <AlertCircle className="w-8 h-8 text-stone-300" />
              <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">No pricing packages configured.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-luxury-bg border border-stone-200/85 p-5 rounded-lg flex flex-col justify-between text-left space-y-4 shadow-sm hover:border-gold/30 hover:shadow-md transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-base text-luxury-black tracking-wide font-semibold">{pkg.name}</h3>
                      <span className="text-xs font-bold text-gold">INR {parseFloat(pkg.price).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-light">{pkg.description}</p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-end gap-2 border-t border-stone-200/60 pt-3">
                    <button
                      onClick={() => handleEditInit(pkg)}
                      className="p-2 bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 hover:border-gold rounded transition-all flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold cursor-pointer"
                      title="Edit Package"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gold" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 bg-white hover:bg-rose-50 text-stone-650 border border-stone-200 hover:border-rose-350 hover:text-rose-600 rounded transition-all flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

export default AdminPackages;
