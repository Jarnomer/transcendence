import React from "react";
import { HeaderNav } from "./HeaderNav";
import { useContext } from "react";
import { IsLoggedInContext } from "../app";

interface HeaderProps {
	isGameRunning: boolean;
  }
  
  export const Header: React.FC<HeaderProps> = ({isGameRunning}) => {

  return (
	  <header className={`header z-10 relative w-full flex justify-center items-center p-2 ${!isGameRunning ? 'pb-7' : ''}`}>
	
      
	{!isGameRunning ? <h1 className="logo text-lg sm:text-lg md:text-xl lg:text-3xl text-primary md:absolute">Super Pong 3D</h1>: null}
      <HeaderNav />
    {!isGameRunning ? <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full">
        <svg className="w-full text-primary" viewBox="0 0 1438 29" fill="none">
          <path d="M0.5 2H481L506.5 27.5H929.5L955 2H1438" stroke="currentColor" className="stroke-2" />
        </svg>
      </div> : null}  
    </header>
  );
};
