import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { motion } from 'framer-motion';

import { ProcessingBar } from './animations/ProcessingBar';
import { WarningSign } from './svg/shapes/WarningSign';

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

export const BackgroundGlitchTextBlock: React.FC<{}> = () => {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const newLines = Array.from({ length: 20 }, () => generateRandomText(60));
    setLines(newLines);
  }, []);
  
  return (
    <>
      <motion.div
        className="absolute w-full h-full z-0 top-[100px] left-0 opacity-55 pointer-events-none p-4 text-gray-500 font-mono text-[6px] sm:text-sm space-y-1"
        variants={parentVariants}
        initial="hidden"
        animate={'visible'}
        exit="hidden"
      >
        <motion.div className="w-full-full">
          {lines.map((line, lineIndex) => (
            <motion.div
              key={lineIndex}
              className="whitespace-pre text-[6px] sm:text-xs"
              variants={lineVariants}
              custom={lineIndex}
            >
              {line.split('').map((char, charIndex) => (
                <motion.span key={charIndex}>{char}</motion.span>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
};

export const BackgroundGlitch: React.FC<{ duration: number }> = ({ duration }) => {
  const [showGlitch, setShowGlitch] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setShowGlitch(true);
    const glitchTimer = setTimeout(() => {
      setShowGlitch(false);
    }, duration);
    return () => {
      clearTimeout(glitchTimer);
    };
  }, [location]);

  return (
    <div className="absolute h-full w-full ">
      {showGlitch ? (
        <motion.div className="relative w-full h-full">
          <motion.div className="absolute">
            <WarningSign></WarningSign>
          </motion.div>
          <motion.div className="absolute right-0 translate-x-[-50%] text-primary">
            <ProcessingBar duration={duration} />
          </motion.div>
          <BackgroundGlitchTextBlock></BackgroundGlitchTextBlock>
        </motion.div>
      ) : null}
    </div>
  );
};
