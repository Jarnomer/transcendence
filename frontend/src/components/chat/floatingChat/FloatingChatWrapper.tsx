// FloatingChatWrapper.tsx
import { useLocation } from 'react-router-dom';

import { FloatingChat } from './FloatingChat';

export const FloatingChatWrapper: React.FC = () => {
  const location = useLocation();

  // Hide on /game
  if (location.pathname === '/game') return null;

  return <FloatingChat />;
};
