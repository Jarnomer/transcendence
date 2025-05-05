import React, { useEffect, useState } from 'react';

import { useUser } from '@/contexts/user/UserContext';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useModal } from '../../../contexts/modalContext/ModalContext';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { NavIconButton } from './NavIconButton';

interface ChatButtonProps {
  receiverUserId: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ receiverUserId }) => {
  const { user, sentRequests, refetchRequests, refetchUser } = useUser();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { setOpenChatWindows, messages, fetchDmHistory, friends } = useChatContext();
  const isDesktop = useMediaQuery('(min-width: 600px)');
  const { openModal, closeModal } = useModal();
  const { user: loggedInUser } = useUser();

  useEffect(() => {
    if (sentRequests) {
      setIsPending(sentRequests.some((request) => request.receiver_id === receiverUserId));
    }
  }, [sentRequests, receiverUserId, user]);

  const handleChatClick = async (friendId: string) => {
    console.log('opening chat', friendId);
    if (!isDesktop) {
      openModal('chatModal', {
        loggedInUser,
        friends,
        selectedFriendId: receiverUserId,
        onClose: closeModal,
      });
    } else {
      setOpenChatWindows((prev) => ({
        ...prev,
        [friendId]: true,
      }));

      if (!messages[friendId]) {
        await fetchDmHistory(friendId);
      }
    }
  };

  console.log(user?.friends);
  if (user?.friends && !user.friends.some((friend) => friend.user_id === receiverUserId)) {
    console.log('returning null');
    return null;
  }

  return (
    <NavIconButton
      id="send-message"
      ariaLabel="send message"
      icon="chat"
      onClick={(e) => {
        e.stopPropagation();
        handleChatClick(receiverUserId);
      }}
    />
  );
};
