import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useMatchmaking } from '@/hooks';

import { useGameOptionsContext, useModal, useWebSocketContext } from '@contexts';

import {
  TournamentBracket,
  TournamentLobbyNav,
  TournamentSettings,
  slideFromRightVariants,
} from '@components/layout';

import {
  TournamentBracket as BracketType,
  TournamentMatch,
  generateEmptyBracket,
} from '@shared/types';

export const TournamentLobby: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('settings');
  const { difficulty, lobby, mode } = useGameOptionsContext();
  const navigate = useNavigate();

  // Add a fallback for difficulty (default to 8 players)
  const playerCount = difficulty ? parseInt(difficulty) : 8;

  const [bracket, setBracket] = useState<BracketType>(generateBracket(playerCount));

  const [players, setPlayers] = useState<any[]>([]);
  const { connections, cleanup, cancelQueue, cancelGame, matchmakingState } = useWebSocketContext();

  const { openModal } = useModal();

  useMatchmaking();

  useEffect(() => {
    if (mode === 'tournament') {
      setActiveTab('players');
    }
  }, [lobby]);

  useEffect(() => {
    if (
      matchmakingState.phase === 'in_game' &&
      location.pathname !== '/game' &&
      mode === 'tournament'
    ) {
      handleClickOpenModal();
    }
  }, [matchmakingState.phase, location.pathname]);


  useEffect(() => {
    if (matchmakingState.participants) {
      console.log('participants: ', matchmakingState.participants);
      setPlayers(matchmakingState.participants);
    }
  }, [matchmakingState.participants]);

  // CREATE DUMMY DATA FOR TOURNAMENT BRACKET, DELETE LATER
  function generateBracket(playerCount: number): BracketType {
    return generateEmptyBracket(playerCount);
  }

  // console.log(bracket);
  /// END OF DUMMY DATA

  useEffect(() => {
    // Only proceed if matches exist
    if (!matchmakingState.matches || !matchmakingState.matches.length) return;

    // Create a deep copy of the bracket to avoid mutation issues
    const newBracket = JSON.parse(JSON.stringify(bracket)) as BracketType;

    // Explicitly typing the iterators in the forEach loops to fix the 'any' type
    matchmakingState.matches.forEach((roundMatches: TournamentMatch[], roundIndex: number) => {
      roundMatches.forEach((match: TournamentMatch, matchIndex: number) => {
        // Add bounds checking to prevent potential runtime errors
        if (roundIndex < newBracket.length && matchIndex < newBracket[roundIndex].length) {
          // Update the match data
          newBracket[roundIndex][matchIndex].gameId = match.gameId;
          newBracket[roundIndex][matchIndex].players = match.players;
          newBracket[roundIndex][matchIndex].isComplete = match.isComplete;
        }
      });
    });

    setBracket(newBracket);
    console.log('bracket: ', newBracket);
  }, [matchmakingState.matches]);

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
            <TournamentLobbyNav activeTab={activeTab} setActiveTab={setActiveTab} />
            <span className="text-secondary">
              {players.length}/{difficulty} Players
            </span>
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
                <TournamentBracket players={bracket} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};
