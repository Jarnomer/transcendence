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
  PauseIcon,
  PlayIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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
    | 'block';
  onClick: () => void;
}

const iconSizeResponsive = 'size-4 sm:size-6';

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
  };

  return (
    <button className="" id={id} onClick={onClick} aria-label={ariaLabel}>
      {icons[icon]}
    </button>
  );
};
