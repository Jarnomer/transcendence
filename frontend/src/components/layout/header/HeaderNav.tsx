import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useModal, useUser } from '@contexts';

import { NavIconButton, NotificationsButton } from '@components/UI';

export const HeaderNav: React.FC = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  return (
    <>
      {user ? (
        <nav
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

          <NotificationsButton></NotificationsButton>

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
        </nav>
      ) : null}
    </>
  );
};
