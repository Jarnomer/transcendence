import React from 'react';

import { useUser } from '../../../contexts/user/UserContext';
import { MessageInput } from '../MessageInput';
import { MessageList } from '../MessageList';

interface RoomChatWindowProps {
  messages: Message[];
  roomId: string;
  members: User[];
  onBack: () => void;
  onSend: (text: string) => void;
}

export const RoomChatWindow: React.FC<RoomChatWindowProps> = ({
  messages,
  roomId,
  members,
  onBack,
  onSend,
}) => {
  const [input, setInput] = React.useState('');
  const { user } = useUser();

  return (
    <div className="w-full md:w-4/5 flex flex-col flex-1">
      <div className="p-2 border-b flex justify-between items-center">
        <button className="text-sm text-gray-500" onClick={onBack}>
          Back
        </button>
        <div className="text-lg font-semibold">Room Chat</div>
      </div>
      <MessageList user={user} friends={members} />
      <MessageInput selectedFriendId={selectedFriendId} roomId={roomId}></MessageInput>
    </div>
  );
};
