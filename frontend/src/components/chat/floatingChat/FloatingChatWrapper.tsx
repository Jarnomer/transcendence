// FloatingChatWrapper.tsx
import { useLocation } from 'react-router-dom';

import { FloatingChat } from '@components/chat';
import { ChatModal } from '@components/modals';

import { useMediaQuery } from '@hooks';

export const FloatingChatWrapper: React.FC = () => {
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 600px)');

  // Hide on /game
  if ((location.pathname === '/game' || location.pathname === '/chat') && isDesktop) return null;
  // on mobile chats open as modals or from /chatPage
  if (!isDesktop) return <ChatModal></ChatModal>;
  // on desktop render the chat at bottom of the screen when game is not playing and user is not on the chatpage
  return <FloatingChat />;
};
