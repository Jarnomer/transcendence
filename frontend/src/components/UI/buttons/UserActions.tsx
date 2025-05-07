import React from 'react';

import { useUser } from '@contexts';

import { AddFriend, ChallengeButton, ChatButton, NavIconButton } from '@components/UI';

import { blockUser } from '@services';

import { UserDataResponseType } from '@shared/types';

interface UserActionsProps {
  user: UserDataResponseType;
}

export const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  const { user: loggedInUser } = useUser();

  const isOwnProfile = user?.user_id === loggedInUser?.user_id;

  const handleBlockUserClick = async (user_id: string) => {
    console.log('Blocking user: ', user_id);
    await blockUser(user_id);
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
