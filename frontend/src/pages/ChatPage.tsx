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
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const location = useLocation();
  const { user } = useUser();

  const { friends, sendChatMessage, messages, fetchDmHistory } = useChatContext();
  const playZoomSound = useSound('/sounds/effects/zoom.wav');

  const handleClickNewChat = () => {
    setCreateNewGroupChat(!createNewGroupChat);
  };

  const handleOpenChat = async (friendId: string) => {
    setSelectedFriendId(friendId);
    if (!messages[friendId]) {
      await fetchDmHistory(friendId);
    }
  };

  const handleCloseChat = () => {
    setSelectedFriendId(null);
  };

  if (!user) return null;

  return (
    <div className="flex border-1 w-2xl relative h-full max-h-2xl glass-box">
      <div className="absolute w-full h-full overflow-hidden pointer-events-none">
        <BackgroundGlow />
      </div>

      {createNewGroupChat && !selectedFriendId ? (
        <div className="w-full h-full relative flex items-center">
          <div className="h-full overflow-y-auto">
            <CreateNewGroupChat handleClickNewChat={handleClickNewChat} />
          </div>
        </div>
      ) : (
        !selectedFriendId && (
          <div className="w-full h-full relative flex items-center">
            <div className="h-full overflow-y-auto">
              <ChatSidebar onOpenChat={handleOpenChat} handleClickNewChat={handleClickNewChat} />
            </div>
          </div>
        )
      )}

      {selectedFriendId && (
        <ChatWindow
          key={selectedFriendId}
          user={user}
          friends={friends}
          selectedFriendId={selectedFriendId}
          onBack={handleCloseChat}
          onSend={sendChatMessage}
        />
      )}
    </div>
  );
};
