import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useGameOptionsContext, useNavigationAccess } from '@contexts';

import { GameMenuCard } from '@components/layout';
import { NavIconButton } from '@components/UI';

import { useSound, useValidateSession } from '@hooks';

interface GameMenuOption {
  content: string;
  imageUrl: string;
  hoverInfo: string;
  onClick: () => void;
}

const pageVariants = {
  initial: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0% 0 0% 0)',
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  exit: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeInOut' },
    delay: 0.4,
  },
};

export const GameMenu: React.FC = () => {
  // const [selectedMode, setSelectedMode] = useState<string | null>(null);
  //const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null); // Track the selected difficulty
  // const [readyForNextEffect, setReadyForNextEffect] = useState(false);

  const navigate = useNavigate(); // Hook to navigate to different routes
  const { setMode, setDifficulty, setLobby, difficulty, mode } = useGameOptionsContext();
  const { allowInternalNavigation } = useNavigationAccess();

  const playSubmitSound = useSound('/sounds/effects/button_submit.wav');
  const playGoBackSound = useSound('/sounds/effects/button_go_back.wav');

  const modes = [
    {
      content: 'SinglePlayer',
      imageUrl: './src/assets/images/ai_3.png',
      hoverInfo: 'Play against an AI opponent',
      onClick: () => handleModeClick('singleplayer'),
    },
    {
      content: '1v1',
      imageUrl: './src/assets/images/1v1_bw.png',
      hoverInfo: 'Play with another player',
      onClick: () => handleModeClick('1v1'),
    },
    {
      content: 'Tournament',
      imageUrl: './src/assets/images/trophy_bw.png',
      hoverInfo: 'Compete in a tournament',
      onClick: () => handleModeClick('tournament'),
    },
  ];

  const subMenus: { [key: string]: GameMenuOption[] } = {
    singleplayer: [
      {
        content: 'Easy',
        imageUrl: './src/assets/images/ai_easy.png',
        hoverInfo: 'Easy level',
        onClick: () => handleDifficultyClick('easy'),
      },
      {
        content: 'Normal',
        imageUrl: './src/assets/images/ai.png',
        hoverInfo: 'Normal level',
        onClick: () => handleDifficultyClick('normal'),
      },
      {
        content: 'Brutal',
        imageUrl: './src/assets/images/ai_hard.png',
        hoverInfo: 'Brutal level',
        onClick: () => handleDifficultyClick('brutal'),
      },
    ],
    '1v1': [
      {
        content: 'Local',
        imageUrl: './src/assets/images/local_match_5.png',
        hoverInfo: 'Play with a local player',
        onClick: () => handleDifficultyClick('local'),
      },
      {
        content: 'Online',
        imageUrl: './src/assets/images/online_match_4.png',
        hoverInfo: 'Play with an online player',
        onClick: () => handleDifficultyClick('online'),
      },
    ],
    tournament: [
      {
        content: '8',
        imageUrl: './src/assets/images/leaderboard.png',
        hoverInfo: 'local tournament',
        onClick: () => handleDifficultyClick('4'),
      },
      {
        content: '16',
        imageUrl: './src/assets/images/leaderboard.png',
        hoverInfo: 'online tournament',
        onClick: () => handleDifficultyClick('16'),
      },
    ],
  };

  const handleModeClick = (mode: string | null) => {
    if (mode === null) playGoBackSound();
    playSubmitSound();
    setMode(mode);
  };

  const handleDifficultyClick = (difficulty: string | null) => {
    playSubmitSound();
    setDifficulty(difficulty);
    console.log('set Difficulty');
  };

  useEffect(() => {
    setLobby('create');
  }, []);

  const isNewGame = useValidateSession(); // Call the useValidateSession hook to validate the session

  // Effect that only runs after state is reset
  useEffect(() => {
    if (!isNewGame) return;
    console.log('game menu useEffect: ', mode, difficulty);
    if (mode === 'tournament') {
      allowInternalNavigation();
      navigate('/tournament');
    } else if (mode && difficulty) {
      allowInternalNavigation();
      if (mode === '1v1' && difficulty === 'online') {
        setLobby('random');
        setMode('1v1');
        setDifficulty('online');
        navigate('/game');
      } else {
        console.log('Game options:', mode, difficulty);
        navigate('/tournamentLobby');
      }
    }
  }, [isNewGame, mode, difficulty]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode && !difficulty ? `${mode}-submenu` : 'main-menu'}
        id="game-menu-container"
        className="flex relative grow flex-wrap w-full h-full justify-center gap-4 items-center p-0"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {mode && !difficulty ? (
          <>
            <NavIconButton
              ariaLabel="Go back"
              id="arrow-left"
              icon="arrowLeft"
              onClick={() => handleModeClick(null)}
            />

            {subMenus[mode].map((option, index) => (
              <motion.div key={index} style={{ flexBasis: '250px' }}>
                <GameMenuCard
                  content={option.content}
                  imageUrl={option.imageUrl}
                  hoverInfo={option.hoverInfo}
                  onClick={option.onClick}
                />
              </motion.div>
            ))}
          </>
        ) : (
          <>
            {modes.map((mode, index) => (
              <motion.div key={index} style={{ flexBasis: '250px' }}>
                <GameMenuCard
                  content={mode.content}
                  imageUrl={mode.imageUrl}
                  hoverInfo={mode.hoverInfo}
                  onClick={mode.onClick}
                />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
