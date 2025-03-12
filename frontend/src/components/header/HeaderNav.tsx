import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { useModal } from '../modals/ModalContext'; // Importing modal context
// import { logout } from "../auth";  // Ensure your logout function is correctly imported
import { useAnimatedNavigate } from '../../animatedNavigate';
import { IsLoggedInContext } from '../../app'; // Ensure IsLoggedInContext is correctly imported

export const HeaderNav: React.FC = () => {
  const { openModal } = useModal(); // Accessing openModal from modal context
  const navigate = useNavigate();
  const animatedNavigate = useAnimatedNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isLoggedInContext = useContext(IsLoggedInContext)!;
  const { isLoggedIn, setIsLoggedIn, logout } = isLoggedInContext;

  const handleSettingsClick = () => {
    // Open the settings modal with the desired content
    openModal('settingsModal');
  };

  const handleProfileClick = () => {
    console.log('handle profile click!');
    if (isLoggedIn) {
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
        <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg p-2">
          <button
            onClick={() => {
              animatedNavigate('/notifications');
              setIsDropdownOpen(false);
            }}
          >
            Notifications
          </button>
        </div>
      ) : null}
      <NavIconButton id="nav-chat-button" icon="chat" onClick={() => animatedNavigate('/chat')} />
      <NavIconButton
        id="nav-settings-button"
        icon="settings"
        onClick={handleSettingsClick} // Trigger settings modal
      />
      {isLoggedIn ? (
        <button
          onClick={() => {
            logout();
            setIsLoggedIn(false);
          }}
        >
          Log Out
        </button>
      ) : null}
    </div>
  );
};
