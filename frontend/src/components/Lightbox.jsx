import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from './OptimizedImage';

export const Lightbox = ({ images, currentIndex, onClose, onNavigate }) => {
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const activeImage = images[currentIndex];

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Handle Keyboard Arrows & Escape shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  if (!activeImage) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Lightbox Header Controls */}
      <div className="flex justify-between items-center w-full z-10 border-b border-white/5 pb-4">
        <div className="text-left font-sans text-[10px] tracking-[0.2em] text-stone-500 uppercase">
          {currentIndex + 1} / {images.length} — <span className="text-gold font-bold">{activeImage.category_name || 'Portfolio'}</span>
        </div>
        <button 
          onClick={onClose}
          className="text-stone-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10 border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Slider View */}
      <div className="relative flex-1 flex items-center justify-center max-h-[75vh] my-6">
        {/* Previous Button */}
        <button 
          onClick={handlePrev}
          className="absolute left-2 md:left-4 z-10 text-stone-400 hover:text-gold transition-all p-2.5 sm:p-3 bg-black/60 border border-white/5 hover:border-gold/30 rounded-full hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 h-6" />
        </button>

        {/* Selected Image Wrapper with layout animations */}
        <div className="relative max-w-full max-h-full p-2 md:p-4 bg-white/[0.01] border border-white/5 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden w-[90%] md:w-[70%] h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage.id || currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
            >
              <OptimizedImage 
                src={activeImage.imageUrl || activeImage.image_url} 
                alt={activeImage.title || 'Wedding moment'} 
                priority={true} // Load instantly in lightbox
                className="rounded-xl"
                imgClassName="max-w-full max-h-[55vh] object-contain rounded-xl pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          className="absolute right-2 md:right-4 z-10 text-stone-400 hover:text-gold transition-all p-2.5 sm:p-3 bg-black/60 border border-white/5 hover:border-gold/30 rounded-full hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 h-6" />
        </button>
      </div>

      {/* Image Info Footer */}
      <div className="w-full text-center max-w-xl mx-auto pb-4 space-y-3">
        <AnimatePresence mode="wait">
          {activeImage.title && (
            <motion.h3 
              key={`title-${currentIndex}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="font-serif text-xl tracking-wider text-white leading-tight font-semibold"
            >
              {activeImage.title}
            </motion.h3>
          )}
        </AnimatePresence>
        <span className="inline-block text-[9px] tracking-[0.2em] text-gold font-sans uppercase border border-gold/30 px-3 py-1 rounded-sm bg-gold/5 font-bold">
          {activeImage.category_name}
        </span>
      </div>
    </motion.div>
  );
};

export default Lightbox;
