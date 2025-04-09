import React from 'react';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../../contexts/user/UserContext';
import { ChatWindow } from '../chat/ChatWindow';
import { ModalWrapper } from './ModalWrapper';

export const ChatModal: React.FC = () => {
  const { isModalOpen, getModalProps, closeModal } = useModal();
  const { setSelectedFriend, setRoomId } = useChatContext();
  const { user } = useUser();

  if (!isModalOpen('chatModal')) return null;

  const props = getModalProps('chatModal');
  if (!props) return null;

  const { friends, selectedFriendId, onSend } = props;
  console.log(user, friends, selectedFriendId);

  return (
    <ModalWrapper modalName="chatModal">
      <div className="glass-box text-primary w-full h-full md:h-[600px] md:max-h-[600px] md:max-w-4xl overflow-hidden">
        <ChatWindow
          user={user}
          friends={friends}
          selectedFriendId={selectedFriendId}
          onBack={() => {
            setSelectedFriend(null);
            setRoomId(null);
            closeModal('chatModal');
          }}
          onSend={onSend}
        />
      </div>
    </ModalWrapper>
  );
};
