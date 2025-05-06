import React, { useState } from 'react';

import { useChatContext } from '@/contexts';

import { NavIconButton } from '@components/UI';

interface MessageInputProps {
  chatId: string | null;
  isGroupChat: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ chatId, isGroupChat }) => {
  const [newMessage, setNewMessage] = useState('');
  const { sendChatMessage } = useChatContext();

  const handleSendMessage = () => {
    if (!isGroupChat) {
      sendChatMessage(chatId, null, newMessage);
    } else {
      sendChatMessage(null, chatId, newMessage);
    }
    setNewMessage('');
  };

  return (
    <div className="flex gap-2 w-full flex-grow">
      <form
        className="w-full flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message input
        </label>

        {/* This will take all remaining space */}
        <input
          type="text"
          id="chat-input"
          autoComplete="off"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-xs p-2 border-2 border-primary rounded focus:outline-none"
        />

        {/* Fixed-size icon button */}
        <NavIconButton id="send-message" icon="Send" ariaLabel="send" onClick={handleSendMessage} />
      </form>
    </div>
  );
};
