import React from "react";
import { HomeIcon, UserIcon, ChatBubbleLeftIcon, CogIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface NavIconButtonProps {
  id: string;
  icon: "home" | "user" | "chat" | "settings" | "arrowLeft";
  onClick: () => void;
}

export const NavIconButton: React.FC<NavIconButtonProps> = ({ id, icon, onClick }) => {
  const icons = {
    home: <HomeIcon className="size-6" />,
    user: <UserIcon className="size-6" />,
    chat: <ChatBubbleLeftIcon className="size-6" />,
    settings: <CogIcon className="size-6" />,
    arrowLeft: <ArrowLeftIcon className="w-8 h-8" />
  };

  return (
    <button id={id} onClick={onClick}>
      {icons[icon]}
    </button>
  );
};