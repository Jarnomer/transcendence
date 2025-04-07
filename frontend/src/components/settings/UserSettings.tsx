import React from 'react';

import { motion } from 'framer-motion';

import { SvgBorderBig } from '@components/visual/svg/borders/SvgBorderBig';

import { BackgroundGlow } from '../visual/BackgroundGlow';

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.5 },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

export const UserSettings: React.FC = () => {
  const handleColorChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const selectedColor = event.currentTarget.getAttribute('data-color');
    if (selectedColor) {
      document.documentElement.style.setProperty('--color-primary', selectedColor);
    }
  };
  return (
    <motion.div
      className="h-full min-h-[450px] relative glass-box mt-10 text-sm"
      variants={animationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <span className="absolute top-0 left-0 translate-y-[-50%] w-full" aria-hidden="true">
        <SvgBorderBig></SvgBorderBig>
      </span>
      <div className="w-full h-full relative overflow-hidden">
        <BackgroundGlow></BackgroundGlow>
        <div className="w-full h-full p-10">
          <h1 className="font-heading text-4xl">User Settings</h1>

          <h2>Color scheme</h2>
          <div id="colorPickerContainer" className="mt-3 gap-0">
            <button
              className="color-option border-black border-2 w-8 h-8 mx-0"
              aria-label="Switch theme to light blue"
              data-color="#76f7fd"
              style={{ backgroundColor: '#76f7fd' }}
              onClick={handleColorChange}
            ></button>
            <button
              className="color-option border-black border-2 w-8 h-8 mx-0"
              aria-label="Switch theme to yellow"
              data-color="#d6ec6f"
              style={{ backgroundColor: '#d6ec6f' }}
              onClick={handleColorChange}
            ></button>
            <button
              className="color-option border-black border-2 w-8 h-8 mx-0"
              data-color="#61d27e"
              aria-label="Switch theme to green"
              style={{ backgroundColor: '#61d27e' }}
              onClick={handleColorChange}
            ></button>
            <button
              className="color-option border-black border-2 w-8 h-8 mx-0"
              data-color="#ea355a"
              aria-label="Switch theme to red"
              style={{ backgroundColor: '#ea355a' }}
              onClick={handleColorChange}
            ></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
