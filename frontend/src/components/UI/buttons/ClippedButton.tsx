import React from 'react';

import { useSound } from '@hooks';

type ButtonOptions = {
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export const ClippedButton: React.FC<{ label: string } & ButtonOptions> = ({
  label,
  id = '',
  type = 'button',
  className = '',
  onClick,
  disabled = false,
}) => {
  const playHoverSound = useSound('/sounds/effects/button_hover.wav');
  const playSubmitSound = useSound('/sounds/effects/button_submit.wav');

  const handleOnClick = () => {
    if (disabled) return;
    playSubmitSound();
    if (onClick) onClick();
  };

  return (
    <button
      id={id}
      type={type}
      className={`relative glitch-svg w-[202px] h-[40px] flex items-center justify-center ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
      } transition-all duration-300 ease-in-out`}
      onClick={handleOnClick}
      onMouseEnter={disabled ? undefined : playHoverSound}
      disabled={disabled}
    >
      {/* SVG with Glitch Effect */}
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 202 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect width="202" height="40" fill="transparent" />
        <path d="M185.664 39.5H0.5V0.5H201.5V26.7605L185.664 39.5Z" stroke="currentColor" />
      </svg>

      {/* Text inside the button */}
      <span className="relative text-primary z-10">{label}</span>
    </button>
  );
};
