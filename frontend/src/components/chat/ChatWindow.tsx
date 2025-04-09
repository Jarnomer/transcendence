import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { UserDataResponseType } from '../../../../shared/types';
import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  user: UserDataResponseType;
  friends: UserDataResponseType[];
  selectedFriendId: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  user,
  friends,
  selectedFriendId,
  roomId,
  onBack,
  onSend,
}) => {
  const [input, setInput] = useState('');
  const { messages } = useChatContext();
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col flex-1">
      <div className="p-2 border-b flex justify-between items-center ">
        <button className="text-sm text-gray-500" onClick={onBack}>
          Back
        </button>
        <div className="text-lg font-semibold">
          {selectedFriendId ? (
            <span onClick={() => navigate(`/profile/${selectedFriendId}`)}>
              {friends.find((f) => f.user_id === selectedFriendId)?.display_name}
            </span>
          ) : (
            'Room Chat'
          )}
        </div>
        <div />
      </div>
      <MessageList messages={messages} user={user} friends={friends} />
      <div className="p-2 border-t flex gap-2">
        <MessageInput selectedFriendId={selectedFriendId} roomId={roomId}></MessageInput>
      </div>
    </div>
  );
};
