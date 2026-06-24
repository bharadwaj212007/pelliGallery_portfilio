import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Loader2, CheckCircle2, ChevronRight, Sparkles, Plus, Check } from 'lucide-react';

export const Services = () => {
  const { addToCart } = useCart();
  const { apiUrl } = useAuth();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Customizations selected state per package: { [pkgId]: [selectedOptionObjects] }
  const [selectedCustoms, setSelectedCustoms] = useState({});

  // Toast feedback state
  const [toast, setToast] = useState(null);

  // Load active packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/packages`);
        const data = await res.json();
        setPackages(data);
      } catch (err) {
        console.error('Failed to retrieve photography packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [apiUrl]);

  // Toggle custom option select state for a package
  const handleToggleCustom = (pkgId, option) => {
    setSelectedCustoms(prev => {
      const current = prev[pkgId] || [];
      const exists = current.some(opt => opt.id === option.id);
      
      let updated;
      if (exists) {
        updated = current.filter(opt => opt.id !== option.id);
      } else {
        updated = [...current, option];
      }

      return {
        ...prev,
        [pkgId]: updated
      };
    });
  };

  const handleAddToCart = (pkg) => {
    const customs = selectedCustoms[pkg.id] || [];
    addToCart(pkg, customs);
    
    // Show feedback toast
    setToast({
      message: `"${pkg.name}" added to selections successfully.`,
      type: 'success'
    });

    // Reset customizations for this card after adding
    setSelectedCustoms(prev => ({
      ...prev,
      [pkg.id]: []
    }));
  };

  return (
    <div className="bg-luxury-bg min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs tracking-[0.3em] text-gold uppercase font-semibold block">
            INVESTMENT & PACKAGES
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-luxury-black tracking-wide uppercase">
            PHOTOGRAPHY SERVICES
          </h1>
          <p className="text-xs md:text-sm text-stone-500 font-sans max-w-md mx-auto leading-relaxed font-light">
            Handcrafted coverage options designed to document the rituals, emotions, and scale of your wedding celebrations.
          </p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-2" />
        </div>

        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Developing pricing catalog...</span>
          </div>
        ) : (
          /* Package Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {packages.map((pkg) => {
              const activeCustoms = selectedCustoms[pkg.id] || [];
              
              // Calculate dynamic totals for this card
              const basePrice = parseFloat(pkg.price);
              const customizationsSum = activeCustoms.reduce((sum, opt) => sum + parseFloat(opt.price || 0), 0);
              const totalEstimatedPrice = basePrice + customizationsSum;

              // Inclusions mapping
              const inclusions = Array.isArray(pkg.inclusions) 
                ? pkg.inclusions 
                : JSON.parse(pkg.inclusions || '[]');

              // Customizations mapping
              const customizations = Array.isArray(pkg.customization_options)
                ? pkg.customization_options
                : JSON.parse(pkg.customization_options || '[]');

              return (
                <div 
                  key={pkg.id}
                  className="bg-white border border-stone-200/80 rounded-xl p-6 md:p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl relative group hover:-translate-y-1.5 gold-sweep-border shadow-md"
                >
                  <div className="space-y-6 text-left">
                    {/* Card Title Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <h3 className="font-serif text-2xl text-luxury-black tracking-wide group-hover:text-gold transition-colors duration-300">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed font-sans font-light">
                          {pkg.description}
                        </p>
                      </div>
                      {/* Highlight icon for premier packages */}
                      {basePrice >= 200000 && (
                        <span className="bg-gold/10 text-gold border border-gold/20 p-2 rounded-full shadow-sm" title="Premier Selection">
                          <Sparkles className="w-4 h-4 animate-pulse-subtle" />
                        </span>
                      )}
                    </div>

                    {/* Pricing Display */}
                    <div className="border-y border-stone-100 py-4 flex justify-between items-center bg-luxury-bg/85 px-4 rounded-sm">
                      <div>
                        <span className="text-[9px] tracking-wider text-stone-500 uppercase block font-semibold">Investment Estimate</span>
                        <span className="text-xl font-bold text-luxury-black font-sans">
                          INR {totalEstimatedPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {customizationsSum > 0 && (
                        <div className="text-right">
                          <span className="text-[9px] text-stone-500 uppercase block font-semibold">Add-ons Selected</span>
                          <span className="text-xs text-gold font-semibold font-sans">
                            +INR {customizationsSum.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Inclusions list */}
                    <div className="space-y-3">
                      <h4 className="font-serif text-xs text-luxury-black tracking-wider uppercase font-semibold">Inclusions:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-655 font-light">
                        {inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Customization choices */}
                    {customizations.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="font-serif text-xs text-luxury-black tracking-wider uppercase font-semibold">Custom Add-on Options:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {customizations.map((opt) => {
                            const isSelected = activeCustoms.some(item => item.id === opt.id);
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleToggleCustom(pkg.id, opt)}
                                className={`flex justify-between items-center p-3 rounded-md border text-xs tracking-wide transition-all duration-300 font-medium ${
                                  isSelected 
                                    ? 'border-gold bg-gold/5 text-gold font-semibold' 
                                    : 'border-stone-200/80 bg-white text-stone-600 hover:text-luxury-black hover:border-stone-400'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected ? 'border-gold bg-gold text-luxury-black' : 'border-stone-300'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3.5]" />}
                                  </div>
                                  <span>{opt.name}</span>
                                </div>
                                <span className="text-[10px] font-sans text-stone-500 font-semibold">
                                  +INR {parseFloat(opt.price).toLocaleString('en-IN')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => handleAddToCart(pkg)}
                    className="w-full bg-luxury-black border border-luxury-black text-white hover:bg-gold hover:text-luxury-black font-semibold py-3.5 text-xs tracking-widest uppercase rounded-sm transition-all duration-300 mt-8 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:translate-y-[-1px]"
                  >
                    <Plus className="w-4 h-4 shrink-0" /> Select & Add Package
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Status Notification Toast */}
        {toast && (
          <Toast 
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Services;
