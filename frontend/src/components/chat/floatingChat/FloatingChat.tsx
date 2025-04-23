import { useState } from 'react';

import { useLocation } from 'react-router-dom';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useSound } from '../../../hooks/useSound';
import { BackgroundGlow } from '../../visual/BackgroundGlow';
import { ChatSidebar } from '../ChatSideBar';
import { CreateNewGroupChat } from '../CreateNewGroupChat';
import { FloatingChatWindow } from './FloatingChatWindow';

export const FloatingChat = () => {
  const [minimized, setMinimized] = useState(true);
  const [createNewGroupChat, setCreateNewGroupChat] = useState(false);
  const location = useLocation();

  const {
    friends,
    user,
    sendChatMessage,
    openChatWindows,
    setOpenChatWindows,
    messages,
    fetchDmHistory,
  } = useChatContext();
  const playZoomSound = useSound('/sounds/effects/zoom.wav');

  const handleClickNewChat = () => {
    setCreateNewGroupChat(!createNewGroupChat);
  };

  const handleChatMinimize = () => {
    playZoomSound();
    setMinimized(!minimized);
  };

  const handleOpenChat = async (friendId: string) => {
    console.log('opening chat', friendId);
    setOpenChatWindows((prev) => ({
      ...prev,
      [friendId]: true,
    }));

    if (!messages[friendId]) {
      await fetchDmHistory(friendId); // Optional: make sure messages are loaded
    }
  };

  const handleCloseChat = (friendId: string) => {
    setOpenChatWindows((prev) => ({
      ...prev,
      [friendId]: false,
    }));
  };

  if (!user) return null;

  return (
    <div className="flex gap-2 items-end fixed bottom-4 right-4 z-50">
      {!minimized &&
        openChatWindows &&
        Object.entries(openChatWindows)
          .filter(([_, isOpen]) => isOpen)
          .map(([friendId]) => (
            <FloatingChatWindow
              key={friendId}
              user={user}
              friends={friends}
              selectedFriendId={friendId}
              onBack={() => handleCloseChat(friendId)}
              onSend={sendChatMessage}
            />
          ))}

      {/* Header with toggle */}
      <div
        className={`glass-box backdrop-blur-sm z-50 shadow-lg w-[300px] ${
          minimized ? 'h-12' : 'h-[400px]'
        } transition-all duration-300 overflow-hidden`}
      >
        <div
          className="w-full bg-primary text-black p-2 flex justify-between items-center cursor-pointer"
          onClick={handleChatMinimize}
        >
          <p className="text-sm">Chat</p>
          <button className="text-xs">{minimized ? '▲' : '▼'}</button>
        </div>

        {/* Chat content */}
        {!minimized && (
          <div className="relative overflow-y-auto h-[calc(100%-40px)] text-primary">
            <div className="w-full h-full relative flex items-center justify-center bg-primary/20">
              <div className="absolute w-full h-full overflow-hidden pointer-events-none">
                <BackgroundGlow />
              </div>
              <div className="w-full h-full overflow-y-auto">
                {createNewGroupChat ? (
                  <CreateNewGroupChat handleClickNewChat={handleClickNewChat} />
                ) : (
                  <ChatSidebar
                    onOpenChat={handleOpenChat}
                    handleClickNewChat={handleClickNewChat}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
