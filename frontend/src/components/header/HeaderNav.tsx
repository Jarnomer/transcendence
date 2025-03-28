import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

// import { logout } from "../auth";  // Ensure your logout function is correctly imported
import { useUser } from '../../contexts/user/UserContext';
import { useModal } from '../modals/ModalContext'; // Importing modal context
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { Notifications } from '../UI/Notifications';

export const HeaderNav: React.FC = () => {
  const { openModal } = useModal(); // Accessing openModal from modal context
  const navigate = useNavigate();
  const { user, setUser, refetchUser, checkAuth, logout } = useUser();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSettingsClick = () => {
    // Open the settings modal with the desired content
    openModal('settingsModal');
  };

  const handleProfileClick = () => {
    console.log('handle profile click!');
    if (user) {
      openModal('profileModal');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {user && user.display_name ? (
        <div className="flex gap-3 items-center" aria-label="Navigation menu">
          <NavIconButton
            id="nav-home-button"
            aria-label="Home"
            icon="home"
            onClick={() => navigate('/home')}
          />
          <NavIconButton
            id="nav-profile-button"
            aria-label="Profile"
            icon="user"
            onClick={() => navigate(`/profile/${localStorage.getItem('userID')}`)}
          />
          <NavIconButton
            id="nav-bell-button"
            aria-label="Notifications"
            icon="bell"
            onClick={() => toggleDropdown()}
          />
          {isDropdownOpen ? (
            <div className="absolute right-0 top-10 glass-box p-2 opening">
              <Notifications></Notifications>
            </div>
          ) : null}
          <NavIconButton
            id="nav-chat-button"
            aria-label="Chat"
            icon="chat"
            onClick={() => navigate('/chat')}
          />
          <NavIconButton
            id="nav-settings-button"
            aria-label="Settings"
            icon="settings"
            onClick={() => navigate('/settings')}
          />
          {user ? (
            <button
              onClick={() => {
                logout();
              }}
            >
              Log Out
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
