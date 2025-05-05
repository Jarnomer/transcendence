import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { useGameOptionsContext } from '../../../contexts/gameContext/GameOptionsContext';
import { useLoading } from '../../../contexts/gameContext/LoadingContextProvider';
import { useUser } from '../../../contexts/user/UserContext';
import { useGameVisibility } from '../../../hooks/useGameVisibility';
import { MatchMakingBackgroundGlitch } from './MatchMakingBackgroundGlitch';
import { PlayerCard } from './PlayerCard';

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

export const MatchMakingCarousel: React.FC<MatchMakingCarouselProps> = ({ playersData }) => {
  const [opponentAvatar, setOpponentAvatar] = useState<string>(null);
  const [opponentName, setOpponentName] = useState<string>(null);
  const [opponentFound, setOpponentFound] = useState<boolean>(false);
  const [transitionToScoreboard, setTransitionToScoreboard] = useState(false);
  const [userPlayerNumber, setUserPlayerNumber] = useState(1);
  const [opponentPlayerNumber, setOpponentPlayerNumber] = useState(2);
  const { mode, difficulty } = useGameOptionsContext();
  const { loadingStates, setLoadingState } = useLoading();
  const { user } = useUser();

  // console.log(mode, difficulty);
  // console.log(playersData);

  const { hideBackgroundGame, showGameCanvas } = useGameVisibility();

  // console.log('playersData from matchmaking carousel: ', playersData);

  // waits for the player cards to transfrom in to scoreboard shape
  useEffect(() => {
    if (transitionToScoreboard) {
      setTimeout(() => {
        setLoadingState('matchMakingAnimationLoading', false);
      }, 1000);
    }
  }, [transitionToScoreboard, setLoadingState]);

  useEffect(() => {
    if (!user) return;

    if (opponentFound) {
      console.log('Opponent found');
      hideBackgroundGame();
      setTimeout(() => {
        setTransitionToScoreboard(true);
      }, 1000);
    }
    if (mode === 'singleplayer') {
      setOpponentAvatar(aiOptions[difficulty].avatar);
      setOpponentName(aiOptions[difficulty].name);
      return;
    }
  }, [opponentFound, user]);

  useEffect(() => {
    if (!playersData?.player1 || !user) return;
    const opponent =
      playersData.player1?.user_id !== user?.user_id ? playersData.player1 : playersData.player2;
    setOpponentAvatar(opponent?.avatar_url || '/avatars/default.png');
    setOpponentName(opponent?.display_name || 'Opponent');
    setUserPlayerNumber(playersData.player1?.user_id === user?.user_id ? 1 : 2);
    setOpponentPlayerNumber(playersData.player1?.user_id !== user?.user_id ? 1 : 2);
    console.log('setting opponent found to true');
    setOpponentFound(true);
  }, [playersData]);

  useEffect(() => {
    if (!user) return;
    if (mode === 'singleplayer' || difficulty === 'local') {
      setOpponentFound(true);
      hideBackgroundGame();
    }
  }, [user]);

  useEffect(() => {
    console.log(mode, difficulty);
    if (mode === 'singleplayer') {
      setOpponentAvatar(aiOptions[difficulty].avatar);
      setOpponentName(aiOptions[difficulty].name);
      return;
    }
  }, [mode, difficulty, opponentAvatar]);

  if (!user) return;

  console.log(playersData);
  return (
    <>
      {!transitionToScoreboard && <MatchMakingBackgroundGlitch></MatchMakingBackgroundGlitch>}
      <motion.div
        className={`w-full h-full flex justify-start ${!opponentFound && 'flex-col'}`}
        key="matchmaking-screen"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.00001 } }}
      >
        {!opponentFound && (
          <h2 className="w-full text-center font-heading text-3xl m-2">Looking for an opponent</h2>
        )}

        <div
          className={`flex w-full gap-5 ${!transitionToScoreboard ? 'relative justify-center items-center' : 'items-start justify-between gap-2 text-primary mb-2'} ${transitionToScoreboard && userPlayerNumber !== 1 ? 'flex-row-reverse' : ''}`}
        >
          {/* PLAYER CARD */}
          <PlayerCard
            name={user?.display_name}
            imageSrc={user?.avatar_url}
            opponentFound={transitionToScoreboard}
            playerNum={userPlayerNumber}
          ></PlayerCard>

          <PlayerCard
            name={opponentName}
            imageSrc={opponentAvatar}
            opponentFound={transitionToScoreboard}
            playerNum={opponentPlayerNumber}
          ></PlayerCard>

          {!transitionToScoreboard && (
            <motion.h1
              className="text-9xl text-white font-heading absolute left-[50%] translate-x-[-50%] top-1/2 transform -translate-y-1/2"
              style={{ width: 'fit-content' }}
            >
              VS
            </motion.h1>
          )}
        </div>
      </motion.div>
    </>
  );
};
