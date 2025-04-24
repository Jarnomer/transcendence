// FloatingChatWrapper.tsx
import { useLocation } from 'react-router-dom';

import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { ChatModal } from '../../modals';
import { FloatingChat } from './FloatingChat';

export const FloatingChatWrapper: React.FC = () => {
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 600px)');

  // Hide on /game
  if (location.pathname === '/game' || location.pathname === '/chat') return null;
  // on mobile chats open as modals or from /chatPage
  if (!isDesktop) return <ChatModal></ChatModal>;
  // on desktop render the chat at bottom of the screen when game is not playing and user is not on the chatpage
  return <FloatingChat />;
};
