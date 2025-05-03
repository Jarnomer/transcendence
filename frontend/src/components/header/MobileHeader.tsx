import React from 'react';

import { useLocation } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const location = useLocation();
  if (location.pathname !== '/game' && location.pathname !== '/chat') {
    return (
      <header
        className={`header w-full max-w-screen-xl mx-auto flex-col sm:flex justify-center items-center p-4`}
      >
        <h1 className="logo text-center md:absolute text-lg sm:text-lg md:text-xl lg:text-3xl text-primary">
          Super Pong 3D
        </h1>
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
