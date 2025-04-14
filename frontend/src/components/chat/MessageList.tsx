import React from 'react';

import { User } from '@/lib/types';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  user: User;
}

export const MessageList: React.FC<MessageListProps> = ({ user }) => {
  const { messageList } = useChatContext();
  console.log(messageList);
  return (
    <div className="flex flex-col overflow-auto w-full h-full max-h-full gap-2 overflow-y-scroll grow p-2 justify-end">
      {messageList.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          isOwn={msg.sender_id === user.user_id}
          sender={msg.sender_id}
        />
      ))}
    </div>
  );
};
