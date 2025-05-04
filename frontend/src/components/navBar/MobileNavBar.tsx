// components/header/MobileNavBar.tsx
import React from 'react';

import { useLocation } from 'react-router-dom';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import { HeaderNav } from '../header/HeaderNav';

export const MobileNavBar: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 600px)');
  const location = useLocation();

  if (isDesktop || location.pathname === '/game' || location.pathname === '/chat') return null;

  return (
    <nav className="fixed bottom-0 w-full z-50 backdrop-blur-md text-primary p-2 border-t border-primary">
      <HeaderNav />
    </nav>
  );
};
