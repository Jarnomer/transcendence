import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { slideFromRightVariants } from '../components/tournamentLobby/animationVariants';
import { Spectate } from '../components/tournamentLobby/Spectate';
import { TournamentLobbyNav } from '../components/tournamentLobby/TournamentLobbyNav';
import { TournamentPlayerList } from '../components/tournamentLobby/TournamentPlayerList';
import { useChatContext } from '../contexts/chatContext/ChatContext';
import { useUser } from '../contexts/user/UserContext';

export const TournamentLobby: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('players');
  const { user } = useUser();
  const { friends, selectedFriendId, roomId } = useChatContext();
  const [players, setPlayers] = useState<any[]>();
  const [tournamentChatId, setTournamentChatId] = useState<string | undefined>();

  const { createRoom } = useChatContext();

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

  useEffect(() => {}, [tournamentChatId]);

  useEffect(() => {
    setPlayers(Array.from({ length: 8 }, (_, i) => `Competitor ${i + 1}`));
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
          <span className="text-secondary">X/X Players</span>
        </header>

        <div className="flex flex-col md:flex-col gap-2 w-full h-full flex-grow">
          <motion.div className="flex flex-col md:w-full h-full w-full gap-2 md:gap-10">
            <AnimatePresence mode="wait">
              {activeTab == 'players' ? (
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
