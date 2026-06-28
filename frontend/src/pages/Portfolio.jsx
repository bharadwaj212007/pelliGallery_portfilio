import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Lightbox from '../components/Lightbox';
import OptimizedImage from '../components/OptimizedImage';
import { Camera, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Masonry Skeleton Loader
const PortfolioSkeleton = () => (
  <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
    {[360, 480, 310, 420, 340, 400].map((height, i) => (
      <div 
        key={i} 
        style={{ height: `${height}px` }}
        className="break-inside-avoid mb-6 bg-white/50 backdrop-blur-md border border-stone-200/50 p-3 rounded-[20px] flex flex-col justify-between animate-pulse"
      >
        <div className="w-full h-[75%] bg-stone-200 rounded-[14px]" />
        <div className="space-y-2.5 p-2">
          <div className="w-1/4 h-3 bg-stone-200 rounded" />
          <div className="w-3/4 h-4 bg-stone-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const Portfolio = () => {
  const { apiUrl } = useAuth();
  
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Lightbox index control
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Load categories and images
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const catRes = await fetch(`${apiUrl}/gallery/categories`);
        const catData = await catRes.json();
        setCategories(catData);

        // Fetch gallery images
        const imgRes = await fetch(`${apiUrl}/gallery`);
        const imgData = await imgRes.json();
        const normalized = imgData.map(item => ({
          ...item,
          imageUrl: item.imageUrl || item.image || item.url || item.image_url || ''
        }));
        setImages(normalized);

      } catch (err) {
        console.error('Failed to load portfolio gallery assets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [apiUrl]);

  // Filter images list based on selected category slug
  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category_slug === selectedCategory);

  return (
    <div className="bg-luxury-bg min-h-screen pt-24 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <span className="text-xs tracking-[0.3em] text-gold uppercase font-bold block">
            PORTFOLIO ARCHIVES
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-luxury-black tracking-wide uppercase font-extrabold">
            CAPTURED MOMENTS
          </h1>
          <p className="text-xs md:text-sm text-stone-500 font-sans max-w-md mx-auto leading-relaxed font-light">
            A visual log of memories, grand details, and celebrations framed around Hyderabad by Pellipusthakam.
          </p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-2" />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 border-b border-stone-250/60 pb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border ${
              selectedCategory === 'all'
                ? 'bg-luxury-black border-luxury-black text-white shadow-md'
                : 'bg-white border-stone-200 text-stone-650 hover:text-luxury-black hover:border-stone-400'
            }`}
          >
            All Frames
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border ${
                selectedCategory === cat.slug
                  ? 'bg-luxury-black border-luxury-black text-white shadow-md'
                  : 'bg-white border-stone-200 text-stone-650 hover:text-luxury-black hover:border-stone-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dynamic Display Grid */}
        {loading ? (
          <PortfolioSkeleton />
        ) : filteredImages.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-stone-500 gap-4 border border-dashed border-stone-300 bg-white rounded-2xl p-8">
            <Camera className="w-8 h-8 text-stone-400" />
            <span className="text-[10px] uppercase tracking-widest font-bold font-sans">No moments captured in this category yet.</span>
          </div>
        ) : (
          /* Pinterest Masonry Grid with cascading entrance animations */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  key={img.id}
                  onClick={() => setLightboxIndex(index)}
                  className="break-inside-avoid mb-6 group relative cursor-pointer overflow-hidden rounded-[20px] border border-white/50 bg-white/70 backdrop-blur-md p-3 hover:border-gold/45 hover:shadow-2xl hover:shadow-gold/5 hover:-translate-y-1.5 transition-all duration-400 ease-out shadow-md"
                >
                  {/* Image container with aspect overlay */}
                  <div className="relative overflow-hidden rounded-[14px] bg-zinc-900">
                    <OptimizedImage 
                      src={img.imageUrl || img.image_url} 
                      alt={img.title || 'Wedding photography showcase'} 
                      priority={index < 3} // Preload the first few images
                      imgClassName="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Premium Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-luxury-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-6 text-left z-20">
                      <span className="text-[9px] tracking-widest font-bold font-sans text-gold uppercase border border-gold/40 px-2 py-0.5 rounded-sm self-start mb-2.5 bg-gold/10 backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        {img.category_name}
                      </span>
                      {img.title && (
                        <h3 className="font-serif text-base sm:text-lg text-white tracking-wide leading-tight mb-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out delay-75 font-semibold">
                          {img.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-stone-300 font-bold mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out delay-100">
                        <Eye className="w-3.5 h-3.5 text-gold" /> Zoom Moment
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Lightbox Trigger overlay */}
        {lightboxIndex !== null && (
          <Lightbox 
            images={filteredImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(index) => setLightboxIndex(index)}
          />
        )}
      </div>
    </div>
  );
};

export default Portfolio;
