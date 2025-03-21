import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { PlayerQueue } from '../components/home/PlayersInQueue';
import { ProcessingBar } from '../components/visual/animations/ProcessingBar';

export const slideFromLeftVariants = {
  initial: {
    x: '-100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '-100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

export const glitchVariants = {
  initial: { opacity: 0, scale: 1.2, filter: 'blur(2px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(2px)',
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const slideFromRightVariants = {
  initial: {
    x: '100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

// Random character generator
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
    color: getRandomColor(),
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

const GlitchEffect: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [showGlitch, setShowGlitch] = useState(false);

  useEffect(() => {
    setShowGlitch(true);
    const timer = setTimeout(() => setShowGlitch(false), 1100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const newLines = Array.from({ length: 20 }, () => generateRandomText(60));
    setLines(newLines);
  }, []);

  return (
    <>
      {showGlitch ? (
        <>
          <div className="absolute z-0 right-[45px] top-[30px]">
            <ProcessingBar></ProcessingBar>
          </div>
          <motion.div
            className="absolute z-0 top-[100px] left-0 opacity-55 pointer-events-none p-4 text-primary font-mono text-sm space-y-1"
            variants={parentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {lines.map((line, lineIndex) => (
              <motion.div
                key={lineIndex}
                className="whitespace-pre"
                variants={lineVariants}
                custom={lineIndex}
              >
                {line.split('').map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    // custom={charIndex}
                    // variants={charVariants}
                    // style={{ display: 'inline-block' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </>
      ) : null}
    </>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('leaderboard');

  const handleCreateGameClick = () => {
    console.log('Create game clicked');
    navigate('/gameMenu', { state: { lobby: 'create' } });
  };

  const handleJoinGameClick = () => {
    console.log('Join game clicked');
    navigate('/game', { state: { mode: '1v1', difficulty: 'online', lobby: 'join' } });
  };
  return (
    <>
      <motion.div className="relative z-10 gap-5 md:gap-10 md:p-4">
        <GlitchEffect activeTab={activeTab} />

        <motion.div
          id="home-page-nav"
          className="flex m-2 relative overflow-hidden items-center justify-center font-heading text-2xl gap-3 md:text-4xl md:gap-6"
          layout
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <span className="relative p-2 px-3 flex gap-4">
            <div className="absolute w-[30px] h-[30px] top-0 left-0 border-t-1 border-l-1"></div>
            <div className="absolute w-[30px] h-[30px] bottom-0 right-0 border-b-1 border-r-1"></div>
            <button className="btn btn-primary" onClick={handleCreateGameClick}>
              create game
            </button>
            <button className="btn btn-primary" onClick={handleJoinGameClick}>
              Quick Join
            </button>
            <button onClick={() => setActiveTab('queue')}>
              <span
                className={`${activeTab === 'queue' ? 'brightness-125 shadow-2xl shadow-primary' : ''}`}
              >
                Open Games
              </span>
            </button>
            <button onClick={() => setActiveTab('leaderboard')}>
              <span
                className={`${activeTab === 'leaderboard' ? 'brightness-125 shadow-2xl shadow-primary' : ''}`}
              >
                Leaderboard
              </span>
            </button>
          </span>
        </motion.div>

        <motion.div id="home-page-content" className="flex h-full px-20  gap-20">
          <AnimatePresence mode="wait">
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                className="w-full"
                variants={slideFromLeftVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LeaderBoard />
              </motion.div>
            )}

            {activeTab === 'queue' && (
              <motion.div
                key="playerQueue"
                className="w-full"
                variants={slideFromRightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <PlayerQueue />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};
