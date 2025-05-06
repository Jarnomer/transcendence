import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useChatContext, useUser } from '@contexts';

import { ChatSidebar, ChatWindow, CreateNewGroupChat } from '@components/chat';

import { NavIconButton } from '../../UI/buttons/NavIconButton';
import { BackgroundGlow } from '../../visual/BackgroundGlow';

export const MobileChatPage: React.FC = () => {
  const [createNewGroupChat, setCreateNewGroupChat] = useState(false);
  const [chatId, setchatId] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

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

  const handleGoBack = () => {
    if (chatId) {
      setchatId(null);
    } else {
      navigate(-1);
    }
  };

  const handleOpenRoom = async (roomId: string) => {
    console.log('opening chat', roomId);
    setchatId(roomId);
    if (!messages[roomId]) {
      await fetchChatHistory(roomId); // Optional: make sure messages are loaded
    }
  };

  if (!user) return null;
  return (
    <div className={`w-full h-full max-h-screen overflow-hidden backdrop-blur-md relative `}>
      {!chatId && (
        <NavIconButton
          icon="arrowLeft"
          id="chat-back-button"
          ariaLabel="back to conversations"
          onClick={() => navigate(-1)}
        ></NavIconButton>
      )}
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
          {chatId ? (
            <div className="w-full h-full">
              <ChatWindow key={chatId} friends={friends} chatId={chatId} onBack={handleGoBack} />
            </div>
          ) : (
            <div className={`h-full overflow-y-auto  w-full`}>
              <ChatSidebar
                onOpenChat={handleOpenChat}
                onOpenRoom={handleOpenRoom}
                handleClickNewChat={handleClickNewChat}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
