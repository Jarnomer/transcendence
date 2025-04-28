import React from 'react';

import { useUser } from '@/contexts/user/UserContext';

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

  return (
    <button
      id="challenge-user"
      aria-label="challenge user"
      onClick={() => handleChallengeClick(receiverUserId)}
    >
      <ChallengeIcon></ChallengeIcon>
    </button>
  );
};
