import React from "react";

type ButtonOptions = {
  id?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void; 
};

export const ClippedButton: React.FC<{ label: string } & ButtonOptions> = ({
  label,
  id = "",
  type = "button",
  className = "",
  onClick,
}) => {
  return (
    <button
      id={id}
      type={type}
      className={`glitch relative w-[202px] h-[40px] flex items-center justify-center ${className} hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out`}
      onClick={onClick}
    >
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
      <span className="relative text-primary">{label}</span>
    </button>
  );
};
