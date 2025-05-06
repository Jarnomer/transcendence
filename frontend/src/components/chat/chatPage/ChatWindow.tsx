import React, { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useChatContext, useUser } from '@contexts';

import { MessageInput, MessageList } from '@components/chat';
import { NavIconButton } from '@components/UI';

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

  const playUnSelectSound = useSound('/sounds/effects/unselect.wav');

  return (
    <div className={`p-0 w-full h-full max-h-fit text-primary backdrop-blur-sm overflow-hidden`}>
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
              <span onClick={() => navigate(`/profile/${chatId}`)}>
                {friends.find((f) => f.user_id === chatId)?.display_name}
              </span>
            ) : chatId && isGroupChat ? (
              <span>{rooms.find((room: ChatRoomType) => room.chat_room_id === chatId).name}</span>
            ) : null}
          </div>
          <div />
        </div>

        <MessageList messages={chatMessages} user={user} isGroupChat={isGroupChat} />
        <div className="p-2 border-t flex gap-2">
          <MessageInput chatId={chatId} isGroupChat={isGroupChat}></MessageInput>
        </div>
      </div>
    </div>
  );
};
