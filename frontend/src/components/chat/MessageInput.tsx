import React, { useState } from 'react';

import { useChatContext } from '@/contexts/chatContext/ChatContext';

interface MessageInputProps {
  selectedFriendId: string | null;
  roomId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ selectedFriendId, roomId }) => {
  const [newMessage, setNewMessage] = useState('');
  const { sendChatMessage } = useChatContext();

  const handleSendMessage = () => {
    console.log('new message: ', newMessage);
    sendChatMessage(selectedFriendId, roomId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Prevent page refresh
          handleSendMessage(); // Call the send message function
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message input
        </label>
        <input
          type="text"
          id="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border-2 border-primary  rounded focus:outline-none"
        />
        <button type="submit" aria-label="send" className="ml-2 bg-primary/25 px-4 py-2 rounded">
          send
        </button>
      </form>
    </div>
  );
};
