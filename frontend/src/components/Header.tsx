import React from "react";
import { HeaderNav } from "./HeaderNav";

interface HeaderProps {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  export const Header: React.FC<HeaderProps> = ({isLoggedIn, setIsLoggedIn}) => {
  return (
    <header className="header relative w-screen flex justify-center items-center p-2 pb-7">
      <h1 className="logo text-3xl text-primary absolute">Super Pong 3D</h1>
      <HeaderNav isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1000px] md:w-[1200px] lg:w-[1438px]">
        <svg className="w-[1438px] text-primary" viewBox="0 0 1438 29" fill="none">
          <path d="M0.5 2H481L506.5 27.5H929.5L955 2H1438" stroke="currentColor" className="stroke-2" />
        </svg>
      </div>
    </header>
  );
};
