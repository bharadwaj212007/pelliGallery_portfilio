import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Lightbox from '../components/Lightbox';
import { Loader2, Camera, Eye } from 'lucide-react';

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
          <span className="text-xs tracking-[0.3em] text-gold uppercase font-semibold block">
            PORTFOLIO ARCHIVES
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-luxury-black tracking-wide uppercase">
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
            className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-luxury-black text-white shadow-md shadow-black/10 border border-luxury-black'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-luxury-black hover:border-stone-400'
            }`}
          >
            All Frames
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${
                selectedCategory === cat.slug
                  ? 'bg-luxury-black text-white shadow-md shadow-black/10 border border-luxury-black'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-luxury-black hover:border-stone-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading state indicator */}
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Developing portfolio...</span>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-4 border border-dashed border-stone-300 bg-white rounded-lg p-8">
            <Camera className="w-8 h-8 text-stone-400" />
            <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">No moments captured in this category yet.</span>
          </div>
        ) : (
          /* Pinterest Masonry Grid using CSS columns */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 animate-fade-in">
            {filteredImages.map((img, index) => (
              <div 
                key={img.id}
                onClick={() => setLightboxIndex(index)}
                className="break-inside-avoid mb-6 group relative cursor-pointer overflow-hidden rounded-lg border border-stone-200/60 bg-white p-2 hover:border-gold/40 hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-md">
                  <img 
                    src={img.imageUrl || "/placeholder.jpg"} 
                    alt={img.title || 'Wedding photography showcase'} 
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-luxury-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                    <span className="text-[9px] tracking-widest font-semibold font-sans text-gold uppercase border border-gold/40 px-2 py-0.5 rounded-sm self-start mb-3 bg-gold/10">
                      {img.category_name}
                    </span>
                    {img.title && (
                      <h3 className="font-serif text-lg text-white tracking-wide leading-tight mb-2">
                        {img.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-300 font-semibold mt-1">
                      <Eye className="w-3.5 h-3.5 text-gold" /> Zoom Moment
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
