import React from 'react';

import { User } from '@/lib/types';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  user: User;
  friends: User[];
}

export const MessageList: React.FC<MessageListProps> = ({ user, friends }) => {
  const { messages } = useChatContext();
  console.log(friends);
  console.log(messages);
  return (
    <div className="flex flex-col overflow-auto w-full h-full max-h-full gap-2 overflow-y-scroll grow p-2 justify-end">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          isOwn={msg.sender_id === user.user_id}
          sender={friends.find((f) => f.user_id === msg.sender_id)}
        />
      ))}
    </div>
  );
};
