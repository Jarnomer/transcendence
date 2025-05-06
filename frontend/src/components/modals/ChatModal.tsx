import React from 'react';

import { useChatContext, useModal } from '@contexts';

import { ChatWindow } from '@components/chat';

import { ModalWrapper } from './ModalWrapper';

export const ChatModal: React.FC = () => {
  const { isModalOpen, getModalProps, closeModal } = useModal();
  const { user } = useChatContext();

  if (!isModalOpen('chatModal')) return null;

  const props = getModalProps('chatModal');
  if (!props) return null;

  const { friends, selectedFriendId } = props;
  console.log(user, friends, selectedFriendId);

  return (
    <ModalWrapper modalName="chatModal">
      <div className="glass-box grow text-primary w-full h-full overflow-hidden">
        <ChatWindow
          key={selectedFriendId}
          chatId={selectedFriendId}
          friends={friends}
          onBack={() => closeModal('chatModal')}
        />
      </div>
    </ModalWrapper>
  );
};
