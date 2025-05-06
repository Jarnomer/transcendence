import { useState } from 'react';

import { useChatContext, useUser } from '@contexts';

import { BackgroundGlow } from '@components';

import { ChatSidebar, ChatWindow, CreateNewGroupChat, MobileChatPage } from '@components/chat';

import { useMediaQuery } from '@hooks';

export const ChatPage: React.FC = () => {
  const [createNewGroupChat, setCreateNewGroupChat] = useState(false);
  const [chatId, setchatId] = useState<string | null>(null);
  const { user } = useUser();
  const isDesktop = useMediaQuery('(min-width: 600px)');

  const { friends, messages, fetchDmHistory, fetchChatHistory } = useChatContext();

  const handleClickNewChat = () => {
    setCreateNewGroupChat(!createNewGroupChat);
  };

  const handleOpenChat = async (friendId: string) => {
    setchatId(friendId);
    if (!messages[friendId]) {
      await fetchDmHistory(friendId);
    }
  };

  const handleCloseChat = () => {
    setchatId(null);
  };

  const handleOpenRoom = async (roomId: string) => {
    console.log('opening chat', roomId);
    setchatId(roomId);
    if (!messages[roomId]) {
      await fetchChatHistory(roomId); // Optional: make sure messages are loaded
    }
  };

  if (!user) return null;

  if (!isDesktop) return <MobileChatPage></MobileChatPage>;

  return (
    <div
      className={`flex md:border-1 w-2xl backdrop-blur-md relative h-full sm:max-h-[500px] glass-box`}
    >
      <div className="absolute w-full h-full overflow-hidden pointer-events-none">
        <BackgroundGlow />
      </div>

      {createNewGroupChat && !chatId ? (
        <div className="w-full h-full relative flex items-center">
          <div className="h-full overflow-y-auto">
            <CreateNewGroupChat handleClickNewChat={handleClickNewChat} />
          </div>
        </div>
      ) : (
        <>
          <div className="w-full h-full flex">
            <div
              className={`h-full overflow-y-auto ${chatId ? 'hidden md:block md:w-2/5' : 'block w-full'}`}
            >
              <ChatSidebar
                onOpenChat={handleOpenChat}
                onOpenRoom={handleOpenRoom}
                handleClickNewChat={handleClickNewChat}
              />
            </div>
            {chatId && (
              <div className="w-full md:w-3/5 h-full">
                <ChatWindow
                  key={chatId}
                  friends={friends}
                  chatId={chatId}
                  onBack={handleCloseChat}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
