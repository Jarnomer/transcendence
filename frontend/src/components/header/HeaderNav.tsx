import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

// import { logout } from "../auth";  // Ensure your logout function is correctly imported
import { useAnimatedNavigate } from '../../animatedNavigate';
import { useUser } from '../../contexts/user/UserContext';
import { useModal } from '../modals/ModalContext'; // Importing modal context
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { Notifications } from '../UI/Notifications';

export const HeaderNav: React.FC = () => {
  const { openModal } = useModal(); // Accessing openModal from modal context
  const navigate = useNavigate();
  const animatedNavigate = useAnimatedNavigate();
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
      animatedNavigate('/login');
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <NavIconButton
        id="nav-game-button"
        icon="play"
        onClick={() => animatedNavigate('/gameMenu')}
      />
      <NavIconButton id="nav-home-button" icon="home" onClick={() => animatedNavigate('/home')} />
      <NavIconButton
        id="nav-profile-button"
        icon="user"
        onClick={() => animatedNavigate(`/profile/${localStorage.getItem('userID')}`)}
      />
      <NavIconButton id="nav-bell-button" icon="bell" onClick={() => toggleDropdown()} />
      {isDropdownOpen ? (
        <div className="absolute right-0 top-10 glass-box p-2 opening">
          <Notifications></Notifications>
        </div>
      ) : null}
      <NavIconButton id="nav-chat-button" icon="chat" onClick={() => animatedNavigate('/chat')} />
      <NavIconButton
        id="nav-settings-button"
        icon="settings"
        onClick={handleSettingsClick} // Trigger settings modal
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
  );
};
