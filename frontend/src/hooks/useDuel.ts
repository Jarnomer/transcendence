import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  useGameOptionsContext,
  useModal,
  useNavigationAccess,
  useUser,
  useWebSocketContext,
} from '@contexts';

type DuelPayload = {
  queue_id: string;
  sender_id: string;
  receiver_id: string;
  display_name: string;
  avatar_url: string;
};

export const useDuel = () => {
  const { openModal } = useModal();
  const { setMode, setQueueId, setLobby, setDifficulty } = useGameOptionsContext();
  const { user } = useUser();
  const { cleanup, chatSocket, sendMessage } = useWebSocketContext();
  const navigate = useNavigate();
  const { allowInternalNavigation } = useNavigationAccess();

  const handleDecline = () => {
    console.log('declining duel');
    alert('Duel declined');
    allowInternalNavigation();
    navigate('/gameMenu');
  };

  const handleDuel = (event: DuelPayload) => {
    console.log('opening modal');
    openModal('joinGameModal', {
      onAccept: () => {
        if (!event) return;
        const { queue_id } = event;
        console.log('joining game..');
        allowInternalNavigation();
        setQueueId(queue_id);
        setLobby('join');
        setMode('1v1');
        setDifficulty('online');
        navigate('/game');
      },
      onDecline: () => {
        if (!event) return;
        const { queue_id, sender_id, receiver_id } = event;
        console.log('Declining game..');
        const message = {
          type: 'duel_decline',
          payload: {
            queue_id: queue_id,
            sender_id: receiver_id,
            receiver_id: sender_id,
            display_name: user?.display_name,
            avatar_url: user?.avatar_url,
          },
        };
        sendMessage('chat', message);
        cleanup();
      },
    });
  };

  useEffect(() => {
    console.log('useDuel mounted');
    chatSocket.addEventListener('duel', handleDuel);
    chatSocket.addEventListener('duel_decline', handleDecline);

    return () => {
      console.log('useDuel unmounted');
      chatSocket.removeEventListener('duel', handleDuel);
      chatSocket.removeEventListener('duel_decline', handleDecline);
    };
  }, []);
};
