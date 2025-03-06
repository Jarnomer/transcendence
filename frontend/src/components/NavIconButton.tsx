import React from "react";
import { HomeIcon, UserIcon, ChatBubbleLeftIcon, CogIcon, ArrowLeftIcon, XMarkIcon, PauseIcon, PlayIcon, UserPlusIcon } from "@heroicons/react/24/outline";

interface NavIconButtonProps {
  id: string;
  icon: "home" | "user" | "chat" | "settings" | "arrowLeft" | "close" | "play" | "addFriend";
  onClick: () => void;
}

export const NavIconButton: React.FC<NavIconButtonProps> = ({ id, icon, onClick }) => {
  const icons = {
    home: <HomeIcon className="size-6" />,
    user: <UserIcon className="size-6" />,
    chat: <ChatBubbleLeftIcon className="size-6" />,
    settings: <CogIcon className="size-6" />,
    arrowLeft: <ArrowLeftIcon className="w-8 h-8" />,
    close: <XMarkIcon className="w-8 h-8" />,
    pause: <PauseIcon className="w-8 h-8"/>,
    play: <PlayIcon className="w-6 h-6"/>,
    addFriend: <UserPlusIcon className="w-6 h-6"></UserPlusIcon>
  };

  return (
    <button id={id} onClick={onClick}>
      {icons[icon]}
    </button>
  );
};