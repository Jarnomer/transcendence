import React from 'react';

import { Message, User } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender?: User;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  console.log(isOwn);
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-2 rounded-xl max-w-xs border-1 ${isOwn ? 'bg-primary/25' : ''}`}>
        <div>{message.message}</div>
      </div>
    </div>
  );
};
