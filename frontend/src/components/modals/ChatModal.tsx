import React from 'react';

import { useChatContext, useModal } from '@contexts';

import { ChatWindow } from '@components/chat';
import { ModalWrapper } from '@components/modals';

export const ChatModal: React.FC = () => {
  const { isModalOpen, getModalProps, closeModal } = useModal();
  const { setOpenChatWindows } = useChatContext();

  if (!isModalOpen('chatModal')) return null;

  const props = getModalProps('chatModal');
  console.log(props);
  if (!props) return null;
  const { friends, chatId } = props;

  const handleCloseChat = async (chatId: string) => {
    setOpenChatWindows((prev: Record<string, boolean>) => ({
      ...prev,
      [chatId]: false,
    }));

    closeModal('chatModal');
  };

  return (
    <ModalWrapper modalName="chatModal">
      <div className="glass-box grow text-primary w-full h-full overflow-hidden">
        <ChatWindow
          key={chatId}
          chatId={chatId}
          friends={friends}
          onBack={() => handleCloseChat(chatId)}
        />
      </div>
    </ModalWrapper>
  );
};
