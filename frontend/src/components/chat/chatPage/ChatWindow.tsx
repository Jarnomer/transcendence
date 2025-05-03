import React, { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { UserDataResponseType } from '../../../../../shared/types';
import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useUser } from '../../../contexts/user/UserContext';
import { useSound } from '../../../hooks/useSound';
import { NavIconButton } from '../../UI/buttons/NavIconButton';
import { MessageInput } from '../MessageInput';
import { MessageList } from '../MessageList';

interface ChatWindowProps {
  messages: any[];
  user: any;
  friends: UserDataResponseType[];
  chatId: string | null;
  roomId: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ friends, chatId, roomId, onBack }) => {
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const { messages, rooms } = useChatContext();
  // const chatMessages = messages[chatId] || [];
  const navigate = useNavigate();
  const { user } = useUser();
  const isGroupChat = rooms.some((room) => room.chat_room_id === chatId);

  const chatMessages = useMemo(() => {
    if (roomId) {
      return messages[roomId] || [];
    }
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

  console.log(roomId);
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
            ) : (
              roomId
            )}
          </div>
          <div />
        </div>

        <MessageList
          messages={chatMessages}
          user={user}
          chatId={chatId}
          isGroupChat={isGroupChat}
        />
        <div className="p-2 border-t flex gap-2">
          <MessageInput chatId={chatId} isGroupChat={isGroupChat}></MessageInput>
        </div>
      </div>
    </div>
  );
};
