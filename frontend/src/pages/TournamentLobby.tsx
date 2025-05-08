import { useMatchmaking } from '@/hooks';

import {
  TournamentBracket,
  TournamentLobbyNav,
  TournamentSettings,
  slideFromRightVariants,
} from '@components/layout';

import { useGameOptionsContext, useModal, useUser, useWebSocketContext } from '@contexts';

import {
  TournamentBracket as BracketType,
  PlayerData,
  createPlayerData,
  generateEmptyBracket
} from '@shared/types';

import { AnimatePresence, motion } from 'framer-motion';

import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

export const TournamentLobby: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('settings');
  const { user } = useUser();
  const { difficulty, lobby, mode } = useGameOptionsContext();

  const {
    connections,
    cleanup,
    cancelQueue,
    cancelGame,
    matchmakingState,
  } = useWebSocketContext();
  const { openModal } = useModal();

  useMatchmaking();

  useEffect(() => {
    if (mode === 'tournament') {
      setActiveTab('players');
    }
  }, [lobby]);

  useEffect(() => {
    console.log('matchmaking state: ', matchmakingState);
    if (
      matchmakingState.phase === 'in_game' &&
      location.pathname !== '/game' &&
      mode === 'tournament'
    ) {
      console.log('in game... opening accet pamge modal');
      handleClickOpenModal();
    }
  }, [matchmakingState.phase, location.pathname]);

  useEffect(() => {
    if (matchmakingState.phase === 'in_game') {
      console.log('in game....accept game');
    }
  }, [matchmakingState.phase, location.pathname]);

  // CREATE DUMMY DATA FOR TOURNAMENT BRACKET, DELETE LATER
  function generateBracket(playerCount: number): BracketType {
    return generateEmptyBracket(playerCount);
  }

  const bracket = generateBracket(16);

  const fakePlayer = createPlayerData(
    user?.user_id,
    user?.avatar_url,
    user?.display_name
  );
  
  const fakePlayer2: PlayerData = {
    user_id: 'asdasd',
    avatar_url: 'uploads/default_avatar.png',
    display_name: 'martti',
  };

  // Only set players if fakePlayer is not null
  if (fakePlayer) {
    bracket[0][0].players = [fakePlayer, fakePlayer2];
  }

  const onAccept = () => {
    console.log('joining game..');
    navigate('/game');
  };

  const onDecline = () => {
    console.log('Declining game..');
    cleanup();
    cancelGame();
    cancelQueue();
    if (location.pathname === '/tournamentLobby') {
      navigate('/home');
    }
  };

  const handleClickOpenModal = () => {
    console.log('opening modal');
    openModal('joinGameModal', {
      onAccept: onAccept,
      onDecline: onDecline,
    });
  };

  useEffect(() => {
    if (connections.matchmaking !== 'connected') return;
  }, [connections]);

  return (
    <>
      <motion.div className="w-full h-full flex flex-col justify-between relative z-10 gap-5">
        {mode === 'tournament' && (
          <header className="flex w-full justify-between">
            <TournamentLobbyNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            ></TournamentLobbyNav>
            <span className="text-secondary">X/{difficulty} Players</span>
          </header>
        )}

        <div className="flex flex-col md:flex-col gap-2 justify-center items-center w-full h-full flex-grow">
          <motion.div className="flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'fakeBracket' ? (
                // BRACKET FILLED WITH FAKE DATA
                <TournamentBracket players={bracket} />
              ) : activeTab === 'settings' ? (
                <motion.div
                  key="tournamentSettings"
                  className="w-full "
                  variants={slideFromRightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TournamentSettings />
                </motion.div>
              ) : (
                // BRACKET FILLED WITH REAL DATA
                // Make sure matchmakingState.matches is of type TournamentBracket
                <TournamentBracket players={matchmakingState.matches} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};