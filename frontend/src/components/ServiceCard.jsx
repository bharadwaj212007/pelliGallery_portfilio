import React from 'react';
import { Check, Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import OptimizedImage from './OptimizedImage';

export const ServiceCard = React.memo(({
  pkg,
  coverImage,
  basePrice,
  totalEstimatedPrice,
  customsSum,
  inclusions,
  customizations,
  activeCustoms,
  onToggleCustom,
  onAddToCart,
  onOpenInfo
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-zinc-900/60 backdrop-blur-md border border-white/5 hover:border-gold/30 rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5 relative group hover:-translate-y-2"
    >
      {/* Image Header wrapper */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[20px] bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
        <OptimizedImage 
          src={coverImage} 
          alt={pkg.name} 
          imgClassName="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        
        {/* Floating Price Badge */}
        <div className="absolute top-4 right-4 z-20 bg-zinc-950/90 backdrop-blur-md border border-gold/40 text-gold px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider font-sans shadow-lg">
          Start: ₹{basePrice.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Content block */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4 text-left">
          {/* Title */}
          <h3 className="font-serif text-2xl text-white tracking-wide group-hover:text-gold transition-colors duration-300 font-bold">
            {pkg.name}
          </h3>
          
          {/* Short Description */}
          <p className="text-xs text-stone-400 leading-relaxed font-sans font-light">
            {pkg.description}
          </p>

          {/* Inclusions features list */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] tracking-wider text-stone-500 uppercase font-bold block">Key Features</span>
            <ul className="grid grid-cols-1 gap-1.5 text-xs text-stone-300 font-light font-sans">
              {inclusions.slice(0, 5).map((inc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Customization Options Checkboxes */}
          {customizations.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] tracking-wider text-stone-500 uppercase font-bold block">Configure Add-ons</span>
              <div className="flex flex-col gap-1.5">
                {customizations.map((opt) => {
                  const isSelected = activeCustoms.some(item => item.id === opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onToggleCustom(pkg.id, opt)}
                      className={`flex justify-between items-center p-2 rounded-lg border text-[11px] transition-all duration-300 font-medium ${
                        isSelected 
                          ? 'border-gold bg-gold/5 text-gold' 
                          : 'border-white/5 bg-zinc-950/40 text-stone-450 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-gold bg-gold text-zinc-950' : 'border-stone-700'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                        </div>
                        <span className="font-sans font-light">{opt.name}</span>
                      </div>
                      <span className="font-sans font-bold">+₹{parseFloat(opt.price).toLocaleString('en-IN')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Investment Estimate Display */}
        <div className="border-t border-white/5 pt-4 space-y-4">
          <div className="flex justify-between items-center bg-zinc-950/60 p-3.5 rounded-xl border border-white/5">
            <div className="text-left">
              <span className="text-[9px] tracking-wider text-stone-500 uppercase block font-bold">Total Estimate</span>
              <span className="text-base font-bold text-white font-sans">
                ₹{totalEstimatedPrice.toLocaleString('en-IN')}
              </span>
            </div>
            {customsSum > 0 && (
              <span className="text-[10px] text-gold font-bold font-sans">
                +₹{customsSum.toLocaleString('en-IN')} Add-ons
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={() => onAddToCart(pkg)}
              className="flex-1 bg-gold hover:bg-gold-600 text-zinc-950 font-bold py-3 text-xs tracking-widest uppercase transition-colors rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Book Now
            </button>
            <button
              onClick={() => onOpenInfo(pkg)}
              className="border border-white/10 hover:border-white/30 text-stone-300 hover:text-white bg-white/5 px-4.5 py-3 rounded-lg text-xs transition-colors"
              title="View all features"
            >
              <Info className="w-4 h-4 text-gold" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ServiceCard.displayName = 'ServiceCard';
export default ServiceCard;
