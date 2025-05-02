import React from 'react';

import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  user: User;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  user,
  chatId,
  isGroupChat,
}) => {
  console.log('user: ', user);
  console.log(user.user_id);
  console.log(messages);
  // useEffect(() => {
  //   if (selectedFriendId) {
  //     setMessageList(messages[selectedFriendId] || []);
  //   }
  //   if (roomId) {
  //     setMessageList(messages[roomId] || []);
  //   }
  // }, [messages, selectedFriendId, roomId]);

  if (!messages) return;

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
              sender={currentSender}
              isLastOfGroup={isLastOfGroup} // <-- New prop
              isGroupChat={isGroupChat}
            />
          </div>
        );
      })}
    </div>
  );
};
