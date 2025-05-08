import React, { useEffect, useRef, useState } from 'react';

import ReactDOM from 'react-dom';

import { motion } from 'framer-motion';

import { NavIconButton, Notifications } from '@components/UI';

import { useMediaQuery } from '@hooks';

import { useModal, useUser } from '../../../contexts';

const animationVariants = {
  initial: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0% 0 0% 0)',
    opacity: 1,
    transition: { duration: 0.1, ease: 'easeInOut' },
  },
  exit: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
    transition: { duration: 0.1, ease: 'easeInOut' },
  },
};

export const NotificationsButton: React.FC = () => {
  const { user } = useUser();
  const isDesktop = useMediaQuery('(min-width: 600px)');
  const { openModal } = useModal();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const appContainer = document.getElementById('app-content');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleNotificationClick = () => {
    console.log('handle notification click');
    if (!isDesktop) {
      openModal('notifications');
      return;
    }

    if (!isDropdownOpen) setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!user || !appContainer) return;

  return (
    <>
      <NavIconButton
        id="nav-bell-button"
        ariaLabel="Notifications"
        icon="bell"
        onClick={handleNotificationClick}
      />

      {isDropdownOpen &&
        ReactDOM.createPortal(
          <motion.div
            ref={dropdownRef}
            className="absolute h-[200px] right-0 top-0 z-50 backdrop-blur-md"
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Notifications />
          </motion.div>,
          appContainer
        )}
    </>
  );
};
