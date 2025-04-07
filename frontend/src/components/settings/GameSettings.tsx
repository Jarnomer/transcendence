import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { SvgBorderBig } from '@components/visual/svg/borders/SvgBorderBig';

import { setRetroEffectLevel } from '../game';
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

const RetroEffectSettings: React.FC = () => {
  const [level, setLevel] = useState(2); // Default level
  const [isEnabled, setIsEnabled] = useState(true); // Checkbox state
  const baseValue = 5;
  const effectValue = isEnabled ? setRetroEffectLevel(level, baseValue) : 0;
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Retro Effect</h2>

      {/* Checkbox to Enable/Disable Effect */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="enableEffect"
          checked={isEnabled}
          onChange={() => setIsEnabled(!isEnabled)}
          className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
        />
        <label htmlFor="enableEffect" className="ml-2 cursor-pointer">
          Retro Effect
        </label>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        id="effectLevel"
        min="0"
        max="5"
        step="1"
        value={level}
        onChange={(e) => setLevel(parseInt(e.target.value))}
        disabled={!isEnabled}
        className={`w-full appearance-none h-2 rounded-lg cursor-pointer ${
          isEnabled ? 'bg-gray-700' : 'bg-gray-500 opacity-50 cursor-not-allowed'
        }`}
      />
      <label htmlFor="effectLevel" className="block text-sm font-medium text-gray-700">
        <span className="font-semibold">{isEnabled ? level : 'Disabled'}</span>
      </label>

      {/* Display Values */}
      <div className="mt-4 text-center">
        <p className="text-sm"></p>
      </div>
    </div>
  );
};

export const GameSettings: React.FC = () => {
  return (
    <>
      <motion.div
        className="h-full min-h-[450px] relative glass-box mt-10 text-sm"
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 translate-y-[-50%] w-full pointer-events-none"
        >
          <SvgBorderBig></SvgBorderBig>
        </span>
        <div className="w-full h-full relative overflow-hidden">
          <BackgroundGlow></BackgroundGlow>
          <div className="w-full h-full p-10">
            <h1 className="font-heading text-4xl">Game Settings</h1>

            {/* Retro effect controls */}
            <RetroEffectSettings></RetroEffectSettings>
          </div>
        </div>
      </motion.div>
    </>
  );
};
