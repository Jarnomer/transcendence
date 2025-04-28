import React from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  CogIcon,
  HomeIcon,
  NoSymbolIcon,
  PaperAirplaneIcon,
  PauseIcon,
  PencilSquareIcon,
  PlayIcon,
  UserGroupIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { useSound } from '../../../hooks/useSound';

interface NavIconButtonProps {
  id: string;
  ariaLabel: string;
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
    | 'block'
    | 'PencilSquareIcon'
    | 'UserGroupIcon'
    | 'Send';
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const iconSizeResponsive = 'size-4 sm:size-6 ';

export const NavIconButton: React.FC<NavIconButtonProps> = ({ id, icon, onClick, ariaLabel }) => {
  const icons = {
    home: <HomeIcon className={iconSizeResponsive} />,
    user: <UserIcon className={iconSizeResponsive} />,
    chat: <ChatBubbleLeftIcon className={iconSizeResponsive} />,
    settings: <CogIcon className={iconSizeResponsive} />,
    arrowLeft: <ArrowLeftIcon className={iconSizeResponsive} />,
    arrowRight: <ArrowRightIcon className={iconSizeResponsive} />,
    close: <XMarkIcon className={iconSizeResponsive} />,
    pause: <PauseIcon className={iconSizeResponsive} />,
    play: <PlayIcon className={iconSizeResponsive} />,
    addFriend: <UserPlusIcon className={iconSizeResponsive}></UserPlusIcon>,
    removeFriend: <UserMinusIcon className={iconSizeResponsive}></UserMinusIcon>,
    block: <NoSymbolIcon className={iconSizeResponsive}></NoSymbolIcon>,
    bell: <BellIcon className={iconSizeResponsive}></BellIcon>,
    checkCircle: <CheckCircleIcon className={iconSizeResponsive}></CheckCircleIcon>,
    xCircle: <XCircleIcon className={iconSizeResponsive}></XCircleIcon>,
    PencilSquareIcon: <PencilSquareIcon className={`w-full h-full`}></PencilSquareIcon>,
    UserGroupIcon: <UserGroupIcon className={`w-full h-full`}></UserGroupIcon>,
    Send: <PaperAirplaneIcon className={iconSizeResponsive}></PaperAirplaneIcon>,
  };

  const playSelectSound = useSound('/sounds/effects/select.wav');
  return (
    <button
      className="hover:text-secondary "
      id={id}
      onClick={(event) => {
        playSelectSound();
        onClick(event); // forward the click event
      }}
      aria-label={ariaLabel}
    >
      {icons[icon]}
    </button>
  );
};
