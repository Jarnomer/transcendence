import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { useLoading } from '../../contexts/gameContext/LoadingContextProvider';
import { useUser } from '../../contexts/user/UserContext';
import { useBackgroundGameVisibility } from '../../hooks/useBackgroundGameVisibility';
import { BackgroundGlow } from '../visual/BackgroundGlow';

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

interface MatchMakingCarouselProps {
  // setAnimate: (value: boolean) => void;
  playersData: {
    player1: PlayerData | null;
    player2: PlayerData | null;
  };
}

const aiOptions = {
  easy: {
    avatar: './src/assets/images/ai_easy.png',
    name: 'AI_EASY',
  },
  normal: {
    avatar: './src/assets/images/ai.png',
    name: 'AI_NORMAL',
  },
  brutal: {
    avatar: './src/assets/images/ai_hard.png',
    name: 'AI_BRUTAL',
  },
};

const avatarList = [
  './src/assets/images/ai_easy.png',
  './src/assets/images/ai_hard.png',
  './src/assets/images/ai.png',
  './src/assets/images/ai_3.png',
];

export const MatchMakingCarousel: React.FC<MatchMakingCarouselProps> = ({ playersData }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [opponentAvatar, setOpponentAvatar] = useState<string>(avatarList[0]);
  const [opponentName, setOpponentName] = useState<string>('???');
  const [opponentFound, setOpponentFound] = useState<boolean>(false);
  const location = useLocation();
  const { mode, difficulty } = useGameOptionsContext();
  const { loadingStates, setLoadingState } = useLoading();
  const { user: loggedInUser } = useUser();
  const { hideBackgroundGame } = useBackgroundGameVisibility();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (opponentFound) {
      hideBackgroundGame();
      setTimeout(() => {
        setLoadingState('matchMakingAnimationLoading', false);
      }, 3000);
    }

    if (mode === 'singleplayer') {
      setOpponentAvatar(aiOptions[difficulty].avatar);
      setOpponentName(aiOptions[difficulty].name);
      return;
    }

    if (!opponentFound) {
      interval = setInterval(() => {
        let newAvatar;
        do {
          newAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
        } while (newAvatar === opponentAvatar);
        if (newAvatar !== opponentAvatar) {
          setOpponentAvatar(newAvatar);
        }
      }, 300);
    }
    return () => clearInterval(interval);
  }, [opponentFound, opponentAvatar]);

  useEffect(() => {
    if (!playersData?.player1) return;
    const opponent =
      playersData.player1?.user_id !== loggedInUser?.user_id
        ? playersData.player1
        : playersData.player2;

    setOpponentAvatar(opponent?.avatar_url || '/avatars/default.png');
    setOpponentName(opponent?.display_name || 'Opponent');
    setOpponentFound(true);
  }, [playersData]);

  useEffect(() => {
    setLoadingState('matchMakingAnimationLoading', true);
    if (mode === 'singleplayer' || difficulty === 'local') {
      setOpponentFound(true);
      hideBackgroundGame();
    }
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  return (
    <>
      {!opponentFound ? (
        <h2 className="w-full text-center font-heading text-3xl m-2">Looking for an opponent</h2>
      ) : null}
      <div className="flex w-full relative justify-center items-center gap-5">
        {/* PLAYER CARD */}
        <div
          id="player-card"
          className="border glass-box relative overflow-hidden flex flex-col justify-center items-center p-4 "
        >
          <BackgroundGlow></BackgroundGlow>
          <div className="w-[200px] h-[200px] overflow-hidden bg-background  border-2 border-primary">
            <img className="w-full h-full object-cover" src={user?.avatar_url} alt="You" />
          </div>
          <p className="mt-2 font-semibold">{user?.display_name}</p>
        </div>

        {/* OPPONENT CARD */}
        <div
          id="opponent-card"
          className="border glass-box relative overflow-hidden flex flex-col justify-center items-center p-4 "
        >
          <BackgroundGlow></BackgroundGlow>
          <div className="w-[200px] h-[200px] bg-background overflow-hidden border-2 border-primary relative">
            <div className="absolute w-full h-full">
              <AnimatePresence mode="wait">
                {opponentAvatar && (
                  <motion.img
                    key={opponentAvatar}
                    src={opponentAvatar}
                    alt="Opponent"
                    initial={{ y: -200 }}
                    animate={{ y: 0 }}
                    exit={{ y: 200 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="w-full h-full object-cover absolute"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
          <motion.p
            key={opponentName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 font-semibold"
          >
            {opponentName}
          </motion.p>
        </div>

        <h1 className="text-9xl text-white font-heading absolute left-[50%] translate-x-[-50%]">
          VS
        </h1>
      </div>
    </>
  );
};
