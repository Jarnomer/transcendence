import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { UserDataResponseType } from '../../../../../shared/types';
import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useUser } from '../../../contexts/user/UserContext';
import { useSound } from '../../../hooks/useSound';
import { NavIconButton } from '../../UI/buttons/NavIconButton';
import { MessageInput } from '../MessageInput';
import { MessageList } from '../MessageList';

interface ChatWindowProps {
  friends: UserDataResponseType[];
  chatId: string | null;
  roomId: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
}

export const FloatingChatWindow: React.FC<ChatWindowProps> = ({
  friends,
  chatId,
  onBack,
  onSend,
}) => {
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const { messages, rooms } = useChatContext();
  // const chatMessages = messages[chatId] || [];
  const navigate = useNavigate();
  const { user } = useUser();
  const isGroupChat = rooms.some((room) => room.chat_room_id === chatId);
  let roomId;

  const chatMessages = useMemo(() => {
    if (chatId) {
      return messages[chatId] || [];
    }
  }, [messages, chatId, roomId]);

  const playUnSelectSound = useSound('/sounds/effects/unselect.wav');
  const playSelectSound = useSound('/sounds/effects/select.wav');

  const playZoomSound = useSound('/sounds/effects/zoom.wav');

  const handleChatMinimize = () => {
    if (!minimized) playUnSelectSound();
    else playSelectSound();
    setMinimized(!minimized);
  };

  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  console.log('isChatroom:', isGroupChat, 'roomId: ', chatId);

  return (
    <div
      className={`p-0 w-[300px]  ${
        minimized ? 'h-12' : 'h-[400px]'
      } flex flex-col glass-box  text-primary backdrop-blur-sm shadow-black shadow-lg
        glass-box`}
    >
      <div className="p-0 h-full w-full flex flex-col flex-1">
        <div className="p-0 flex justify-between items-center ">
          <div
            className="w-full text-sm bg-primary text-black p-2 flex justify-between items-center cursor-pointer"
            onClick={minimized ? handleChatMinimize : undefined}
          >
            {chatId && !isGroupChat ? (
              <span onClick={() => navigate(`/profile/${chatId}`)}>
                {friends.find((f) => f.user_id === chatId)?.display_name}
              </span>
            ) : chatId && isGroupChat ? (
              <span>{rooms.find((room) => room.chat_room_id === chatId).name}</span>
            ) : null}
            <div className="flex items-center gap-2">
              {!minimized && (
                <button onClick={handleChatMinimize} className="text-xs">
                  {'▼'}
                </button>
              )}
              <NavIconButton
                icon="close"
                onClick={() => {
                  playUnSelectSound();
                  onBack();
                }}
                id="chat-back-button"
                ariaLabel="back to conversations"
              ></NavIconButton>
            </div>
          </div>
          <div />
        </div>

        {!minimized && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div ref={messageListRef} className="flex-1 overflow-y-auto">
              <MessageList
                messages={chatMessages}
                user={user}
                chatId={chatId}
                isGroupChat={isGroupChat}
              />
            </div>

            <div className="p-2 border-t flex gap-2">
              <MessageInput chatId={chatId} isGroupChat={isGroupChat} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
