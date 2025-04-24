import React from 'react';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { ChatWindow } from '../chat/chatPage/ChatWindow';
import { ModalWrapper } from './ModalWrapper';

export const ChatModal: React.FC = () => {
  const { isModalOpen, getModalProps, closeModal } = useModal();
  const { setSelectedFriend, setRoomId, sendChatMessage, user } = useChatContext();

  if (!isModalOpen('chatModal')) return null;

  const props = getModalProps('chatModal');
  if (!props) return null;

  const { friends, selectedFriendId, onBack } = props;
  console.log(user, friends, selectedFriendId);

  return (
    <ModalWrapper modalName="chatModal">
      <div className="glass-box grow text-primary w-full h-full overflow-hidden">
        <ChatWindow
          key={selectedFriendId}
          friends={friends}
          selectedFriendId={selectedFriendId}
          onBack={onBack}
        />
      </div>
    </ModalWrapper>
  );
};
