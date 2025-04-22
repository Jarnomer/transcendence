import { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useSound } from '../../hooks/useSound';
import { BackgroundGlow } from '../visual/BackgroundGlow';
import { ChatSidebar } from './ChatSideBar';
import { ChatWindow } from './ChatWindow';
import { CreateNewGroupChat } from './CreateNewGroupChat';

export const FloatingChat = () => {
  const [minimized, setMinimized] = useState(true);
  const [isRoomPopupVisible, setRoomPopupVisible] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname === '/chat' ? true : false;
  console.log('isChatPage:', isChatPage);

  useEffect(() => {}, [isRoomPopupVisible]);

  const handleClickNewChat = () => {
    setRoomPopupVisible(!isRoomPopupVisible);
  };

  const {
    friends,
    messages,
    user,
    selectedFriend,
    roomId,
    setSelectedFriend,
    setRoomId,
    sendChatMessage,
  } = useChatContext();
  const playZoomSound = useSound('/sounds/effects/zoom.wav');

  const handleChatMinimize = () => {
    playZoomSound();
    setMinimized(!minimized);
  };

  if (!user) return;

  return (
    <div
      className={`fixed bottom-4 backdrop-blur-sm right-4 z-50 shadow-lg w-[300px] ${
        minimized ? 'h-12' : 'h-[400px]'
      } glass-box transition-all duration-300 overflow-hidden`}
    >
      {/* Header with toggle */}
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
              {isRoomPopupVisible && !selectedFriend ? (
                <CreateNewGroupChat handleClickNewChat={handleClickNewChat} />
              ) : (
                !isRoomPopupVisible &&
                !selectedFriend && (
                  <>
                    <ChatSidebar handleClickNewChat={handleClickNewChat}></ChatSidebar>
                  </>
                )
              )}
              {selectedFriend ? (
                <ChatWindow
                  messages={messages}
                  user={user}
                  friends={friends}
                  selectedFriendId={selectedFriend}
                  onBack={() => {
                    setSelectedFriend(null);
                    setRoomId(null);
                  }}
                  onSend={sendChatMessage}
                />
              ) : roomId ? (
                <ChatWindow
                  messages={messages}
                  user={user}
                  roomId={roomId}
                  members={friends}
                  onBack={() => {
                    setSelectedFriend(null);
                    setRoomId(null);
                  }}
                  onSend={sendChatMessage}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
