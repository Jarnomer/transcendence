import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useChatContext, useModal, useUser } from '@contexts';

import { ChatSidebar, ChatWindow, CreateNewGroupChat } from '@components/chat';

import { NavIconButton } from '../../UI/buttons/NavIconButton';
import { BackgroundGlow } from '../../visual/BackgroundGlow';

export const MobileChatPage: React.FC = () => {
  const [createNewGroupChat, setCreateNewGroupChat] = useState(false);
  const [chatId, setchatId] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { friends, messages, fetchDmHistory, fetchChatHistory, setOpenChatWindows } =
    useChatContext();

  const handleClickNewChat = () => {
    setCreateNewGroupChat(!createNewGroupChat);
  };

  const handleGoBack = () => {
    if (chatId) {
      setchatId(null);
    } else {
      navigate(-1);
    }
  };

  const handleOpenRoom = async (roomId: string) => {
    if (!messages[roomId]) {
      await fetchChatHistory(roomId); // Optional: make sure messages are loaded
    }
    openModal('chatModal', {
      friends,
      chatId: roomId,
    });
  };

  const handleOpenChat = async (friendId: string) => {
    setOpenChatWindows((prev: Record<string, boolean>) => ({
      ...prev,
      [friendId]: true,
    }));

    if (!messages[friendId]) {
      await fetchDmHistory(friendId);
    }

    openModal('chatModal', {
      friends,
      chatId: friendId,
    });
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
