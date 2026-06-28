import React, { useState, useEffect, useRef } from 'react';

const defaultFallback = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackSrc = defaultFallback,
  priority = false, // If true, skip Intersection Observer and load immediately
  ...props
}) => {
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  
  const containerRef = useRef(null);

  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '150px', // Start loading 150px before entering viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setError(true);
      setLoaded(true); // Stop skeleton if even fallback fails
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full bg-zinc-900/40 select-none ${className}`}
      {...props}
    >
      {/* Skeleton Shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] z-10">
          <div className="w-full h-full backdrop-blur-sm bg-black/10" />
        </div>
      )}

      {/* Actual Image */}
      {shouldLoad && !error && (
        <img
          src={currentSrc || src}
          alt={alt || 'PelliGallery photography'}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}

      {/* Backup SVG fallback representation if even the fallback URL fails */}
      {error && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-white/5 text-stone-500 p-4">
          <svg
            className="w-8 h-8 text-gold/60 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[9px] uppercase tracking-widest text-center text-stone-550">
            Image Unavailable
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
