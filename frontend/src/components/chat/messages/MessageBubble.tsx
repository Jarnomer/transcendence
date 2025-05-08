import React from 'react';

import { ChatMessageType } from '@shared/types';

interface MessageBubbleProps {
  message: ChatMessageType;
  isOwn: boolean;
  isLastOfGroup: boolean;
  isGroupChat: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  isLastOfGroup,
  isGroupChat,
}) => {
  return (
    <div className={`flex flex-col text-secondary ${isOwn ? 'items-end' : 'items-start'} gap-1`}>
      {/* Avatar and bubble */}
      <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && isLastOfGroup && (
          <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
            <img src={message.avatar_url} alt="" className="object-contain w-full h-full" />
          </div>
        )}
        <div
          className={`relative ${!isOwn && !isLastOfGroup && 'pl-[22px]'}  ${isOwn ? 'bg-primary/25' : ''}`}
        >
          <p className="text-xs border-1 border-primary p-2 break-all whitespace-pre-wrap normal-case">
            {message.message}
          </p>
          {!isOwn && isGroupChat && isLastOfGroup && (
            <span className="text-[8px] text-gray-500">{message.display_name}</span>
          )}
        </div>
      </div>
    </div>
  );
};
