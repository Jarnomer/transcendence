import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { useChatContext } from '@/contexts/chatContext/ChatContext';

import { BackgroundGlow } from '../components';
import { ChatSidebar } from '../components/chat/ChatSideBar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { CreateNewGroupChat } from '../components/chat/CreateNewGroupChat';

export const ChatPage: React.FC = () => {
  const {
    friends,
    messages,
    user,
    selectedFriend,
    roomId,
    rooms,
    myRooms,
    setSelectedFriend,
    setRoomId,
    sendChatMessage,
    joinRoom,
    createRoom,
    setMembers,
  } = useChatContext();

  const [isRoomPopupVisible, setRoomPopupVisible] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname === '/chat' ? true : false;
  console.log('isChatPage:', isChatPage);

  useEffect(() => {}, [isRoomPopupVisible]);

  const handleClickNewChat = () => {
    setRoomPopupVisible(!isRoomPopupVisible);
  };

  return (
    <div className="p-2 h-full flex items-center justify-center">
      <div className="flex h-[600px] w-3xl  glass-box overflow-hidden relative">
        <BackgroundGlow />
        <div
          className={` w-full h-full ${!selectedFriend && !roomId ? 'w-full md:block' : 'hidden lg:block md:w-1/3 lg:1/5'} overflow-y-auto`}
        >
          {isRoomPopupVisible ? (
            <CreateNewGroupChat handleClickNewChat={handleClickNewChat} />
          ) : (
            <>
              <ChatSidebar handleClickNewChat={handleClickNewChat}></ChatSidebar>
            </>
          )}
        </div>

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
  );
};
