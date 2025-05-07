import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useGameOptionsContext, useModal, useNavigationAccess } from '@contexts';

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
  const { setMode, setDifficulty, setLobby, difficulty, mode, lobby } = useGameOptionsContext();
  const { allowInternalNavigation } = useNavigationAccess();
  const { isModalOpen } = useModal();

  const playSubmitSound = useSound('/sounds/effects/button_submit.wav');
  const playGoBackSound = useSound('/sounds/effects/button_go_back.wav');

  const modes = [
    {
      content: 'SinglePlayer',
      imageUrl: '/images/menu/ai_3.png',
      hoverInfo: 'Play against an AI opponent',
      onClick: () => handleModeClick('singleplayer'),
    },
    {
      content: '1v1',
      imageUrl: '/images/menu/1v1_bw.png',
      hoverInfo: 'Play with another player',
      onClick: () => handleModeClick('1v1'),
    },
    {
      content: 'Tournament',
      imageUrl: '/images/menu/trophy_bw.png',
      hoverInfo: 'Compete in a tournament',
      onClick: () => handleModeClick('tournament'),
    },
  ];

  const subMenus: { [key: string]: GameMenuOption[] } = {
    singleplayer: [
      {
        content: 'Easy',
        imageUrl: './images/menu/ai_easy.png',
        hoverInfo: 'Easy level',
        onClick: () => handleDifficultyClick('easy'),
      },
      {
        content: 'Normal',
        imageUrl: '/images/menu/ai.png',
        hoverInfo: 'Normal level',
        onClick: () => handleDifficultyClick('normal'),
      },
      {
        content: 'Brutal',
        imageUrl: '/images/menu/ai_hard.png',
        hoverInfo: 'Brutal level',
        onClick: () => handleDifficultyClick('brutal'),
      },
    ],
    '1v1': [
      {
        content: 'Local',
        imageUrl: '/images/menu/local_match_5.png',
        hoverInfo: 'Play with a local player',
        onClick: () => handleDifficultyClick('local'),
      },
      {
        content: 'Online',
        imageUrl: 'images/menu/online_match_4.png',
        hoverInfo: 'Play with an online player',
        onClick: () => handleDifficultyClick('online'),
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
    if (isModalOpen('joinGameModal')) return;
    console.log('game menu useEffect: ', mode, difficulty);
    if (mode === 'tournament') {
      allowInternalNavigation();
      navigate('/tournament');
    } else if (mode && difficulty) {
      allowInternalNavigation();
      if (mode === '1v1' && difficulty === 'online' && lobby === 'create') {
        console.log('1v1 random online');
        setLobby('random');
        setMode('1v1');
        setDifficulty('online');
        navigate('/game');
      } else if (mode === '1v1' && difficulty === 'online' && lobby === 'join') {
        console.log('1v1 join online');
        setLobby('join');
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
        {mode && !difficulty && mode !== 'tournament' ? (
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
