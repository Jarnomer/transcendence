import React from 'react';

import { useUser } from '@contexts';

import { iconSizeResponsive } from '@components/UI';

import { ChallengeIcon } from '../../visual/svg/icons/ChallengeIcon';

interface ChallengeButtonProps {
  receiverUserId: string;
}

export const ChallengeButton: React.FC<ChallengeButtonProps> = ({ receiverUserId }) => {
  const { user } = useUser();

  console.log(receiverUserId);

  const handleChallengeClick = async (receiverUserId: string) => {
    console.log('challenged ', receiverUserId, ' to a duel!');
  };

  console.log(user?.friends);
  if (user?.friends && !user.friends.some((friend) => friend.user_id === receiverUserId)) {
    console.log('returning null');
    return null;
  }

  return (
    <button
      className={` ${iconSizeResponsive} p-0.5 hover:text-secondary`}
      id="challenge-user"
      aria-label="challenge user"
      onClick={() => handleChallengeClick(receiverUserId)}
    >
      <ChallengeIcon></ChallengeIcon>
    </button>
  );
};
