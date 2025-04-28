import React from 'react';

import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  user: User;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  user,
  selectedFriendId,
  roomId,
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

  return (
    <div className="flex flex-col  w-full  gap-2  grow p-2 ">
      {messages.map((msg, i) => (
        <div key={i} className="">
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
