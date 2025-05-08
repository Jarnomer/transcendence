import React from 'react';

import { createPortal } from 'react-dom';

import { motion } from 'framer-motion';

interface MenuBackgroundProps {
  mode: string;
}

export const MenuBackground: React.FC<MenuBackgroundProps> = () => {
  const appContainer = document.getElementById('app-main-container');

  if (!appContainer) return null;

  return createPortal(
    <motion.svg
      className="fixed w-full h-full z-0 opacity-30 pointer-events-none"
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [0, 5, 0, -5, 0],
        y: [0, 3, 0, -3, 0],
        filter: [
          'blur(1.5px) saturate(1.0)',
          'blur(2px) saturate(1.2)',
          'blur(2.5px) saturate(1.2)',
          'blur(2px) saturate(1.2)',
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <image
        href="./src/assets/svg/svg_background.svg"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      />
    </motion.svg>,
    appContainer
  );
};
