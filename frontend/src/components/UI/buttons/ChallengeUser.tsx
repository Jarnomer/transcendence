import React from 'react';

import { useUser } from '@/contexts/user/UserContext';

import { NavIconButton } from './NavIconButton';

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
    <NavIconButton
      id="challenge-user"
      ariaLabel="challenge user"
      icon="play"
      onClick={() => handleChallengeClick(receiverUserId)}
    />
  );
};
