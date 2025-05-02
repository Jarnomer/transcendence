import { useState } from 'react';

import { useLocation } from 'react-router-dom';

import { BackgroundGlow } from '../components';
import { ChatWindow } from '../components/chat/chatPage/ChatWindow';
import { ChatSidebar } from '../components/chat/ChatSideBar';
import { CreateNewGroupChat } from '../components/chat/CreateNewGroupChat';
import { useChatContext } from '../contexts/chatContext/ChatContext';
import { useUser } from '../contexts/user/UserContext';
import { useSound } from '../hooks/useSound';

export const ChatPage: React.FC = () => {
  const [createNewGroupChat, setCreateNewGroupChat] = useState(false);
  const [chatId, setchatId] = useState<string | null>(null);
  const location = useLocation();
  const { user } = useUser();

  const { friends, sendChatMessage, messages, fetchDmHistory, fetchChatHistory } = useChatContext();
  const playZoomSound = useSound('/sounds/effects/zoom.wav');

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

  return (
    <div className="flex border-1 w-2xl relative h-full  sm:max-h-[500px] glass-box">
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
        !chatId && (
          <div className="w-full h-full relative flex items-center">
            <div className="h-full overflow-y-auto">
              <ChatSidebar
                onOpenChat={handleOpenChat}
                onOpenRoom={handleOpenRoom}
                handleClickNewChat={handleClickNewChat}
              />
            </div>
          </div>
        )
      )}

      {chatId && (
        <ChatWindow
          key={chatId}
          user={user}
          friends={friends}
          chatId={chatId}
          onBack={handleCloseChat}
          onSend={sendChatMessage}
        />
      )}
    </div>
  );
};
