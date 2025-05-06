import { useState } from 'react';

import { useChatContext } from '@contexts';

import { ChatSidebar, CreateNewGroupChat, FloatingChatWindow } from '@components/chat';

import { useSound } from '@hooks';

import { BackgroundGlow } from '../../visual/BackgroundGlow';

export const FloatingChat = () => {
  const [minimized, setMinimized] = useState(true);
  const [createNewGroupChat, setCreateNewGroupChat] = useState(false);

  const {
    friends,
    user,
    openChatWindows,
    setOpenChatWindows,
    messages,
    fetchDmHistory,
    rooms,
    myRooms,
    fetchChatHistory,
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
    setOpenChatWindows((prev: Record<string, boolean>) => ({
      ...prev,
      [friendId]: true,
    }));

    if (!messages[friendId]) {
      await fetchDmHistory(friendId); // Optional: make sure messages are loaded
    }
  };

  const handleOpenRoom = async (roomId: string) => {
    setOpenChatWindows((prev: Record<string, boolean>) => ({
      ...prev,
      [roomId]: true,
    }));

    if (!messages[roomId]) {
      await fetchChatHistory(roomId); // Optional: make sure messages are loaded
    }
  };

  const handleCloseChat = (friendId: string) => {
    setOpenChatWindows((prev: Record<string, boolean>) => ({
      ...prev,
      [friendId]: false,
    }));
  };

  if (!user) return null;

  return (
    <div
      className={`flex gap-2 items-end fixed bottom-4 right-4 z-40 transition-all duration-300 overflow-hidden`}
    >
      {openChatWindows &&
        Object.entries(openChatWindows)
          .filter(([_, isOpen]) => isOpen)
          .map(([friendId]) => (
            <FloatingChatWindow
              key={friendId}
              friends={friends}
              chatId={friendId}
              onBack={() => handleCloseChat(friendId)}
            />
          ))}

      {/* Header with toggle */}
      <div
        className={`glass-box backdrop-blur-sm z-40 shadow-lg w-[300px] ${
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
          <div className="relative h-[calc(100%-40px)] text-primary">
            <div className="w-full h-full relative flex items-center justify-center bg-primary/20">
              <div className="absolute w-full h-full overflow-hidden pointer-events-none">
                <BackgroundGlow />
              </div>
              <div className="w-full h-full ">
                {createNewGroupChat ? (
                  <CreateNewGroupChat handleClickNewChat={handleClickNewChat} />
                ) : (
                  <ChatSidebar
                    onOpenChat={handleOpenChat}
                    onOpenRoom={handleOpenRoom}
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
