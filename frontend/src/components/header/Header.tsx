import React from 'react';

import { useLocation } from 'react-router-dom';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import { HeaderNav } from './HeaderNav';
import { MobileHeader } from './MobileHeader';

export const Header: React.FC = () => {
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 600px)');

  if (!isDesktop) {
    return <MobileHeader></MobileHeader>;
  }
  if (location.pathname !== '/game') {
    return (
      <header
        className={`header w-full max-w-screen-xl mx-auto flex-col sm:flex justify-center items-center p-4`}
      >
        <h1 className="logo text-center md:absolute text-lg sm:text-lg md:text-xl lg:text-3xl text-primary">
          Super Pong 3D
        </h1>

        <div className="ml-0 md:ml-auto relative">
          <HeaderNav />
        </div>
      </header>
    );
  }
  //   return (
  //     <header className={`header z-10  w-full flex justify-center items-center p-2`}>
  //       <HeaderNav />
  //     </header>
  //   );
  // }
};
