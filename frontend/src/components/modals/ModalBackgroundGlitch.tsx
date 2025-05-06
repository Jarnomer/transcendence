import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { CircleSvg, WarningSign } from '@components/visual';

const generateRandomText = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}<>?';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

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

const parentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const ModalBackgroundGlitchTextBlock: React.FC<{}> = () => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const newLines = Array.from({ length: 20 }, () => generateRandomText(60));
    setLines(newLines);
  }, []);

  return (
    <>
      <motion.div
        className="w-full h-full z-0 left-0 opacity-55 pointer-events-none p-4 text-gray-500 font-mono text-[6px] sm:text-sm space-y-1"
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

export const ModalBackgroundGlitch: React.FC<{ duration: number }> = ({ duration }) => {
  const [showGlitch, setShowGlitch] = useState(false);

  useEffect(() => {
    setShowGlitch(true);

    const glitchTimer = setTimeout(() => {
      setShowGlitch(false);
    }, duration);

    return () => {
      clearTimeout(glitchTimer);
    };
  }, [showGlitch, duration]);

  return (
    <>
      {showGlitch ? (
        <motion.div className="w-full h-full absolute">
          <motion.div className="relative">
            <WarningSign></WarningSign>
          </motion.div>
          <div className="relative w-full ">
            <div className="absolute opacity-35 z-0 top-0 right-[0px] translate-x-[-50%] text-primary">
              <CircleSvg />
            </div>
          </div>
          <div className="absolute top-38 left-0">
            <ModalBackgroundGlitchTextBlock></ModalBackgroundGlitchTextBlock>
          </div>
          <div className="absolute top-4 right-4  text-primary"></div>
        </motion.div>
      ) : null}
    </>
  );
};
