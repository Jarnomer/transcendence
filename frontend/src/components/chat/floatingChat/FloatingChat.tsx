import { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useSound } from '../../../hooks/useSound';
import { BackgroundGlow } from '../../visual/BackgroundGlow';
import { ChatSidebar } from '../ChatSideBar';
import { CreateNewGroupChat } from '../CreateNewGroupChat';
import { FloatingChatWindow } from './FloatingChatWindow';

export const FloatingChat = () => {
  const [minimized, setMinimized] = useState(true);
  const [isRoomPopupVisible, setRoomPopupVisible] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname === '/chat' ? true : false;
  const [openChats, setOpenChats] = useState<string[] | null>([]);

  console.log('isChatPage:', isChatPage);

  useEffect(() => {}, [isRoomPopupVisible]);

  const handleClickNewChat = () => {
    setRoomPopupVisible(!isRoomPopupVisible);
  };

  const { friends, user, sendChatMessage } = useChatContext();
  const playZoomSound = useSound('/sounds/effects/zoom.wav');

  const handleChatMinimize = () => {
    playZoomSound();
    setMinimized(!minimized);
  };

  const handleOpenChat = (friendId: string) => {
    setOpenChats((prev) => (prev.includes(friendId) ? prev : [...prev, friendId]));
  };

  const handleCloseChat = (friendId: string) => {
    setOpenChats((prev) => prev.filter((id) => id !== friendId));
  };

  useEffect(() => {
    console.log(openChats);
  }),
    [openChats];

  if (!user) return;

  return (
    <div className="flex gap-2 items-end fixed bottom-4 right-4 z-50">
      {!minimized &&
        openChats &&
        openChats?.length > 0 &&
        openChats?.map((friendId) => (
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
        } glass-box transition-all duration-300 overflow-hidden`}
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
          <div className=" overflow-y-auto h-[calc(100%-40px)] text-primary glass-box">
            <div className="w-full h-full relative flex items-center justify-center bg-primary/20">
              <BackgroundGlow />
              <div className={` w-full h-full overflow-y-auto`}>
                {isRoomPopupVisible ? (
                  <CreateNewGroupChat handleClickNewChat={handleClickNewChat} />
                ) : (
                  <>
                    <ChatSidebar
                      onOpenChat={handleOpenChat}
                      handleClickNewChat={handleClickNewChat}
                    ></ChatSidebar>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
