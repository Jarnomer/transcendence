import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  CogIcon,
  HomeIcon,
  NoSymbolIcon,
  PauseIcon,
  PlayIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

interface NavIconButtonProps {
  id: string;
  icon:
    | 'home'
    | 'user'
    | 'chat'
    | 'settings'
    | 'arrowLeft'
    | 'arrowRight'
    | 'close'
    | 'play'
    | 'addFriend'
    | 'removeFriend'
    | 'bell'
    | 'checkCircle'
    | 'xCircle'
    | 'block';
  onClick: () => void;
}

export const NavIconButton: React.FC<NavIconButtonProps> = ({ id, icon, onClick }) => {
  const icons = {
    home: <HomeIcon className="size-6" />,
    user: <UserIcon className="size-6" />,
    chat: <ChatBubbleLeftIcon className="size-6" />,
    settings: <CogIcon className="size-6" />,
    arrowLeft: <ArrowLeftIcon className="w-8 h-8" />,
    arrowRight: <ArrowRightIcon className="size-6" />,
    close: <XMarkIcon className="w-8 h-8" />,
    pause: <PauseIcon className="w-8 h-8" />,
    play: <PlayIcon className="w-6 h-6" />,
    addFriend: <UserPlusIcon className="w-6 h-6"></UserPlusIcon>,
    removeFriend: <UserMinusIcon className="w-6 h-6"></UserMinusIcon>,
    block: <NoSymbolIcon className="w-6 h-6"></NoSymbolIcon>,
    bell: <BellIcon className="w-6 h-6"></BellIcon>,
    checkCircle: <CheckCircleIcon className="w-6 h-6"></CheckCircleIcon>,
    xCircle: <XCircleIcon className="w-6 h-6"></XCircleIcon>,
  };

  return (
    <button className="" id={id} onClick={onClick}>
      {icons[icon]}
    </button>
  );
};
