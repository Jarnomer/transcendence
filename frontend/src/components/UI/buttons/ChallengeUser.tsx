import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext } from '@/contexts/gameContext/GameOptionsContext';
import { useNavigationAccess } from '@/contexts/navigationAccessContext/NavigationAccessContext';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

import { useUser } from '@contexts';

import { iconSizeResponsive } from '@components/UI';
import { ChallengeIcon } from '@components/visual';

interface ChallengeButtonProps {
  receiverUserId: string;
}

export const ChallengeButton: React.FC<ChallengeButtonProps> = ({ receiverUserId }) => {
  const { user } = useUser();
  const { setLobby, setMode, setDifficulty, setQueueId } = useGameOptionsContext();
  const { sendMessage } = useWebSocketContext();
  const navigate = useNavigate();
  const { allowInternalNavigation } = useNavigationAccess();

  // console.log(receiverUserId);

  const generateQueueId = (userId: string, receiverUserId: string) => {
    const sortedIds = [userId, receiverUserId].sort();
    return `${sortedIds[0]}-${sortedIds[1]}`;
  };

  const handleChallengeClick = async (receiverUserId: string) => {
    if (!user) return;
    console.log('challenged ', receiverUserId, ' to a duel!');
    const queueId = generateQueueId(user?.user_id, receiverUserId);
    setQueueId(queueId);
    const message = {
      type: 'duel',
      payload: {
        queue_id: queueId,
        sender_id: user.user_id,
        receiver_id: receiverUserId,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
    };
    sendMessage('chat', message);
    setLobby('join');
    setMode('1v1');
    setDifficulty('online');
    allowInternalNavigation();
    navigate('/game');
  };

  // console.log(user?.friends);
  if (user?.friends && !user.friends.some((friend) => friend.user_id === receiverUserId)) {
    console.log('returning null');
    return null;
  }

  return (
    <button
      className={` ${iconSizeResponsive} p-0.5 hover:text-secondary`}
      id="challenge-user"
      aria-label="challenge user"
      onClick={(e) => {
        e.stopPropagation();
        handleChallengeClick(receiverUserId);
      }}
    >
      <ChallengeIcon></ChallengeIcon>
    </button>
  );
};
