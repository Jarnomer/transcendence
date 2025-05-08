import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useMatchmaking } from '@/hooks';

import { useGameOptionsContext, useModal, useUser, useWebSocketContext } from '@contexts';

import {
  TournamentLobbyNav,
  TournamentPlayerList,
  TournamentSettings,
  slideFromRightVariants,
} from '@components/layout';

import { FriendType } from '@shared/types';

interface TournamentMatch {
  gameId: string;
  players: [FriendType | null, FriendType | null];
  round: number;
  isComplete: boolean;
}

export const TournamentLobby: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('settings');
  const { user } = useUser();
  const { difficulty, lobby, mode } = useGameOptionsContext();
  const [bracket, setBracket] = useState<TournamentMatch[][]>(
    generateBracket(parseInt(difficulty!))
  );

  const {
    matchmakingSocket,
    connections,
    sendMessage,
    cleanup,
    cancelQueue,
    cancelGame,
    matchmakingState,
  } = useWebSocketContext();
  const { openModal, closeModal } = useModal();

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

  // CREATE DUMMY DATA FOR TOURNAMENT BRACKET
  function generateBracket(playerCount: number): TournamentMatch[][] {
    const totalRounds = Math.log2(playerCount);
    const matchesPerRound: number[] = [];

    for (let r = 0; r < totalRounds; r++) {
      matchesPerRound.push(playerCount / Math.pow(2, r + 1));
    }
    let gameIdCounter = 1;
    const bracket: TournamentMatch[][] = [];

    for (let round = 0; round < totalRounds; round++) {
      const roundMatches: TournamentMatch[] = [];

      for (let m = 0; m < matchesPerRound[round]; m++) {
        roundMatches.push({
          gameId: `game-${gameIdCounter++}`,
          players: [null, null],
          round: round + 1,
          isComplete: false,
        });
      }
      bracket.push(roundMatches);
    }
    return bracket;
  }

  // const bracket = generateBracket(parseInt(difficulty!));

  // const fakePlayer = {
  //   user_id: user?.user_id,
  //   avatar_url: user?.avatar_url,
  //   display_name: user?.display_name,
  // };
  // const fakePlayer2 = {
  //   user_id: 'asdasd',
  //   avatar_url: 'uploads/default_avatar.png',
  //   display_name: 'martti',
  // };
  // bracket[0][0].players = [fakePlayer, fakePlayer2];

  useEffect(() => {
    const newBracket = [...bracket];
    matchmakingState.matches.forEach((roundMatches, roundIndex) => {
      roundMatches.forEach((match, matchIndex) => {
        if (newBracket[roundIndex][matchIndex]) {
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

  // Extract player data for the TournamentPlayerList component
  const extractPlayers = (bracketData: TournamentMatch[][]): FriendType[] => {
    const players: FriendType[] = [];

    bracketData.forEach((round) => {
      round.forEach((match) => {
        match.players.forEach((player) => {
          if (player) {
            players.push(player);
          }
        });
      });
    });

    return players;
  };

  // Get a flat array of players from the bracket
  const tournamentPlayers = extractPlayers(bracket);

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
              {activeTab === 'settings' ? (
                <motion.div
                  key="tournamentSettings"
                  className="w-full "
                  variants={slideFromRightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TournamentSettings></TournamentSettings>
                </motion.div>
              ) : activeTab == 'players' ? (
                <TournamentPlayerList players={tournamentPlayers}></TournamentPlayerList>
              ) : (
                <motion.div
                  key="tournamentPlayerList"
                  className="w-full h-full"
                  variants={slideFromRightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {/* <Spectate players={bracket}></Spectate> */}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};
