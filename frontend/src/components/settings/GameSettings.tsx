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

export const GameSettings: React.FC = () => {
  const [level, setLevel] = useState(2); // Default level
  const baseValue = 100; // Example base value (adjust as needed)
  const effectValue = setRetroEffectLevel(level, baseValue);
  return (
    <>
      <motion.div
        className="h-full min-h-[450px] relative glass-box mt-10 text-sm"
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <span className="absolute top-0 left-0 translate-y-[-50%] w-full">
          <SvgBorderBig></SvgBorderBig>
        </span>
        <div className="w-full h-full relative overflow-hidden">
          <BackgroundGlow></BackgroundGlow>
          <div className="w-full h-full p-10">
            <h1 className="font-heading text-4xl">Game Settings</h1>

            <div className="p-6 max-w-md mx-auto bg-gray-900 text-white rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Retro Effect Level</h2>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full cursor-pointer appearance-none bg-gray-700 rounded-lg h-2"
              />

              {/* Display Values */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-300">
                  Level: <span className="font-semibold">{level}</span>
                </p>
                <p className="text-sm text-gray-300">
                  Effect Value: <span className="font-semibold">{effectValue.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
