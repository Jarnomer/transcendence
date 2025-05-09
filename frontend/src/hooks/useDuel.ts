import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ChatMessageEvent,
  useGameOptionsContext,
  useModal,
  useNavigationAccess,
  useUser,
  useWebSocketContext,
} from '@contexts';

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

  const handleDuel = (duelEvent: ChatMessageEvent & { queue_id: string }) => {
    console.log('opening modal for duel', duelEvent);
    openModal('joinGameModal', {
      onAccept: () => {
        console.log('joining game..');
        allowInternalNavigation();
        setQueueId(duelEvent.queue_id);
        setLobby('join');
        setMode('1v1');
        setDifficulty('online');
        navigate('/game');
      },
      onDecline: () => {
        console.log('Declining game..');
        const message = {
          type: 'duel_decline',
          payload: {
            queue_id: duelEvent.queue_id,
            sender_id: duelEvent.receiver_id,
            receiver_id: duelEvent.sender_id,
            display_name: user?.display_name,
            avatar_url: user?.avatar_url,
          },
        };
        sendMessage('chat', message);
        cleanup();
      },
      avatarUrl: duelEvent.avatar_url,
      displayName: duelEvent.display_name,
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
