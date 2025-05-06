import React, { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

// import { logout } from "../auth";  // Ensure your logout function is correctly imported
import { useModal } from '../../contexts/modalContext/ModalContext'; // Importing modal context
import { useUser } from '../../contexts/user/UserContext';
import { Notifications } from '../notifications/Notifications';
import { NavIconButton } from '../UI/buttons/NavIconButton';

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

export const HeaderNav: React.FC = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
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

  return (
    <>
      {user ? (
        <div
          className="flex  gap-3 items-center justify-center w-full"
          aria-label="Navigation menu"
        >
          <NavIconButton
            id="nav-play-button"
            ariaLabel="play"
            icon="play"
            onClick={() => navigate('/gameMenu')}
          ></NavIconButton>
          <NavIconButton
            id="nav-home-button"
            ariaLabel="Home"
            icon="home"
            onClick={() => navigate('/home')}
          />
          <NavIconButton
            id="nav-profile-button"
            ariaLabel="Profile"
            icon="user"
            onClick={() => navigate(`/profile/${localStorage.getItem('userID')}`)}
          />
          <NavIconButton
            id="nav-bell-button"
            ariaLabel="Notifications"
            icon="bell"
            onClick={() => toggleDropdown()}
          />
          <AnimatePresence mode="wait">
            {isDropdownOpen ? (
              <motion.div
                ref={dropdownRef}
                className="absolute h-[200px] right-0 top-15 glass-box p-2 z-50 shadow-black shadow-lg backdrop-blur-md "
                variants={animationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Notifications></Notifications>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <NavIconButton
            id="nav-chat-button"
            ariaLabel="Chat"
            icon="chat"
            onClick={() => navigate('/chat')}
          />
          <NavIconButton
            id="nav-settings-button"
            ariaLabel="Settings"
            icon="settings"
            onClick={() => openModal('settings')}
          />
          {user ? (
            <button
              aria-label="logout"
              onClick={() => {
                logout();
              }}
            >
              <p className="text-xs md:text-md">Log Out</p>
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
