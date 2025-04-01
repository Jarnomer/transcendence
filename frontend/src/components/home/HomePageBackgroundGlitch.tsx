import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { ProcessingBar } from '@components/visual/animations/ProcessingBar';

import { BackgroundGlitchTextBlock } from '../visual/BackgroundGlitch';
import { WarningSign } from '../visual/svg/shapes/WarningSign';

const generateRandomText = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}<>?';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Flickering color variants
const colors = ['#ea355a', '#f13c7a', '#f24c8c', '#f85b99', '#fc6dbb'];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const lineVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
    },
  }),
};

const charVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    color: 'white',
    transition: {
      duration: 0.02,
      delay: i * 0.015,
    },
  }),
};

const parentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const HomePageBackgroundGlitch: React.FC<{ activeTab: string; duration: number }> = ({
  activeTab,
  duration,
}) => {
  const [lines, setLines] = useState<string[]>([]);
  const [showGlitch, setShowGlitch] = useState(false);
  const [shiftRight, setShiftRight] = useState(false);
  const [showLeft, setShowLeft] = useState(false);

  useEffect(() => {
    setShowGlitch(true);
    setShowLeft(true);
    // Trigger shift after a short delay (e.g., 2s)
    const shiftTimer = setTimeout(() => {
      setShiftRight(true);
      setTimeout(() => {
        setShowLeft(false);
      }, 500);
    }, duration); // ← customize delay as you like

    if (activeTab === 'tabWithBoxes') {
      duration = duration * 3;
    }

    const glitchTimer = setTimeout(() => {
      setShowGlitch(false);
      setShiftRight(false);
    }, duration);

    return () => {
      clearTimeout(glitchTimer);
      clearTimeout(shiftTimer);
    };
  }, [activeTab]);

  useEffect(() => {
    const newLines = Array.from({ length: 20 }, () => generateRandomText(60));
    setLines(newLines);
  }, []);

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
