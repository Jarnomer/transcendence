import React from 'react';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { ChatWindow } from '../chat/chatPage/ChatWindow';
import { ModalWrapper } from './ModalWrapper';

export const ChatModal: React.FC = () => {
  const { isModalOpen, getModalProps, closeModal } = useModal();
  const { setSelectedFriend, setRoomId, sendChatMessage, user, messages } = useChatContext();

  if (!isModalOpen('chatModal')) return null;

  const props = getModalProps('chatModal');
  if (!props) return null;

  const { friends, selectedFriendId, onSend } = props;
  console.log(user, friends, selectedFriendId);

  return (
    <ModalWrapper modalName="chatModal">
      <div className="glass-box text-primary md:h-[600px] md:max-h-[600px] min-w-2xl max-w-4xl overflow-hidden">
        <ChatWindow
          messages={messages}
          user={user}
          friends={friends}
          selectedFriendId={selectedFriendId}
          onBack={() => {
            setSelectedFriend(null);
            setRoomId(null);
            closeModal('chatModal');
          }}
          onSend={sendChatMessage}
        />
      </div>
    </ModalWrapper>
  );
};
