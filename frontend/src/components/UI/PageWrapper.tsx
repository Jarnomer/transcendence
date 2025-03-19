import React, { useState } from 'react';

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
  const [isExiting, setIsExiting] = useState(false);

  const handleExitComplete = () => {

    setIsExiting(true);
  };

  const parentVariants = {
    initial: pageVariants.initial,
    animate: pageVariants.animate,
    exit: pageVariants.exit,
  };

  return (
    <motion.div
      className="w-full h-full flex-grow"
      variants={parentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onAnimationComplete={() => {
        if (!isExiting) {
          // If there are no exit animations, skip waiting
          return;
        }
        handleExitComplete(); // Handle child exit animation completion
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onAnimationComplete: () => {
              handleExitComplete(); // Ensure exit animation of child is tracked
            },
          });
        }
        return child;
      })}
    </motion.div>
  );
};

export default PageWrapper;
