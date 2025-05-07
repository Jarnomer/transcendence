import React, { useEffect, useMemo, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { useChatContext, useUser } from '@contexts';

import { MessageInput, MessageList } from '@components/chat';
import { NavIconButton, ProfilePictureSmall } from '@components/UI';

import { useSound } from '@hooks';

import { ChatRoomType, FriendType } from '@shared/types';

interface ChatWindowProps {
  friends: FriendType[];
  chatId: string | null;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ friends, chatId, onBack }) => {
  const { messages, rooms } = useChatContext();
  // const chatMessages = messages[chatId] || [];
  const navigate = useNavigate();
  const { user } = useUser();
  const isGroupChat = rooms.some((room: ChatRoomType) => room.chat_room_id === chatId);

  const chatMessages = useMemo(() => {
    if (chatId) {
      return messages[chatId] || [];
    }
  }, [messages, chatId]);

  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const playUnSelectSound = useSound('/sounds/effects/unselect.wav');

  return (
    <div className={`p-0 w-full h-full text-primary backdrop-blur-sm overflow-hidden`}>
      <div className="p-0 h-full w-full flex flex-col flex-1">
        <div className="p-0 flex justify-between items-center ">
          <div className="w-full text-sm bg-primary text-black p-2 gap-2 flex items-center cursor-pointer">
            <NavIconButton
              icon="arrowLeft"
              onClick={() => {
                playUnSelectSound();
                onBack();
              }}
              id="chat-back-button"
              ariaLabel="back to conversations"
            ></NavIconButton>

            {chatId ? (
              (() => {
                const friendData = friends.find((f) => f.user_id === chatId);
                if (!friendData) return null;

                return (
                  <div
                    onClick={() => navigate(`/profile/${chatId}`)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <ProfilePictureSmall user={friendData} avatarUrl={friendData.avatar_url} />
                    <span>{friendData.display_name}</span>
                  </div>
                );
              })() // ← Notice the immediate invocation here
            ) : chatId && isGroupChat ? (
              <span>{rooms.find((room: ChatRoomType) => room.chat_room_id === chatId)?.name}</span>
            ) : null}
          </div>
          <div />
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div ref={messageListRef} className="flex-1 overflow-y-auto">
            <MessageList messages={chatMessages} user={user} isGroupChat={isGroupChat} />
          </div>

          <div className="p-2 border-t flex gap-2">
            <MessageInput chatId={chatId} isGroupChat={isGroupChat} />
          </div>
        </div>
      </div>
    </div>
  );
};
