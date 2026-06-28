import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IntroLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('logo'); // logo -> shutter -> flash -> text -> complete
  
  useEffect(() => {
    // 1. Progress bar timer
    const duration = 2800; // Total loading time: 2.8s
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    // 2. Phase sequencing
    // 0ms to 900ms: Logo stroke draw
    // 900ms: Camera Shutter Close
    // 1200ms: Flash Effect
    // 1450ms: Text animations reveal
    // 2800ms: Transition complete

    const shutterTimeout = setTimeout(() => setPhase('shutter'), 950);
    const flashTimeout = setTimeout(() => setPhase('flash'), 1250);
    const textTimeout = setTimeout(() => setPhase('text'), 1450);
    const doneTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration + 300);

    return () => {
      clearInterval(timer);
      clearTimeout(shutterTimeout);
      clearTimeout(flashTimeout);
      clearTimeout(textTimeout);
      clearTimeout(doneTimeout);
    };
  }, [onComplete]);

  // SVG Shutter blade animation variants
  const bladeVariants = (angle) => ({
    closed: {
      rotate: angle,
      scale: 1,
      transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
    },
    open: {
      rotate: angle + 45,
      scale: 0,
      transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
    }
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      }}
    >
      {/* 1. Logo Drawing & Shutter Phase */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <AnimatePresence>
          {phase === 'logo' && (
            <motion.div
              key="camera-outline"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute flex items-center justify-center"
            >
              {/* Premium Camera SVG with golden path drawing */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                className="text-gold"
              >
                <motion.path
                  d="M15 35 C 15 30, 20 25, 25 25 L 40 25 L 45 18 L 55 18 L 60 25 L 75 25 C 80 25, 85 30, 85 35 L 85 75 C 85 80, 80 85, 75 85 L 25 85 C 20 85, 15 80, 15 75 Z"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="50"
                  cy="55"
                  r="18"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.7, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="72"
                  cy="37"
                  r="3"
                  fill="#D4AF37"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                />
              </svg>
            </motion.div>
          )}

          {phase === 'shutter' && (
            <motion.div
              key="shutter-blades"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute w-28 h-28 rounded-full border border-gold/40 flex items-center justify-center overflow-hidden bg-zinc-950"
            >
              {/* Shutter Blades Rotating and Closing */}
              <div className="relative w-full h-full">
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                      transformOrigin: '50% 50%',
                    }}
                    variants={bladeVariants(angle)}
                    initial="open"
                    animate="closed"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-gold/80 stroke-zinc-950 stroke-[0.5px]">
                      <path d="M50 50 L100 20 L100 50 Z" />
                    </svg>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. White Camera Flash effect overlay */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>

      {/* 3. Text animations reveal */}
      <div className="mt-8 text-center h-20 flex flex-col justify-center">
        {phase === 'text' && (
          <div className="space-y-2">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-3xl sm:text-4xl text-white tracking-[0.2em] uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-gold"
            >
              PelliGallery
            </motion.h1>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.7 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-stone-300 font-light"
            >
              Capture Every Moment
            </motion.p>
          </div>
        )}
      </div>

      {/* 4. Luxury Progress Bar */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-zinc-900 overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-400 to-gold"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
};

export default IntroLoader;
