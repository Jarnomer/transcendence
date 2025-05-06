import React from 'react';

import { useLocation } from 'react-router-dom';

import { HeaderNav } from '@components/layout';

import { useMediaQuery } from '@hooks';

export const MobileNavBar: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 600px)');
  const location = useLocation();

  if (isDesktop || location.pathname === '/game' || location.pathname === '/chat') return null;

  return (
    <nav className="fixed bottom-0 w-full z-20 backdrop-blur-md text-primary p-2 border-t border-primary">
      <HeaderNav />
    </nav>
  );
};
