import React from 'react';

import { motion } from 'framer-motion';

import { ClippedButton } from '../UI/buttons/ClippedButton';
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
  const handleSaveSettings = () => {
    console.log('---- Saving User settings -------');
  };

  return (
    <motion.div
      className="h-full min-h-[450px] relative glass-box mt-10 text-sm"
      variants={animationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 bg-primary text-black w-full pointer-events-none"
      >
        <h1>User settings</h1>
      </span>
      <div className="w-full h-full relative overflow-hidden">
        <BackgroundGlow></BackgroundGlow>
        <div className="w-full h-full p-10">
          <div>
            <button>Delete user ?</button>
          </div>
          <div>
            <button>Blocked users ?</button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 p-4">
        <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
      </div>
    </motion.div>
  );
};
