import React from 'react';

import { useLocation } from 'react-router-dom';

import { HeaderNav } from './HeaderNav';

export const Header: React.FC = () => {
  const location = useLocation();

  if (location.pathname !== '/game') {
    return (
      <header
        className={`header z-10 relative w-full flex-col sm:flex justify-center items-center p-2 pb-7`}
      >
        <h1 className="logo text-center md:absolute text-lg sm:text-lg md:text-xl lg:text-3xl text-primary">
          Super Pong 3D
        </h1>
        <div className="ml-0 md:ml-auto  pb-2">
          <HeaderNav />
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full hidden md:block"
        >
          <svg className="w-full text-primary" viewBox="0 0 1438 29" fill="none">
            <defs>
              <clipPath id="header-bottomline">
                <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
              </clipPath>
            </defs>

            <path
              d="M0.5 2H481L506.5 27.5H929.5L955 2H1438"
              stroke="currentColor"
              className="stroke-2"
            />
          </svg>
        </div>
      </header>
    );
  } else {
    return (
      <header className={`header z-10 relative w-full flex justify-center items-center p-2`}>
        <HeaderNav />
      </header>
    );
  }
};
