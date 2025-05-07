import React from 'react';

import { useChatContext, useModal, useUser } from '@contexts';

import { NavIconButton } from '@components/UI';

import { useMediaQuery } from '@hooks';

interface ChatButtonProps {
  receiverUserId: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ receiverUserId }) => {
  const { user } = useUser();
  const { setOpenChatWindows, messages, fetchDmHistory, friends } = useChatContext();
  const isDesktop = useMediaQuery('(min-width: 600px)');
  const { openModal } = useModal();

  const handleChatClick = async (friendId: string) => {
    console.log('opening chat', friendId);

    setOpenChatWindows((prev: Record<string, boolean>) => ({
      ...prev,
      [friendId]: true,
    }));

    if (!messages[friendId]) {
      await fetchDmHistory(friendId);
    }

    if (!isDesktop) {
      openModal('chatModal', {
        friends,
        chatId: receiverUserId,
      });
    }
  };

  if (user?.friends && !user.friends.some((friend) => friend.user_id === receiverUserId)) {
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
