import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { ProcessingBar } from '@components/visual/animations/ProcessingBar';

import { BackgroundGlitchTextBlock } from '../visual/BackgroundGlitch';
import { WarningSign } from '../visual/svg/shapes/WarningSign';

export const HomePageBackgroundGlitch: React.FC<{ activeTab: string; duration: number }> = ({
  activeTab,
  duration,
}) => {
  const [showGlitch, setShowGlitch] = useState(false);
  const [shiftRight, setShiftRight] = useState(false);
  const [showLeft, setShowLeft] = useState(false);

  useEffect(() => {
    setShowGlitch(true);
    setShowLeft(true);
    const shiftTimer = setTimeout(() => {
      setShiftRight(true);
      setTimeout(() => {
        setShowLeft(false);
      }, 500);
    }, duration); // ← customize delay as you like

    const glitchTimer = setTimeout(() => {
      setShowGlitch(false);
      setShiftRight(false);
    }, duration);

    return () => {
      clearTimeout(glitchTimer);
      clearTimeout(shiftTimer);
    };
  }, [activeTab]);

  return (
    <>
      {showGlitch ? (
        <motion.div className="w-full h-full absolute">
          <motion.div className="relative">
            <WarningSign></WarningSign>
          </motion.div>
          <div className="relative w-full h-full">
            <div className="absolute z-0 right-[0px] translate-x-[100%] text-primary">
              <ProcessingBar duration={activeTab === 'tabWithBoxes' ? duration * 3 : duration} />
            </div>
          </div>
          <BackgroundGlitchTextBlock></BackgroundGlitchTextBlock>
        </motion.div>
      ) : null}
    </>
  );
};
