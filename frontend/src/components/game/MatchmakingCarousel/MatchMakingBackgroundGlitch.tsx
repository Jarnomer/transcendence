import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { CircleSvg } from '../../visual/svg/shapes/CircleSvg';
import { ModalBackgroundGlitchTextBlock } from './ModalBackgroundGlitchTextBlock'; // Import your text block component

const generateRandomText = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}<>?';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Flickering color variants
const colors = ['#ea355a', '#f13c7a', '#f24c8c', '#f85b99', '#fc6dbb'];

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

export const ModalBackgroundGlitchTextBlock: React.FC<{ shiftRight: boolean }> = ({
  shiftRight,
}) => {
  const [lines, setLines] = useState<string[]>([]);
  const [textFinished, setTextFinished] = useState(false);

  useEffect(() => {
    // Randomly generate the lines and reset when glitch occurs
    const newLines = Array.from({ length: 20 }, () => generateRandomText(60));
    setLines(newLines);

    // Mark the text as finished after typing animation duration
    const timer = setTimeout(() => {
      setTextFinished(true);
    }, 800); // Approximately the time for all lines to "type"

    return () => clearTimeout(timer);
  }, [shiftRight]); // Triggered on mount

  if (textFinished) return;

  const numberOfLines = 20;
  const lineDelay = 0.05; // Delay between lines
  const staggerDuration = 0.03; // Stagger duration
  const lineDuration = 0.3; // Animation duration for each line

  const lastLineDelay = (numberOfLines - 1) * lineDelay; // Delay for the last line
  const totalAnimationTime = lastLineDelay + lineDuration + staggerDuration * numberOfLines;

  console.log('Total Animation Time:', totalAnimationTime);

  return (
    <motion.div
      className={`w-full h-full z-0 left-0 opacity-55 pointer-events-none p-4 text-gray-500 font-mono text-[6px] sm:text-sm space-y-1 `}
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
  );
};

const duration = 3000;

export const MatchMakingBackgroundGlitch: React.FC = () => {
  const [showLeft, setShowLeft] = useState(false);
  const [shiftRight, setShiftRight] = useState<boolean>(false);
  const [textFinished, setTextFinished] = useState(false);
  const [key, setKey] = useState(0); // Key for forcing remount

  useEffect(() => {
    // Function to trigger the glitch
    const triggerGlitch = () => {
      setShowLeft(true);

      // Randomly select direction (left or right)
      const randomDirection = Math.random() < 0.5; // 50% chance for left or right
      setShiftRight(randomDirection); // Set random direction

      // Start shifting text (toggle left/right)
      const shiftTimer = setTimeout(() => {
        setShiftRight((prev) => !prev); // Toggle shift direction
        setTimeout(() => {
          setShowLeft(false); // End shifting after a short duration
        }, 500); // Short duration for shifting
      }, duration); // Duration before starting the shift

      // Trigger remount of the text block by changing the key
      setKey((prevKey) => prevKey + 1);

      // End the glitch effect
      const glitchTimer = setTimeout(() => {
        // You could add any additional glitch reset behavior here if needed
      }, duration + 500); // Keep the glitch visible a bit longer

      // Cleanup the timers
      return () => {
        clearTimeout(glitchTimer);
        clearTimeout(shiftTimer);
      };
    };

    // Start the infinite loop
    const interval = setInterval(triggerGlitch, duration * 2); // Loop every 2 * duration (adjust timing as needed)
    triggerGlitch(); // Trigger the glitch initially

    return () => {
      clearInterval(interval); // Cleanup the interval when component unmounts
    };
  }, []);

  return (
    <>
      <motion.div className="w-full h-full absolute top-0 left-0">
        <motion.div className="relative z-10">
          <motion.div
            animate={{
              opacity: [0, 1, 0], // Keyframes to flip opacity between 0 and 1
            }}
            transition={{
              duration: 1, // Duration of one full cycle (fade in and out)
              repeat: Infinity, // Repeat the animation infinitely
              repeatType: 'reverse', // Reverse the animation to alternate back and forth
              ease: 'easeInOut', // Optional easing function for smoother transitions
            }}
          >
            searching..
          </motion.div>
        </motion.div>
        <div className="relative w-full ">
          <div className="absolute opacity-35 z-0 top-0 right-[0px] translate-x-[-50%] text-primary">
            <CircleSvg />
          </div>
        </div>
        {shiftRight ||
          (showLeft && (
            <div
              className={`absolute top-38 ${shiftRight ? 'right-0' : 'left-0'}`} // Conditionally move left or right
            >
              <ModalBackgroundGlitchTextBlock key={key} shiftRight={shiftRight} />{' '}
              {/* Force remount by changing the key */}
            </div>
          ))}
      </motion.div>
    </>
  );
};
