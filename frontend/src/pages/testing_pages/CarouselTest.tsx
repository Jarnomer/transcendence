import React, { useEffect } from 'react';

import { AnimatePresence } from 'framer-motion';

import { MatchMakingCarousel } from '../../components/game';
import { useLoading } from '../../contexts/gameContext/LoadingContextProvider';
import { useUser } from '../../contexts/user/UserContext';

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

interface MatchMakingCarouselProps {
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

export const CarouselTest: React.FC = () => {
  const { user } = useUser();
  const { loadingStates, setLoadingState } = useLoading();

  // Move the state update inside useEffect to avoid infinite loop
  useEffect(() => {
    setLoadingState('matchMakingAnimationLoading', true);
  }, []); // Run only once after the component mounts

  const playersData = {
    player1: user,
    player2: null,

    //{
    //   user_id: 'easy',
    //   avatar_url: './src/assets/images/ai_easy.png',
    //   display_name: 'AI_EASY',
    // },
  };

  console.log('playersdata from carouselTest: ', playersData);

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        <MatchMakingCarousel playersData={playersData}></MatchMakingCarousel>
      </AnimatePresence>
    </div>
  );
};
