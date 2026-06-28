import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition = ({ children }) => {
  const transitionVariants = {
    initial: {
      opacity: 0,
      y: 15,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1] // Custom premium cubic easing
      }
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };

  return (
    <motion.div
      variants={transitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
