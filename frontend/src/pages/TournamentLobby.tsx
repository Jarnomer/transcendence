import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { slideFromRightVariants } from '../components/tournamentLobby/animationVariants';
import { Spectate } from '../components/tournamentLobby/Spectate';
import { TournamentLobbyNav } from '../components/tournamentLobby/TournamentLobbyNav';
import { TournamentPlayerList } from '../components/tournamentLobby/TournamentPlayerList';
import { TournamentSettings } from '../components/tournamentLobby/TournamentSettings';
import { useChatContext } from '../contexts/chatContext/ChatContext';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useModal } from '../contexts/modalContext/ModalContext';
import { useUser } from '../contexts/user/UserContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';

export const TournamentLobby: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('settings');
  const { user } = useUser();
  const { friends, selectedFriendId, roomId } = useChatContext();
  const [players, setPlayers] = useState<any[]>();
  const [tournamentChatId, setTournamentChatId] = useState<string | undefined>();
  const { difficulty } = useGameOptionsContext();

  const { createRoom } = useChatContext();
  const { matchmakingSocket, connections, sendMessage } = useWebSocketContext();
  const { openModal, closeModal } = useModal();

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

  const onAccept = () => {
    console.log('joining game..');
  };

  const onDecline = () => {
    console.log('Declining game..');
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

  useEffect(() => {
    setPlayers(Array.from({ length: parseInt(difficulty!) }, (_, i) => `Competitor ${i + 1}`));
  }, []);

  console.log(selectedFriendId);

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
                <TournamentPlayerList players={players}></TournamentPlayerList>
              ) : (
                <motion.div
                  key="tournamentPlayerList"
                  className="w-full h-full"
                  variants={slideFromRightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Spectate players={players}></Spectate>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};
