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
  selectedFriendId: string | null;
  roomId: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  friends,
  selectedFriendId,
  roomId,
  onBack,
  onSend,
}) => {
  const [input, setInput] = useState('');
  const { messages } = useChatContext();
  const navigate = useNavigate();
  const { user } = useUser();
  const playUnSelectSound = useSound('/sounds/effects/unselect.wav');

  const chatMessages = useMemo(() => {
    if (roomId) {
      return messages[roomId] || [];
    }
    if (selectedFriendId) {
      return messages[selectedFriendId] || [];
    }
  }, [messages, selectedFriendId, roomId]);

  console.log(roomId);
  return (
    <div className="h-full w-full flex flex-col flex-1">
      <div className="p-2 border-b flex justify-between items-center ">
        <NavIconButton
          icon="arrowLeft"
          onClick={() => {
            playUnSelectSound();
            onBack();
          }}
          id="chat-back-button"
          ariaLabel="back to conversations"
        ></NavIconButton>
        <div className="text-sm">
          {selectedFriendId ? (
            <span onClick={() => navigate(`/profile/${selectedFriendId}`)}>
              {friends.find((f) => f.user_id === selectedFriendId)?.display_name}
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
        selectedFriendId={selectedFriendId}
        roomId={roomId}
      />
      <div className="p-2 border-t flex gap-2">
        <MessageInput selectedFriendId={selectedFriendId} roomId={roomId}></MessageInput>
      </div>
    </div>
  );
};
