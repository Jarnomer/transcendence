import React from 'react';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useModal } from '../../../contexts/modalContext/ModalContext';
import { useUser } from '../../../contexts/user/UserContext';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { acceptFriendRequest, sendFriendRequest } from '../../../services/friendService';
import { AddFriend } from './AddFriend';
import { ChallengeButton } from './ChallengeUser';
import { NavIconButton } from './NavIconButton';

export const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  const { user: loggedInUser, setUser, refetchUser } = useUser();
  const { setOpenChatWindows, messages, fetchDmHistory, friends } = useChatContext();
  const isDesktop = useMediaQuery('(min-width: 600px)');
  const { openModal, closeModal } = useModal();
  const handleAddFriendClick = (user_id: string) => {
    if (
      loggedInUser?.friend_requests &&
      loggedInUser.friend_requests.some((req) => req.user_id === user?.user_id)
    ) {
      console.log('ACCEPTING FRIEND REQUEST');
      acceptFriendRequest(user_id)
        .then(() => {
          console.log('Friend request accepted');
          refetchUser();
        })
        .catch((error) => {
          console.error('Failed to accept friend request: ', error);
        });
    } else {
      console.log('Sending friend request to user: ', user_id);
      sendFriendRequest(user_id);
    }
  };

  const handleChatClick = async (friendId: string) => {
    console.log('opening chat', friendId);
    if (!isDesktop) {
      openModal('chatModal', {
        loggedInUser,
        friends,
        selectedFriendId: user?.user_id,
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

  const handleBlockUserClick = (user_id: string) => {
    console.log('Blocking user: ', user_id);
  };
  if (!user) return;
  return (
    <div className="flex gap-2">
      <AddFriend receiverUserId={user.user_id} onClick={() => handleAddFriendClick(user.user_id)} />
      <ChallengeButton receiverUserId={user.user_id}></ChallengeButton>
      <NavIconButton
        id="send-message"
        ariaLabel="send message"
        icon="chat"
        onClick={(e) => {
          e.stopPropagation();
          handleChatClick(user.user_id);
        }}
      />
      <NavIconButton
        id="block-user"
        ariaLabel="block user"
        icon="block"
        onClick={(e) => {
          e.stopPropagation();
          handleBlockUserClick(user.user_id);
        }}
      />
    </div>
  );
};
