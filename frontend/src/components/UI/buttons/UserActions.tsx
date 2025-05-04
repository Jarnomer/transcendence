import React from 'react';

import { useUser } from '../../../contexts/user/UserContext';
import { AddFriend } from './AddFriend';
import { ChallengeButton } from './ChallengeUser';
import { ChatButton } from './ChatButton';
import { NavIconButton } from './NavIconButton';

export const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  const { user: loggedInUser, setUser, refetchUser } = useUser();

  const isOwnProfile = user?.user_id === loggedInUser?.user_id;

  const handleBlockUserClick = (user_id: string) => {
    console.log('Blocking user: ', user_id);
  };
  if (!user || isOwnProfile) return;

  return (
    <div className="flex gap-2">
      <AddFriend receiverUserId={user.user_id} />
      <ChallengeButton receiverUserId={user.user_id}></ChallengeButton>
      <ChatButton receiverUserId={user.user_id}></ChatButton>
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
