import React from 'react';

import { motion } from 'framer-motion';

export const pageVariants = {
  initial: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0% 0 0% 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  exit: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
    delay: 0.4,
  },
};

export const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      id="page-wrapper"
      className="w-full h-full p-0 md:p-10"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="w-full max-w-screen-xl mx-auto h-full flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
};

export default PageWrapper;
