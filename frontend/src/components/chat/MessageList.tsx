import React from 'react';

import { User } from '@/lib/types';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  user: User;
}

export const MessageList: React.FC<MessageListProps> = ({ user }) => {
  const { messages } = useChatContext();
  console.log('user: ', user);
  console.log(messages);

  return (
    <div className="flex flex-col overflow-auto w-full h-full max-h-full gap-2 overflow-y-scroll grow p-2 justify-end">
      {messages.map((msg, i) => (
        <div key={msg.msg_id} className="">
          <MessageBubble
            message={msg}
            isOwn={msg.sender_id === user.user_id}
            sender={msg.sender_id}
            
          />
        </div>
      ))}
    </div>
  );
};
