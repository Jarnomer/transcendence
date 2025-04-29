import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useMatchmaking } from '@/hooks';

import { slideFromRightVariants } from '../components/tournamentLobby/animationVariants';
import { TournamentLobbyNav } from '../components/tournamentLobby/TournamentLobbyNav';
import { TournamentPlayerList } from '../components/tournamentLobby/TournamentPlayerList';
import { TournamentSettings } from '../components/tournamentLobby/TournamentSettings';
import { useChatContext } from '../contexts/chatContext/ChatContext';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useModal } from '../contexts/modalContext/ModalContext';
import { useUser } from '../contexts/user/UserContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';

interface TournamentMatch {
  gameId: string;
  players: [p1, p2];
  round: number;
  isComplete: boolean;
}

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

export const TournamentLobby: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('settings');
  const { user } = useUser();
  const { friends, selectedFriendId, roomId } = useChatContext();
  const [players, setPlayers] = useState<any[]>();
  const [tournamentChatId, setTournamentChatId] = useState<string | undefined>();
  const { difficulty, lobby, mode } = useGameOptionsContext();

  const { createRoom } = useChatContext();
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

  // useEffect(() => {
  //   if (!user) return;

  //   const setupChat = async () => {
  //     console.log('TOURNAMENT LOBBY SET UP CHAT: Players: ', null);
  //     const chatId = await createRoom(
  //       'tournamentChat_' + Math.floor(Math.random() * 50),
  //       true,
  //       null
  //     );
  //     if (chatId) {
  //       setTournamentChatId(chatId);
  //     }
  //   };

  //   setupChat();
  // }, [user]);

  useEffect(() => {
    if (lobby === 'join' && mode === 'tournament') {
      setActiveTab('players');
    }
  }, [lobby]);

  useEffect(() => {
    console.log('matchmaking state: ', matchmakingState);
    if (matchmakingState.phase === 'in_game' && location.pathname !== '/game') {
      console.log('in game');
      console.log('participants: ', matchmakingState.participants);
      handleClickOpenModal();
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

  const bracket = generateBracket(8);

  const fakePlayer = {
    user_id: user?.user_id,
    avatar_url: user?.avatar_url,
    display_name: user?.display_name,
  };
  const fakePlayer2 = {
    user_id: 'asdasd',
    avatar_url: 'uploads/default_avatar.png',
    display_name: 'martti',
  };
  bracket[0][0].players = [fakePlayer, fakePlayer2];

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

  useEffect(() => {}, [tournamentChatId]);

  return (
    <>
      <motion.div className="w-full h-full flex flex-col justify-between relative z-10 gap-5">
        <header className="flex w-full justify-between">
          <TournamentLobbyNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          ></TournamentLobbyNav>
          <span className="text-secondary">X/{difficulty} Players</span>
        </header>

        <button onClick={handleClickOpenModal} className="text-green-500">
          open modal
        </button>
        <div className="flex flex-col md:flex-col gap-2 w-full h-full flex-grow">
          <motion.div className="flex flex-col md:w-full h-full w-full gap-2 md:gap-10">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' ? (
                <motion.div
                  key="tournamentSettings"
                  className="w-full h-full"
                  variants={slideFromRightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TournamentSettings></TournamentSettings>
                </motion.div>
              ) : activeTab == 'players' ? (
                <TournamentPlayerList players={bracket}></TournamentPlayerList>
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
