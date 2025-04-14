import React from 'react';

import { Message, User } from '@/lib/types';

import { useUser } from '../../contexts/user/UserContext';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender?: User;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const { user } = useUser();

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1`}>
      {/* Display name on top (for group messages) */}
      {!isOwn && !message.receiver_id && message.room_id && (
        <p className="text-xs text-gray-500 text-center">{message.display_name}</p>
      )}

      {/* Avatar and bubble */}
      <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
            <img src={message.avatar_url} alt="" className="object-contain w-full h-full" />
          </div>
        )}
        <div className={`p-2 rounded-xl max-w-xs border ${isOwn ? 'bg-primary/25' : ''}`}>
          <div>{message.message}</div>
        </div>
      </div>
    </div>
  );
};
