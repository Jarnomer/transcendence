import React from 'react';

import { MessageBubble } from '@components/chat';

import { ChatMessageType, UserResponseType } from '@shared/types';

interface MessageListProps {
  user: UserResponseType | null;
  messages: ChatMessageType[];
  isGroupChat: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, user, isGroupChat }) => {
  if (!messages || !user) return;

  return (
    <div className="flex flex-col  w-full  gap-2  grow p-2 ">
      {messages.map((msg, i) => {
        const currentSender = msg.sender_id;
        const nextSender = messages[i + 1]?.sender_id;
        const isLastOfGroup = currentSender !== nextSender;

        return (
          <div key={i}>
            <MessageBubble
              message={msg}
              isOwn={currentSender === user.user_id}
              isLastOfGroup={isLastOfGroup}
              isGroupChat={isGroupChat}
            />
          </div>
        );
      })}
    </div>
  );
};
